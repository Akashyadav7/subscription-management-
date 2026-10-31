import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Payments(){
  const [list,setList]=useState([]); const [invoices,setInvoices]=useState([]);
  const [form,setForm]=useState({invoice_id:'',amount:0,method:'cash',paid_at:new Date().toISOString().slice(0,10),note:''}); const [show,setShow]=useState(false);
  const load=()=>{api.get('/payments').then(r=>setList(r.data));api.get('/invoices').then(r=>setInvoices(r.data));}; useEffect(()=>{load();},[]);
  const save=async()=>{ await api.post('/payments',form); setShow(false); load(); };
  return (<div><div style={{display:'flex',justifyContent:'space-between'}}><h2>Payments</h2><button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>+ Record Payment</button></div>
  {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:8}}>
    <select value={form.invoice_id} onChange={e=>setForm({...form,invoice_id:+e.target.value})} style={{marginRight:8,padding:8}}><option value="">Invoice</option>{invoices.map(i=><option key={i.id} value={i.id}>{i.number}</option>)}</select>
    <input placeholder="Amount" type="number" value={form.amount} onChange={e=>setForm({...form,amount:+e.target.value})} style={{marginRight:8,padding:8}}/>
    <select value={form.method} onChange={e=>setForm({...form,method:e.target.value})} style={{marginRight:8,padding:8}}><option>cash</option><option>bank_transfer</option><option>upi</option><option>card</option></select>
    <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
  </div>}
  <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
    <thead><tr><th style={{padding:8,textAlign:'left'}}>Invoice</th><th style={{padding:8,textAlign:'left'}}>Amount</th><th style={{padding:8,textAlign:'left'}}>Method</th><th style={{padding:8,textAlign:'left'}}>Date</th></tr></thead>
    <tbody>{list.map(p=><tr key={p.id}><td style={{padding:8}}>{p.invoice_id}</td><td style={{padding:8}}>₹{p.amount}</td><td style={{padding:8}}>{p.method}</td><td style={{padding:8}}>{p.paid_at}</td></tr>)}</tbody>
  </table>
  {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No payments.</p>}
  </div>);
}
