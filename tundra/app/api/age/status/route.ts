import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {getDb} from '../../../../db';
import {ageChecks} from '../../../../db/schema';
import {eq} from 'drizzle-orm';
import {isAdult} from '../../../../lib/age';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in to check your verification.'},{status:401});
 const cfg=env as unknown as Record<string,string>;if(cfg.AGE_VERIFICATION_ENABLED!=='true'||!cfg.STRIPE_IDENTITY_RESTRICTED_KEY)return Response.json({verified:false,status:'not_configured'});
 try{
 const db=getDb();const row=(await db.select().from(ageChecks).where(eq(ageChecks.userId,user.userId)))[0];if(!row)return Response.json({verified:false,status:'not_started'});
 if(row.verifiedUntil>Date.now()/1000&&row.mode===(cfg.STRIPE_SECRET_KEY?.startsWith('sk_live_')?'live':'test'))return Response.json({verified:true});
 const r=await fetch('https://api.stripe.com/v1/identity/verification_sessions/'+encodeURIComponent(row.sessionId)+'?expand[]=verified_outputs.dob',{headers:{Authorization:'Bearer '+cfg.STRIPE_IDENTITY_RESTRICTED_KEY}});
 const s=await r.json() as {status:string;client_reference_id:string;livemode:boolean;verified_outputs?:{dob?:{year:number;month:number;day:number}}};if(!r.ok)throw Error();
 if(s.client_reference_id!==user.userId)throw Error();
 if(cfg.STRIPE_SECRET_KEY?.startsWith('sk_live_')&&!s.livemode)throw Error();
 if(s.status!=='verified')return Response.json({verified:false,status:s.status});
 if(!isAdult(s.verified_outputs?.dob))return Response.json({verified:false,status:'not_eligible'});
 await db.update(ageChecks).set({mode:s.livemode?'live':'test',verifiedUntil:Math.floor(Date.now()/1000)+86400}).where(eq(ageChecks.userId,user.userId));
 return Response.json({verified:true});
 }catch{return Response.json({error:'Verification results are unavailable. Please try again later.'},{status:502})}
}
