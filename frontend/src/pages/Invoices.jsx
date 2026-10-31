import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Invoices(){
  const [list,setList]=useState([]); const [q,setQ]=useState(''); const [st,setSt]=useState('all');
  const load=()=>api.get('/invoices').then(r=>setList(r.data));
  useEffect(()=>{load();},[]);
  const filtered=list.filter(i=>(!q||i.number.toLowerCase().includes(q.toLowerCase())||(i.customer_name||'').toLowerCase().includes(q.toLowerCase()))&&(st==='all'||i.status===st));
  const gen=async()=>{ await api.post('/invoices/generate',{}); load(); };
  const badgeCls={draft:'#eee',confirmed:'#dfe6e9',paid:'#e6f9f3',cancelled:'#fde8e8',overdue:'#fde8e8'};
  const badgeTxt={draft:'#636e72',confirmed:'#0984e3',paid:'#00b894',cancelled:'#d63031',overdue:'#d63031'};
  const total=list.length; const paid=list.filter(i=>i.status==='paid').length; const pending=list.filter(i=>i.status==='confirmed').length; const overdue=list.filter(i=>i.status==='confirmed'&&i.due_date<new Date().toISOString().slice(0,10)).length;
  return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h2 style={{margin:0,fontSize:20,color:'#1e2a4a'}}>Invoices</h2><p style={{margin:'4px 0 0',color:'#636e72',fontSize:13}}>Manage billing invoices.</p></div>
      <button onClick={gen} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}>Generate Invoices</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
      {[['Total',total],['Paid',paid],['Pending',pending],['Overdue',overdue]].map(([t,v])=>(<div key={t} style={{background:'#fff',padding:16,borderRadius:12,border:'1px solid #dfe6e9'}}><div style={{fontSize:12,color:'#636e72'}}>{t}</div><div style={{fontSize:22,fontWeight:700,color:'#1e2a4a'}}>{v}</div></div>))}
    </div>
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <div style={{position:'relative',width:300}}><div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#999'}}>🔍</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search invoices" style={{width:'100%',paddingLeft:32,padding:'9px 12px',fontSize:14,borderRadius:8,border:'1px solid #dfe6e9',background:'#fff'}}/></div>
      <select value={st} onChange={e=>setSt(e.target.value)} style={{padding:'9px 12px',borderRadius:8,border:'1px solid #dfe6e9'}}><option value="all">All statuses</option><option>draft</option><option>confirmed</option><option>paid</option><option>cancelled</option></select>
    </div>
    <div style={{background:'#fff',borderRadius:12,border:'1px solid #dfe6e9',overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Number</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Customer</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Total</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Due</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Status</th>
        </tr></thead>
        <tbody>
          {filtered.map(i=>(<tr key={i.id} style={{borderBottom:'1px solid #f0f1f5'}}>
            <td style={{padding:'12px 14px',fontSize:14}}>{i.number}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{i.customer_name}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>₹{i.total}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{i.due_date}</td>
            <td style={{padding:'12px 14px',fontSize:14}}><span style={{display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:badgeCls[i.status]||'#eee',color:badgeTxt[i.status]||'#636e72'}}>{i.status}</span></td>
          </tr>))}
          {filtered.length===0&&<tr><td style={{padding:24,textAlign:'center',color:'#636e72'}} colSpan={5}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>);
}
