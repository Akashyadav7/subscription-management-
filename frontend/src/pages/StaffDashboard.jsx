import { useEffect, useState } from 'react';
import api from '../services/api';
export default function StaffDashboard(){
  const [d,setD]=useState(null);
  useEffect(()=>{ api.get('/dashboard').then(r=>setD(r.data)).catch(()=>{}); },[]);
  if(!d) return <div>Loading...</div>;
  const card=(title,val)=>(<div style={{background:'#fff',padding:16,borderRadius:10,boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}><div style={{fontSize:12,color:'#666'}}>{title}</div><div style={{fontSize:24,fontWeight:700,color:'#1e2a4a'}}>{val}</div></div>);
  return (
    <div>
      <h2 style={{color:'#1e2a4a'}}>Staff Dashboard</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:12}}>
        {card('Total Customers',d.totalCustomers)}
        {card('Active Subscriptions',d.activeSubs)}
        {card('Pending Invoices',d.invStatus?.find(x=>x.status==='confirmed')?.count||0)}
        {card('Overdue Invoices',d.overdue)}
        {card('Payments Collected','₹'+d.totalRevenue)}
      </div>
      <div style={{marginTop:20}}>
        <h3 style={{color:'#1e2a4a'}}>Recent Subscriptions</h3>
        <table style={{width:'100%',background:'#fff',borderCollapse:'collapse'}}><thead><tr><th style={{padding:8,textAlign:'left'}}>Number</th><th style={{padding:8,textAlign:'left'}}>Customer</th><th style={{padding:8,textAlign:'left'}}>Plan</th><th style={{padding:8,textAlign:'left'}}>Status</th></tr></thead><tbody>
        {d.recentSubs.map(s=><tr key={s.id}><td style={{padding:8}}>{s.number}</td><td style={{padding:8}}>{s.customer_name}</td><td style={{padding:8}}>{s.plan_name||'-'}</td><td style={{padding:8}}>{s.status}</td></tr>)}
        </tbody></table>
      </div>
      <div style={{marginTop:20}}>
        <h3 style={{color:'#1e2a4a'}}>Recent Payments</h3>
        <table style={{width:'100%',background:'#fff',borderCollapse:'collapse'}}><thead><tr><th style={{padding:8,textAlign:'left'}}>Invoice</th><th style={{padding:8,textAlign:'left'}}>Amount</th><th style={{padding:8,textAlign:'left'}}>Method</th><th style={{padding:8,textAlign:'left'}}>Date</th></tr></thead><tbody>
        {d.recentPayments.map(p=><tr key={p.id}><td style={{padding:8}}>{p.invoice_id}</td><td style={{padding:8}}>₹{p.amount}</td><td style={{padding:8}}>{p.method}</td><td style={{padding:8}}>{p.paid_at}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
