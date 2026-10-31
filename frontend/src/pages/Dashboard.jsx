import { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard(){
  const [d,setD]=useState(null);
  useEffect(()=>{ api.get('/dashboard').then(r=>setD(r.data)).catch(()=>{}); },[]);
  if(!d) return <div>Loading...</div>;
  const card=(title,val,icon)=>(<div style={{background:'#fff',padding:16,borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,.06)',border:'1px solid #dfe6e9',display:'flex',alignItems:'center',gap:12}}>
    <div style={{width:40,height:40,borderRadius:10,background:'rgba(108,92,231,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{icon}</div>
    <div><div style={{fontSize:12,color:'#636e72'}}>{title}</div><div style={{fontSize:22,fontWeight:700,color:'#1e2a4a'}}>{val}</div></div>
  </div>);
  const COLORS=['#6c5ce7','#00b894','#fdcb6e','#d63031','#636e72'];
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div><h2 style={{margin:0}}>Good morning, Admin</h2><p style={{margin:0,color:'#636e72',fontSize:14}}>Here's your business overview.</p></div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>window.location.reload()} style={{background:'#fff',border:'1px solid #dfe6e9',padding:'8px 12px',borderRadius:8,cursor:'pointer'}}>Refresh</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
        {card('Total Customers',d.totalCustomers,'👥')}
        {card('Active Subscriptions',d.activeSubs,'📈')}
        {card('MRR','₹'+d.mrr,'💰')}
        {card('Revenue Collected','₹'+d.totalRevenue,'💵')}
        {card('Outstanding','₹'+d.outstanding,'⏳')}
        {card('Overdue Invoices',d.overdue,'⚠️')}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
        <div style={{background:'#fff',padding:16,borderRadius:12,border:'1px solid #dfe6e9'}}>
          <h3 style={{marginTop:0}}>Revenue Trend</h3>
          {d.revenueByMonth && d.revenueByMonth.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.revenueByMonth}><XAxis dataKey="m"/><YAxis/><Tooltip/><Bar dataKey="total" fill="#6c5ce7"/></BarChart>
            </ResponsiveContainer>
          ) : <p style={{color:'#636e72'}}>No revenue data yet.</p>}
        </div>
        <div style={{background:'#fff',padding:16,borderRadius:12,border:'1px solid #dfe6e9'}}>
          <h3 style={{marginTop:0}}>Subscription Status</h3>
          {d.subStatus && d.subStatus.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={d.subStatus} dataKey="count" nameKey="status" outerRadius={80}>{d.subStatus.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart>
            </ResponsiveContainer>
          ) : <p style={{color:'#636e72'}}>No data.</p>}
        </div>
      </div>
      <div style={{background:'#fff',padding:16,borderRadius:12,border:'1px solid #dfe6e9'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h3 style={{margin:0}}>Recent Subscriptions</h3>
          <span style={{color:'#6c5ce7',cursor:'pointer',fontSize:14}} onClick={()=>window.location.href='/subscriptions'}>View all</span>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><th style={{textAlign:'left',padding:8}}>Number</th><th style={{textAlign:'left',padding:8}}>Customer</th><th style={{textAlign:'left',padding:8}}>Status</th></tr></thead>
          <tbody>{d.recentSubs.map(s=><tr key={s.id}><td style={{padding:8}}>{s.number}</td><td style={{padding:8}}>{s.customer_name}</td><td style={{padding:8}}><span className="badge badge-gray">{s.status}</span></td></tr>)}</tbody>
        </table>
        {d.recentSubs.length===0&&<p style={{color:'#636e72'}}>No subscriptions.</p>}
      </div>
    </div>
  );
}
