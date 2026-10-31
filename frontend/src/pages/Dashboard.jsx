import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard(){
  const [d,setD]=useState(null);
  useEffect(()=>{ api.get('/dashboard').then(r=>setD(r.data)).catch(()=>{}); },[]);
  if(!d) return <div>Loading...</div>;
  const card=(title,val)=>(<div style={{background:'#fff',padding:16,borderRadius:10,boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}><div style={{fontSize:12,color:'#666'}}>{title}</div><div style={{fontSize:24,fontWeight:700}}>{val}</div></div>);
  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:12}}>
        {card('Customers',d.totalCustomers)}
        {card('Active Subs',d.activeSubs)}
        {card('MRR', '₹'+d.mrr)}
        {card('Revenue Collected','₹'+d.totalRevenue)}
        {card('Outstanding','₹'+d.outstanding)}
        {card('Overdue Invoices',d.overdue)}
      </div>
      <div style={{marginTop:20}}>
        <h3>Recent Subscriptions</h3>
        <table style={{width:'100%',background:'#fff',borderCollapse:'collapse'}}><thead><tr><th style={{textAlign:'left',padding:8}}>Number</th><th style={{textAlign:'left',padding:8}}>Customer</th><th style={{textAlign:'left',padding:8}}>Status</th></tr></thead><tbody>
        {d.recentSubs.map(s=><tr key={s.id}><td style={{padding:8}}>{s.number}</td><td style={{padding:8}}>{s.customer_name}</td><td style={{padding:8}}>{s.status}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
