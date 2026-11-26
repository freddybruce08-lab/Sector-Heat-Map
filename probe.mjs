const H={"User-Agent":"sector-flow-personal-dashboard/1.0","Accept":"application/json"};
for(const u of ["https://api.nasdaq.com/api/quote/XLK/chart?assetclass=etf","https://api.nasdaq.com/api/quote/XLK/info?assetclass=etf"]){
  try{const r=await fetch(u,{headers:H,signal:AbortSignal.timeout(15000)});const t=await r.text();let j;try{j=JSON.parse(t)}catch(e){}
   console.log("PROBE",u.split("/quote/")[1],r.status,t.length);
   const d=j&&j.data||{};console.log("PROBE keys",Object.keys(d).join(","));
   if(d.chart){console.log("PROBE chartlen",d.chart.length,JSON.stringify(d.chart.slice(0,2)),JSON.stringify(d.chart.slice(-1)))}
   if(d.primaryData)console.log("PROBE primary",JSON.stringify(d.primaryData).slice(0,350));
   if(d.keyStats)console.log("PROBE stats",JSON.stringify(d.keyStats).slice(0,350));
  }catch(e){console.log("PROBE ERR",String(e.cause||e).slice(0,120))}
}
