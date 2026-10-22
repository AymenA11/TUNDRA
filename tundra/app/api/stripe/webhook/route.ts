import {env} from 'cloudflare:workers';
import {getDb} from '../../../../db';
import {orders,fulfillment} from '../../../../db/schema';
export async function POST(req:Request){
 const cfg=env as unknown as Record<string,string>;if(!cfg.STRIPE_WEBHOOK_SECRET||!cfg.STRIPE_SECRET_KEY)return new Response('Not configured',{status:503});
 const raw=await req.text();const header=req.headers.get('stripe-signature')||'';const parts=header.split(',').map(p=>p.trim());const timestamp=parts.find(p=>p.startsWith('t='))?.slice(2);const signatures=parts.filter(p=>p.startsWith('v1=')).map(p=>p.slice(3));
 if(!timestamp||!Number.isFinite(Number(timestamp))||Math.abs(Date.now()/1000-Number(timestamp))>300)return new Response('Invalid signature',{status:400});
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(cfg.STRIPE_WEBHOOK_SECRET),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 let valid=false;for(const s of signatures){if(!/^[a-f0-9]{64}$/.test(s))continue;const bytes=Uint8Array.from(s.match(/../g)!,x=>parseInt(x,16));if(await crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(timestamp+'.'+raw)))valid=true;}
 if(!valid)return new Response('Invalid signature',{status:400});
 try{
 const event=JSON.parse(raw);
 if(cfg.STRIPE_SECRET_KEY.startsWith('sk_live_')&&!event.livemode)return new Response('Mode mismatch',{status:400});
 if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)){
 const s=event.data.object;
 if(s.payment_status==='paid'&&s.metadata?.age_verified==='true'&&s.client_reference_id){
 const shipping=s.collected_information?.shipping_details||s.shipping_details;
 if(!shipping?.address?.line1||!shipping.address.postal_code||shipping.address.country!=='GB')throw Error('Missing shipping address');
 const r=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(s.id)+'/line_items?limit=100',{headers:{Authorization:'Bearer '+cfg.STRIPE_SECRET_KEY}});
 const lines=await r.json() as {data?:unknown[];has_more?:boolean};if(!r.ok||!lines.data||lines.has_more)throw Error();
 const db=getDb();await db.batch([
 db.insert(orders).values({sessionId:s.id,paymentStatus:'paid',amountTotal:s.amount_total,currency:s.currency,createdAt:event.created}).onConflictDoNothing(),
 db.insert(fulfillment).values({sessionId:s.id,userId:s.client_reference_id,customerEmail:s.customer_details?.email||null,recipientJson:JSON.stringify(shipping),itemsJson:JSON.stringify(lines.data),status:'awaiting_shipping_setup',createdAt:event.created}).onConflictDoNothing()
 ]);
 }
 }
 return Response.json({received:true});
 }catch{return new Response('Unable to record event',{status:500})}
}
