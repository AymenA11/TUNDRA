import type {Metadata} from 'next';
import './globals.css';
import AgeGate from './age-gate';
export const metadata:Metadata={title:'TUNDRA — A Fresh Direction',description:'Browse nicotine, nicotine-free and caffeine pouches from Pablo, Killa, ZYN, VELO and more.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<AgeGate/></body></html>}
