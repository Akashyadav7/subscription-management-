import { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_COLOR={draft:'#636e72',quotation:'#e17055',confirmed:'#0984e3',active:'#00b894',paused:'#fdcb6e',closed:'#636e72'};

export default function Subscriptions(){
  const [list,setList]=useState([]); const [customers,setCustomers]=useState([]); const [plans,setPlans]=useState([]);
  const [q,setQ]=useState(''); const [show,setShow]=useState(false);
  const [form,setForm]=useState({customer_id:'',plan_id:'',start_date:new Date().toISOString().slice(0,10),expiry_date:'',payment_terms:'Net 30',status:'draft'});
  const load=()=>{api.get('/subscriptions').then(r=>setList(r.data));api.get('/customers').then(r=>setCustomers(r.data));api.get('/plans').then(r=>setPlans(r.data));};
  useEffect(()=>{load();},[]);
  const filtered=list.filter(s=>!q||s.number.toLowerCase().includes(q.toLowerCase())||(s.customer_name||'').toLowerCase().includes(q.toLowerCase()));
  const save=async()=>{ await api.post('/subscriptions',{...form,customer_id:+form.customer_id,plan_id:+form.plan_id}); setShow(false); load(); };
  const setStatus=async(id,status)=>{ await api.put('/subscriptions/'+id+'/status',{status}); load(); };
  const total=list.length; const active=list.filter(s=>s.status==='active').length; const pending=list.filter(s=>s.status==='confirmed'||s.status==='quotation').length; const closed=list.filter(s=>s.status==='closed').length;
  return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h2 style={{margin:0,fontSize:20,color:'#1e2a4a'}}>Subscriptions</h2><p style={{margin:'4px 0 0',color:'#636e72',fontSize:13}}>Monitor and manage recurring customer subscriptions.</p></div>
      <button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}>Add Subscription</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
      {[['Total',total],['Active',active],['Pending',pending],['Closed',closed]].map(([t,v])=>(<div key={t} style={{background:'#fff',padding:16,borderRadius:12,border:'1px solid #dfe6e9'}}><div style={{fontSize:12,color:'#636e72'}}>{t}</div><div style={{fontSize:22,fontWeight:700,color:'#1e2a4a'}}>{v}</div></div>))}
    </div>
    <div style={{position:'relative',width:300}}><div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#999'}}>🔍</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search subscriptions" style={{width:'100%',paddingLeft:32,padding:'9px 12px',fontSize:14,borderRadius:8,border:'1px solid #dfe6e9',background:'#fff'}}/></div>
    <div style={{background:'#fff',borderRadius:12,border:'1px solid #dfe6e9',overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Number</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Customer</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Plan</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Status</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Start</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Action</th>
        </tr></thead>
        <tbody>
          {filtered.map(s=>(<tr key={s.id} style={{borderBottom:'1px solid #f0f1f5'}}>
            <td style={{padding:'12px 14px',fontSize:14}}>{s.number}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{s.customer_name}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{s.plan_name}</td>
            <td style={{padding:'12px 14px',fontSize:14}}><span style={{display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:STATUS_COLOR[s.status]+'22',color:STATUS_COLOR[s.status]}}>{s.status}</span></td>
            <td style={{padding:'12px 14px',fontSize:14}}>{s.start_date}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>
              <select value={s.status} onChange={e=>setStatus(s.id,e.target.value)} style={{padding:'6px 8px',fontSize:13}}>
                <option>draft</option><option>quotation</option><option>confirmed</option><option>active</option><option>paused</option><option>closed</option>
              </select>
            </td>
          </tr>))}
          {filtered.length===0&&<tr><td style={{padding:24,textAlign:'center',color:'#636e72'}} colSpan={6}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
    {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:12}}>
      <select value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} style={{marginRight:8,padding:8}}><option value="">Customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select value={form.plan_id} onChange={e=>setForm({...form,plan_id:e.target.value})} style={{marginRight:8,padding:8}}><option value="">Plan</option>{plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={{marginRight:8,padding:8}}/>
      <input type="date" value={form.expiry_date} onChange={e=>setForm({...form,expiry_date:e.target.value})} style={{marginRight:8,padding:8}}/>
      <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
    </div>}
  </div>);
}
