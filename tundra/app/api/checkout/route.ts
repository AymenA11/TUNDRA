import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {getDb} from '../../../db';
import {ageChecks} from '../../../db/schema';
import {eq} from 'drizzle-orm';
export async function POST(req:Request){
 const cfg=env as unknown as Record<string,string>;
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 if(!cfg.STRIPE_SECRET_KEY||!cfg.CATALOG_JSON||cfg.STORE_ENABLED!=='true')return Response.json({error:'This collection is not on sale yet. Confirmed products and secure payments are coming soon.'},{status:503});
 try{
 const body=await req.json() as {items:{id:string,quantity:number}[],offerCode?:string};
 if(!Array.isArray(body.items)||!body.items.length||body.items.length>20)throw Error('Invalid bag');
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in before checkout.',next:'/account'},{status:401});
 const age=(await getDb().select().from(ageChecks).where(eq(ageChecks.userId,user.userId)))[0];if(!age||age.verifiedUntil<Date.now()/1000||age.mode!==(cfg.STRIPE_SECRET_KEY.startsWith('sk_live_')?'live':'test'))return Response.json({error:'Verify that you are 18 or older before checkout.',next:'/age-check'},{status:403});
 if(!cfg.STRIPE_SHIPPING_RATE_ID||cfg.AGE_VERIFICATION_ENABLED!=='true')return Response.json({error:'Checkout setup is incomplete.'},{status:503});
 const catalog=JSON.parse(cfg.CATALOG_JSON) as Record<string,{priceId:string}>;
 const params=new URLSearchParams({mode:'payment',success_url:new URL('/order-confirmation?session_id={CHECKOUT_SESSION_ID}',req.url).href,cancel_url:new URL('/shop/category/all',req.url).href,client_reference_id:user.userId,'metadata[age_verified]':'true','customer_email':user.email,'shipping_options[0][shipping_rate]':cfg.STRIPE_SHIPPING_RATE_ID});
 const seen=new Set();for(const [i,item] of body.items.entries()){
 if(item.id.includes('placeholder')||!catalog[item.id]?.priceId?.startsWith('price_')||seen.has(item.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>20)throw Error('Invalid bag');seen.add(item.id);
 params.set(`line_items[${i}][price]`,catalog[item.id].priceId);params.set(`line_items[${i}][quantity]`,String(item.quantity));}
 if(body.offerCode){if(body.offerCode!=='WELCOME10'||!cfg.STRIPE_WELCOME_PROMOTION_ID)return Response.json({error:'The launch offer is not active yet.'},{status:409});params.set('discounts[0][promotion_code]',cfg.STRIPE_WELCOME_PROMOTION_ID);}
 params.set('shipping_address_collection[allowed_countries][0]','GB');
 const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${cfg.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded'},body:params});
 const data=await r.json() as {url?:string};if(!r.ok||!data.url)return Response.json({error:'Checkout is temporarily unavailable.'},{status:502});return Response.json({url:data.url});
 }catch{return Response.json({error:'Please check your bag and try again.'},{status:400})}
}
