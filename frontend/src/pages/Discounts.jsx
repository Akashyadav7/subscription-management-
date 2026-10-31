import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Discounts(){
  const [list,setList]=useState([]); const [form,setForm]=useState({name:'',type:'fixed',value:0,min_purchase:0,min_quantity:0,start_date:'',end_date:'',max_usage:0,applies_to:'all',active:true}); const [show,setShow]=useState(false);
  const load=()=>api.get('/discounts').then(r=>setList(r.data)); useEffect(()=>{load();},[]);
  const save=async()=>{ await api.post('/discounts',form); setShow(false); load(); };
  return (<div><div style={{display:'flex',justifyContent:'space-between'}}><h2>Discounts</h2><button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>+ Add Discount</button></div>
  {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:8}}>
    <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
    <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{marginRight:8,padding:8}}><option>fixed</option><option>percentage</option></select>
    <input placeholder="Value" type="number" value={form.value} onChange={e=>setForm({...form,value:+e.target.value})} style={{marginRight:8,padding:8}}/>
    <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
  </div>}
  <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
    <thead><tr><th style={{padding:8,textAlign:'left'}}>Name</th><th style={{padding:8,textAlign:'left'}}>Type</th><th style={{padding:8,textAlign:'left'}}>Value</th></tr></thead>
    <tbody>{list.map(d=><tr key={d.id}><td style={{padding:8}}>{d.name}</td><td style={{padding:8}}>{d.type}</td><td style={{padding:8}}>{d.value}</td></tr>)}</tbody>
  </table>
  {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No discounts.</p>}
  </div>);
}
