import {products} from './catalog';
export const brands=[
{slug:'pablo',name:'PABLO',line:'Silver. Gold. Exclusive.',colour:'#292329',ink:'#fff8e8',id:'pablo-silver-edition-peppermint'},
{slug:'killa',name:'KILLA',line:'Originals with attitude.',colour:'#e1e8d5',ink:'#2b4233',id:'killa-cold-mint'},
{slug:'zyn',name:'ZYN',line:'Find your flavour & format.',colour:'#d8e8f4',ink:'#15456d',id:'zyn-cool-mint-mini-3mg'},
{slug:'velo',name:'VELO',line:'A world of flavour.',colour:'#d9eae0',ink:'#1e514b',id:'velo-bright-zero'},
{slug:'xqs',name:'XQS',line:'Caffeine. Full of flavour.',colour:'#ecd7df',ink:'#65364e',id:'xqs-black-cherry-0-percent-nicotine'},
{slug:'camo',name:'CAMO',line:'Explore caffeine pouches.',colour:'#e3decf',ink:'#4a4933',id:'camo_strawberry_kiwi_77mg_caffeine'},
{slug:'denssi',name:'DENSSI',line:'Your caffeine collection.',colour:'#e3dbec',ink:'#4c3561',id:'denssi-viking-energy-caffeine-100mg'}
].map(b=>({...b,image:products.find(p=>p.id===b.id)?.image,count:products.filter(p=>p.brand===b.name).length}));
