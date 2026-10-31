import { useEffect, useState } from 'react';
import api from '../services/api';
export default function CustomerDashboard(){
  const [d,setD]=useState(null);
  useEffect(()=>{ api.get('/customer/dashboard').then(r=>setD(r.data)).catch(()=>{}); },[]);
  if(!d) return <div>Loading...</div>;
  const card=(t,v)=>(<div style={{background:'#fff',padding:16,borderRadius:10,boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}><div style={{fontSize:12,color:'#666'}}>{t}</div><div style={{fontSize:24,fontWeight:700,color:'#1e2a4a'}}>{v}</div></div>);
  return (<div><h2 style={{color:'#1e2a4a'}}>My Dashboard</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:12}}>
      {card('Active Subscriptions',d.activeSubs)}{card('Total Paid','₹'+d.totalPaid)}{card('Outstanding','₹'+d.outstanding)}
    </div>
    <div style={{marginTop:20}}><h3 style={{color:'#1e2a4a'}}>Recent Invoices</h3>
      <table style={{width:'100%',background:'#fff',borderCollapse:'collapse'}}><thead><tr><th style={{padding:8,textAlign:'left'}}>Number</th><th style={{padding:8,textAlign:'left'}}>Total</th><th style={{padding:8,textAlign:'left'}}>Status</th></tr></thead><tbody>
      {d.recentInvs.map(i=><tr key={i.id}><td style={{padding:8}}>{i.number}</td><td style={{padding:8}}>₹{i.total}</td><td style={{padding:8}}>{i.status}</td></tr>)}
      </tbody></table>
    </div>
  </div>);
}
