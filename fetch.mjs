import fs from "node:fs";
const SECT=[["XLK","Technology"],["XLF","Financials"],["XLV","Health Care"],["XLY","Cons. Discretionary"],["XLC","Comm. Services"],["XLI","Industrials"],["XLP","Cons. Staples"],["XLE","Energy"],["XLU","Utilities"],["XLRE","Real Estate"],["XLB","Materials"]];
const H={"User-Agent":"sector-flow-personal-dashboard/1.0","Accept":"application/json"};
const num=s=>parseFloat(String(s).replace(/[$,%\s,]/g,""));
async function get(sym){
  for(let a=0;a<3;a++){
    try{
      const r=await fetch(`https://api.nasdaq.com/api/quote/${sym}/chart?assetclass=etf`,{headers:H,signal:AbortSignal.timeout(20000)});
      if(r.ok){const j=await r.json();if(j?.data?.chart?.length)return j.data}
    }catch(e){}
    await new Promise(r=>setTimeout(r,1500*(a+1)));
  }
  return null;
}
let prev={}; try{prev=Object.fromEntries(JSON.parse(fs.readFileSync("data.json","utf8")).sectors.map(s=>[s.sym,s]))}catch(e){}
const out={updated:new Date().toISOString(),sectors:[]};
for(const [sym,name] of SECT){
  const d=await get(sym);
  if(!d){console.log("fail",sym);if(prev[sym])out.sectors.push({...prev[sym],stale:true});continue}
  const price=num(d.lastSalePrice),pc=num(d.previousClose);
  const vol=new Map((d.volumeChart||[]).map(v=>[v.x,Number(v.y)||0]));
  if(sym==="XLK")console.log("sample",JSON.stringify((d.volumeChart||[]).slice(0,2)),(d.volumeChart||[]).length);
  let flow=0,tot=0,last=null,cum=[];
  for(const p of d.chart){
    const v=(vol.get(p.x)||0)*p.y;
    if(last!=null){const dir=Math.sign(p.y-last);flow+=dir*v}
    tot+=v;last=p.y;cum.push(Math.round(flow));
  }
  const step=Math.max(1,Math.floor(cum.length/80));
  out.sectors.push({sym,name,price,prevClose:pc,chg:isNaN(num(d.percentageChange))?(price-pc)/pc*100:num(d.percentageChange),volume:num(d.volume),dollarVol:Math.round(tot),flow:Math.round(flow),spark:cum.filter((_,i)=>i%step===0),marketTime:Math.round(d.chart[d.chart.length-1].x/1000)});
  await new Promise(r=>setTimeout(r,500));
}
console.log("sectors",out.sectors.length);
if(out.sectors.length<6){console.error("too few sectors fetched");process.exit(1)}
fs.writeFileSync("data.json",JSON.stringify(out));
