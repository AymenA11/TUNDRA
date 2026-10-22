import expanded from './catalog-data.json';
export type Product={id:string;name:string;brand:string;note:string;color:string;tag:string;placeholder?:boolean;offer?:{active:boolean;label:string};category:'nicotine'|'nicotine-free'|'caffeine';nicotineMg:number|null;caffeineMg:number;image?:string;description?:string;packCount?:number|null;source?:string};
const zeroProducts:Product[]=[
{id:'velo-bright-zero',name:'Bright Peppermint Zero',brand:'VELO',note:'Peppermint · 0 mg nicotine',color:'#bde3cc',tag:'NICOTINE FREE',category:'nicotine-free',nicotineMg:0,caffeineMg:0},
{id:'velo-grape-zero',name:'Purple Grape Zero',brand:'VELO',note:'Grape · 0 mg nicotine',color:'#c4b9db',tag:'NICOTINE FREE',category:'nicotine-free',nicotineMg:0,caffeineMg:0},
{id:'velo-watermelon-zero',name:'Wintery Watermelon Zero',brand:'VELO',note:'Watermelon · 0 mg nicotine',color:'#eed0c6',tag:'NICOTINE FREE',category:'nicotine-free',nicotineMg:0,caffeineMg:0},
{id:'velo-mango-zero',name:'Tropical Mango Zero',brand:'VELO',note:'Tropical fruit · 0 mg nicotine',color:'#f2d778',tag:'NICOTINE FREE',category:'nicotine-free',nicotineMg:0,caffeineMg:0},
{id:'zyn-cool-mint-zero',name:'Zero Cool Mint',brand:'ZYN',note:'Peppermint & menthol · Nicotine free · 22 pouches',color:'#c6e1e9',tag:'NICOTINE FREE',category:'nicotine-free',nicotineMg:0,caffeineMg:0},
{id:'zyn-black-cherry-zero',name:'Zero Black Cherry',brand:'ZYN',note:'Cherry, almond & citrus · Nicotine free · 22 pouches',color:'#e5beca',tag:'NICOTINE FREE',category:'nicotine-free',nicotineMg:0,caffeineMg:0}];
export const products:Product[]=[...zeroProducts.map(p=>({...p,image:p.brand==='VELO'?'/products/'+p.id+'.webp':undefined,description:p.note+'. This listing is for the original nicotine-free product.',packCount:p.brand==='ZYN'?22:20})),...expanded as Product[]];
export function matchesFlavour(p:Product,f:string){if(f==='All')return true;const t=(p.name+' '+p.note).toLowerCase();if(f==='Fruit')return /berry|berries|grape|apple|watermelon|mango|cherry|citrus|lemon|lime|pineapple|kiwi|fruit|peach|papaya/.test(t);if(f==='Mint')return /mint|menthol/.test(t);if(f==='Berry')return /berry|berries/.test(t);return t.includes(f.toLowerCase())}
