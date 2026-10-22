import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from '../chatgpt-auth';
import {getDb} from '../../db';
import {orders,fulfillment} from '../../db/schema';
import {eq,desc} from 'drizzle-orm';
import {money} from '../pricing';

export const dynamic='force-dynamic';

type OrderRow={sessionId:string;amountTotal:number|null;currency:string|null;paymentStatus:string|null;status:string;items:number;createdAt:number};

const statusLabel=(status:string)=>({
 awaiting_shipping_setup:'Awaiting shipping',
 shipped:'Shipped',
 delivered:'Delivered',
 cancelled:'Cancelled',
}[status]||status.replace(/_/g,' '));

const formatDate=(epochSeconds:number)=>new Date(epochSeconds*1000).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});

export default async function Account(){
 const user=await getChatGPTUser();
 let history:OrderRow[]=[];let historyError=false;
 if(user){
  try{
   const rows=await getDb().select({sessionId:fulfillment.sessionId,amountTotal:orders.amountTotal,currency:orders.currency,paymentStatus:orders.paymentStatus,status:fulfillment.status,itemsJson:fulfillment.itemsJson,createdAt:fulfillment.createdAt}).from(fulfillment).leftJoin(orders,eq(fulfillment.sessionId,orders.sessionId)).where(eq(fulfillment.userId,user.userId)).orderBy(desc(fulfillment.createdAt));
   history=rows.map(row=>{
    let items=0;try{const parsed=JSON.parse(row.itemsJson) as {quantity?:number}[];items=Array.isArray(parsed)?parsed.reduce((sum,line)=>sum+(typeof line?.quantity==='number'?line.quantity:1),0):0}catch{}
    return {sessionId:row.sessionId,amountTotal:row.amountTotal,currency:row.currency,paymentStatus:row.paymentStatus,status:row.status,items,createdAt:row.createdAt};
   });
  }catch{historyError=true}
 }
 const currency=(row:OrderRow)=>row.currency?row.currency.toUpperCase():'GBP';
 return <main className="account-page"><a className="logo" href="/">TUNDRA<span>POUCHES. YOUR WAY.</span></a><section className="account-card"><span className="pill">YOUR TUNDRA ACCOUNT</span><h1>{user?'Welcome back.':'Your ritual.\nYour account.'}</h1>{user?<><p>You are signed in as <strong>{user.displayName}</strong>.</p><p>{user.email}</p><section className="order-history"><h2>Order history</h2>{historyError?<div className="account-notice">Order history is unavailable right now. Please try again shortly.</div>:history.length?history.map(order=>(<article className="order-row" key={order.sessionId}><div className="order-reference"><strong>#{order.sessionId.slice(-8).toUpperCase()}</strong><small>{formatDate(order.createdAt)}</small></div><div className="order-detail"><small>{order.items} item{order.items===1?'':'s'}{order.paymentStatus&&order.paymentStatus!=='paid'?` · ${order.paymentStatus}`:''}</small><strong>{order.amountTotal!=null?money(order.amountTotal):'—'} {currency(order)}</strong></div><span className="order-status" data-status={order.status}>{statusLabel(order.status)}</span></article>)):<p className="account-notice">No orders yet. Your orders will appear here once you make your first purchase.</p>}</section><div className="account-notice">Checkout opens once live payment credentials are connected. This app never stores your card details — payment is handled by the provider.</div><a className="cta" href="/">Explore the collection →</a><a className="signout" href={chatGPTSignOutPath('/account')} target="_top">Sign out</a></>:<><p>Sign in securely with ChatGPT to access your TUNDRA account.</p><a className="cta" href={chatGPTSignInPath('/account')} target="_top">Continue with ChatGPT <span>→</span></a><p className="account-notice">Use the sign-in provider’s available methods. TUNDRA never receives or stores your password.</p><a className="signout" href="/">Continue browsing</a></>}</section></main>}
