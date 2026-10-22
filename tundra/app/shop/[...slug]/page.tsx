import {notFound} from 'next/navigation';
import Storefront,{type Collection} from '../../storefront';
const collections:Record<string,Collection>={
'brand/camo':{title:'CAMO caffeine pouches',description:'Explore the CAMO caffeine range with 77 mg caffeine per pouch.',brand:'CAMO'},
'brand/denssi':{title:'DENSSI caffeine pouches',description:'Explore the DENSSI caffeine range with 100 mg caffeine per pouch.',brand:'DENSSI'},
'brand/xqs':{title:'XQS caffeine pouches',description:'Explore the XQS caffeine range with 50 mg caffeine per pouch.',brand:'XQS'},
'brand/pablo':{title:'Pablo',description:'Explore Pablo Silver, Gold and Exclusive nicotine products. Original product photos; purchasing disabled.',brand:'PABLO'},
'brand/killa':{title:'Killa',description:'Explore KILLA nicotine products and flavours. Original product photos; purchasing disabled.',brand:'KILLA'},
'brand/zyn':{title:'ZYN',description:'Explore ZYN nicotine and nicotine-free products. Contents are clearly labelled on every card.',brand:'ZYN'},
'brand/velo':{title:'VELO',description:'Browse VELO nicotine products and the separate VELO Zero range.',brand:'VELO'},
'category/offers':{title:'Offers',description:'Browse confirmed product promotions. Offers appear once their prices and terms are set.',offersOnly:true},
'category/all':{title:'All pouches',description:'Browse nicotine, nicotine-free and caffeine pouches. Pricing and stock are being confirmed.'},
'category/caffeine':{title:'Caffeine snus',description:'Explore XQS, CAMO and DENSSI caffeine pouches with photos and caffeine amounts per pouch.',category:'caffeine'},
'category/nicotine-free':{title:'No nicotine snus',description:'Discover VELO Zero and ZYN Zero. Pouch format, without nicotine.',hidePlaceholders:true,category:'nicotine-free'},
'category/nicotine':{title:'Nicotine pouches',description:'Original nicotine-containing products from Pablo, Killa, ZYN and VELO. Nicotine is addictive. 18+ only.',category:'nicotine'},
'strength/zero':{title:'0 mg / Nicotine free',description:'Explore our nicotine-free pouch collection.',hidePlaceholders:true,category:'nicotine-free'},
};
for(const [slug,name] of Object.entries({light:'Light',medium:'Medium',strong:'Strong','extra-strong':'Extra strong'}))collections['strength/'+slug]={title:name+' strength',description:'Browse by nicotine per pouch: light up to 6 mg, medium over 6–12 mg, strong over 12–20 mg, extra strong over 20 mg. These are TUNDRA filters; manufacturer labels may differ.',strength:slug};
for(const [slug,name] of Object.entries({mint:'Mint',peppermint:'Peppermint',grape:'Grape',watermelon:'Watermelon',mango:'Mango',cherry:'Cherry',fruit:'Fruit',coffee:'Coffee',citrus:'Citrus',cola:'Cola',berry:'Berry'}))collections['flavour/'+slug]={title:name+' pouches',description:'Explore '+name.toLowerCase()+' flavours across the catalogue. Check each product’s nicotine or caffeine label.',flavour:name,category:'nicotine-free'};
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){const c=collections[(await params).slug.join('/')];return {title:c?c.title+' | TUNDRA':'Collection not found | TUNDRA'}}
export default async function CollectionPage({params}:{params:Promise<{slug:string[]}>}){const c=collections[(await params).slug.join('/')];if(!c)notFound();return <Storefront collection={c}/>}
