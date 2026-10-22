export function isAdult(dob:{year:number;month:number;day:number}|null|undefined,now=new Date()):boolean{
 if(!dob||!Number.isInteger(dob.year)||!Number.isInteger(dob.month)||!Number.isInteger(dob.day))return false;
 const date=new Date(Date.UTC(dob.year,dob.month-1,dob.day));
 if(date.getUTCFullYear()!==dob.year||date.getUTCMonth()!==dob.month-1||date.getUTCDate()!==dob.day||dob.year<1900)return false;
 const years=now.getUTCFullYear()-dob.year;return years>18||(years===18&&(now.getUTCMonth()+1>dob.month||(now.getUTCMonth()+1===dob.month&&now.getUTCDate()>=dob.day)));
}
