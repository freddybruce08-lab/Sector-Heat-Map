import fs from "node:fs";
const SECT=[["XLK","Technology"],["XLF","Financials"],["XLV","Health Care"],["XLY","Cons. Discretionary"],["XLC","Comm. Services"],["XLI","Industrials"],["XLP","Cons. Staples"],["XLE","Energy"],["XLU","Utilities"],["XLRE","Real Estate"],["XLB","Materials"]];
const H={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36","Accept":"application/json"};
async function get(sym){
  for(const host of ["query1","query2"]){
    try{
      const r=await fetch(`https://${host}.finance.yahoo.com/v8/finance/chart/${sym}?interval=5m&range=1d&includePrePost=false`,{headers:H});
      if(!r.ok) continue; const j=await r.json(); const res=j?.chart?.result?.[0]; if(res) return res;
    }catch(e){}
  }
  return null;
}
const out={updated:new Date().toISOString(),sectors:[]};
let prev={}; try{prev=Object.fromEntries(JSON.parse(fs.readFileSync("data.json","utf8")).sectors.map(s=>[s.sym,s]))}catch(e){}
for(const [sym,name] of SECT){
  const r=await get(sym);
  if(!r){ if(prev[sym]) out.sectors.push({...prev[sym],stale:true}); continue; }
  const m=r.meta,q=r.indicators.quote[0],ts=r.timestamp||[];
  const price=m.regularMarketPrice,pc=m.chartPreviousClose??m.previousClose;
  let flow=0,cum=[],tot=0;
  for(let i=0;i<ts.length;i++){
    if(q.close[i]==null||q.open[i]==null) continue;
    const v=(q.volume[i]||0)*q.close[i];
    const dir=q.close[i]>q.open[i]?1:q.close[i]<q.open[i]?-1:0;
    flow+=dir*v;tot+=v;cum.push(Math.round(flow));
  }
  out.sectors.push({sym,name,price,prevClose:pc,chg:pc?(price-pc)/pc*100:0,volume:m.regularMarketVolume,dollarVol:Math.round(tot),flow:Math.round(flow),spark:cum.filter((_,i)=>i%2==0).slice(-80),marketTime:m.regularMarketTime});
  await new Promise(r=>setTimeout(r,250));
}
if(out.sectors.length<6){console.error("too few sectors fetched");process.exit(1)}
fs.writeFileSync("data.json",JSON.stringify(out));
console.log("ok",out.sectors.length);
