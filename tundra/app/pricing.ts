import type {Product} from './catalog';
export const money=(pence:number)=>'£'+(pence/100).toFixed(2);
// Proposed consumer prices, VAT included. Reference snapshot: 21 October 2026.
// PABLO and KILLA use the proposed £4.88 standard tier.
// Brand reference tiers are adjusted to a £3.49/can minimum; these are not live competitor matches.
const reference:Record<string,number[]>={PABLO:[488,2320,4400,8300],KILLA:[488,2320,4400,8300],VELO:[488,2320,4400,8300],ZYN:[488,2320,4400,8300],XQS:[409,1945,3690,6960],CAMO:[349,1660,3150,5940],DENSSI:[399,1900,3600,6800]};
export function bundles(p:Pick<Product,'category'|'brand'>){const r=reference[p.brand];if(!r)return null;const single=Math.max(r[0],399);const three=Math.max(Math.round(single*3*.9),1095);return [1,3,5,10,20].map((quantity,i)=>({quantity,total:i===0?single:i===1?three:Math.max(r[i-1],quantity*349),saving:i===0?0:single*quantity-(i===1?three:Math.max(r[i-1],quantity*349))}));}
export function quantityPrice(p:Pick<Product,'category'|'brand'>,quantity:number){const tiers=bundles(p);if(!tiers)return null;let remaining=Math.max(0,Math.floor(quantity)),total=0;for(const tier of [...tiers].reverse()){const n=Math.floor(remaining/tier.quantity);total+=n*tier.total;remaining%=tier.quantity}return total;}
