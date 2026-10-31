import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Subscriptions(){
  const [list,setList]=useState([]); const [customers,setCustomers]=useState([]); const [plans,setPlans]=useState([]);
  const [form,setForm]=useState({customer_id:'',plan_id:'',start_date:new Date().toISOString().slice(0,10),expiry_date:'',payment_terms:'Net 30',status:'draft',items:[]}); const [show,setShow]=useState(false);
  const load=()=>{api.get('/subscriptions').then(r=>setList(r.data));api.get('/customers').then(r=>setCustomers(r.data));api.get('/plans').then(r=>setPlans(r.data));};
  useEffect(()=>{load();},[]);
  const save=async()=>{ await api.post('/subscriptions',{...form,customer_id:+form.customer_id,plan_id:+form.plan_id}); setShow(false); load(); };
  const setStatus=async(id,status)=>{ await api.put('/subscriptions/'+id+'/status',{status}); load(); };
  return (<div><div style={{display:'flex',justifyContent:'space-between'}}><h2>Subscriptions</h2><button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>+ Add Subscription</button></div>
  {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:8}}>
    <select value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} style={{marginRight:8,padding:8}}><option value="">Customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <select value={form.plan_id} onChange={e=>setForm({...form,plan_id:e.target.value})} style={{marginRight:8,padding:8}}><option value="">Plan</option>{plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
    <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={{marginRight:8,padding:8}}/>
    <input type="date" value={form.expiry_date} onChange={e=>setForm({...form,expiry_date:e.target.value})} style={{marginRight:8,padding:8}}/>
    <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
  </div>}
  <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
    <thead><tr><th style={{padding:8,textAlign:'left'}}>Number</th><th style={{padding:8,textAlign:'left'}}>Customer</th><th style={{padding:8,textAlign:'left'}}>Plan</th><th style={{padding:8,textAlign:'left'}}>Status</th><th style={{padding:8,textAlign:'left'}}>Action</th></tr></thead>
    <tbody>{list.map(s=><tr key={s.id}><td style={{padding:8}}>{s.number}</td><td style={{padding:8}}>{s.customer_name}</td><td style={{padding:8}}>{s.plan_name}</td><td style={{padding:8}}>{s.status}</td><td style={{padding:8}}><select value={s.status} onChange={e=>setStatus(s.id,e.target.value)}><option>draft</option><option>quotation</option><option>confirmed</option><option>active</option><option>paused</option><option>closed</option></select></td></tr>)}</tbody>
  </table>
  {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No subscriptions.</p>}
  </div>);
}
