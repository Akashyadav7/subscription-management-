import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Taxes(){
  const [list,setList]=useState([]); const [form,setForm]=useState({name:'',percentage:0,active:true}); const [show,setShow]=useState(false);
  const load=()=>api.get('/taxes').then(r=>setList(r.data)); useEffect(()=>{load();},[]);
  const save=async()=>{ await api.post('/taxes',form); setShow(false); load(); };
  return (<div><div style={{display:'flex',justifyContent:'space-between'}}><h2>Tax Settings</h2><button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>+ Add Tax</button></div>
  {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:8}}>
    <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
    <input placeholder="Percentage" type="number" value={form.percentage} onChange={e=>setForm({...form,percentage:+e.target.value})} style={{marginRight:8,padding:8}}/>
    <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
  </div>}
  <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
    <thead><tr><th style={{padding:8,textAlign:'left'}}>Name</th><th style={{padding:8,textAlign:'left'}}>Percentage</th></tr></thead>
    <tbody>{list.map(t=><tr key={t.id}><td style={{padding:8}}>{t.name}</td><td style={{padding:8}}>{t.percentage}%</td></tr>)}</tbody>
  </table>
  {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No taxes.</p>}
  </div>);
}
