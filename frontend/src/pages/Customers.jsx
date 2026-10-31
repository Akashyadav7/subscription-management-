import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Customers(){
  const [list,setList]=useState([]); const [q,setQ]=useState('');
  const [form,setForm]=useState({name:'',email:'',phone:'',address:''}); const [show,setShow]=useState(false);
  const load=()=>api.get('/customers',{params:{q}}).then(r=>setList(r.data));
  useEffect(()=>{load();},[q]);
  const save=async()=>{ await api.post('/customers',form); setShow(false); load(); };
  const del=async(id)=>{ /* no delete endpoint, skip */ };
  return (
    <div><div style={{display:'flex',justifyContent:'space-between'}}><h2>Customers</h2><button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>+ Add Customer</button></div>
    <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} style={{marginTop:8,padding:8,width:'100%'}}/>
    {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:8}}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{marginRight:8,padding:8}}/>
      <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{marginRight:8,padding:8}}/>
      <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
    </div>}
    <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
      <thead><tr><th style={{padding:8,textAlign:'left'}}>Name</th><th style={{padding:8,textAlign:'left'}}>Email</th><th style={{padding:8,textAlign:'left'}}>Phone</th></tr></thead>
      <tbody>{list.map(c=><tr key={c.id}><td style={{padding:8}}>{c.name}</td><td style={{padding:8}}>{c.email}</td><td style={{padding:8}}>{c.phone}</td></tr>)}</tbody>
    </table>
    {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No customers.</p>}
    </div>
  );
}
