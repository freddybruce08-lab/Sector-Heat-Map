const H={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36","Accept":"*/*"};
const U={
 yahoo1:"https://query1.finance.yahoo.com/v8/finance/chart/XLK?interval=5m&range=1d",
 yahoo2:"https://query2.finance.yahoo.com/v8/finance/chart/XLK?interval=5m&range=1d",
 stooq_q:"https://stooq.com/q/l/?s=xlk.us&f=sd2t2ohlcv&h&e=csv",
 stooq_5m:"https://stooq.com/q/d/l/?s=xlk.us&i=5",
 cboe:"https://cdn.cboe.com/api/global/delayed_quotes/quotes/XLK.json",
 nasdaq:"https://api.nasdaq.com/api/quote/XLK/chart?assetclass=etf",
 google:"https://www.google.com/finance/quote/XLK:NYSEARCA",
 stockanalysis:"https://stockanalysis.com/etf/xlk/",
};
for(const [k,u] of Object.entries(U)){
  try{const r=await fetch(u,{headers:H,signal:AbortSignal.timeout(10000)});const t=await r.text();console.log("PROBE",k,r.status,t.length,JSON.stringify(t.slice(0,160)))}
  catch(e){console.log("PROBE",k,"ERR",String(e.cause||e).slice(0,100))}
}
