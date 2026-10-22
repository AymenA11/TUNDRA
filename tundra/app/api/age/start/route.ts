import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {getDb} from '../../../../db';
import {ageChecks} from '../../../../db/schema';
import {eq} from 'drizzle-orm';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in before verifying your age.'},{status:401});
 const cfg=env as unknown as Record<string,string>;if(cfg.AGE_VERIFICATION_ENABLED!=='true'||!cfg.STRIPE_SECRET_KEY||!cfg.STRIPE_IDENTITY_RESTRICTED_KEY)return Response.json({error:'Age verification is not connected yet. Checkout will remain unavailable until it is ready.'},{status:503});
 try{
 const db=getDb();const existing=(await db.select().from(ageChecks).where(eq(ageChecks.userId,user.userId)))[0];
 if(existing&&existing.verifiedUntil>Date.now()/1000&&existing.mode===(cfg.STRIPE_SECRET_KEY.startsWith('sk_live_')?'live':'test'))return Response.json({verified:true});
 if(existing&&existing.mode===(cfg.STRIPE_SECRET_KEY.startsWith('sk_live_')?'live':'test')){const r=await fetch('https://api.stripe.com/v1/identity/verification_sessions/'+encodeURIComponent(existing.sessionId),{headers:{Authorization:'Bearer '+cfg.STRIPE_SECRET_KEY}});const s=await r.json() as {status:string;url:string|null};if(!r.ok)throw Error();if(s.status==='verified'||s.status==='processing')return Response.json({status:s.status});if(s.url)return Response.json({url:s.url});}
 const p=new URLSearchParams({type:'document',return_url:new URL('/age-check',req.url).href,client_reference_id:user.userId,'options[document][require_matching_selfie]':'true'});
 const r=await fetch('https://api.stripe.com/v1/identity/verification_sessions',{method:'POST',headers:{Authorization:'Bearer '+cfg.STRIPE_SECRET_KEY,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'age-'+user.userId+'-'+Math.floor(Date.now()/86400000)},body:p});
 const s=await r.json() as {id:string;url:string|null};if(!r.ok||!s.url)throw Error();
 await db.insert(ageChecks).values({userId:user.userId,sessionId:s.id,createdAt:Math.floor(Date.now()/1000),mode:cfg.STRIPE_SECRET_KEY.startsWith('sk_live_')?'live':'test',verifiedUntil:0}).onConflictDoUpdate({target:ageChecks.userId,set:{sessionId:s.id,mode:cfg.STRIPE_SECRET_KEY.startsWith('sk_live_')?'live':'test',verifiedUntil:0}});
 return Response.json({url:s.url});
 }catch{return Response.json({error:'Unable to start age verification. Please try again later.'},{status:502})}
}
