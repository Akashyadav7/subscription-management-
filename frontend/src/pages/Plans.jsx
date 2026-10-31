import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Plans(){
  const [list,setList]=useState([]); const [products,setProducts]=useState([]);
  const [form,setForm]=useState({name:'',product_id:'',price:0,billing_interval:'monthly',min_quantity:1,active:true});
  const [show,setShow]=useState(false);
  const load=()=>{api.get('/plans').then(r=>setList(r.data));api.get('/products').then(r=>setProducts(r.data));};
  useEffect(()=>{load();},[]);
  const save=async()=>{ await api.post('/plans',form); setShow(false); load(); };
  return (
    <div><div style={{display:'flex',justifyContent:'space-between'}}><h2>Plans</h2><button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>+ Add Plan</button></div>
    {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:8}}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
      <select value={form.product_id} onChange={e=>setForm({...form,product_id:+e.target.value})} style={{marginRight:8,padding:8}}><option value="">Product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form,price:+e.target.value})} style={{marginRight:8,padding:8}}/>
      <select value={form.billing_interval} onChange={e=>setForm({...form,billing_interval:e.target.value})} style={{marginRight:8,padding:8}}><option>daily</option><option>weekly</option><option>monthly</option><option>yearly</option></select>
      <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
    </div>}
    <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
      <thead><tr><th style={{padding:8,textAlign:'left'}}>Name</th><th style={{padding:8,textAlign:'left'}}>Interval</th><th style={{padding:8,textAlign:'left'}}>Price</th></tr></thead>
      <tbody>{list.map(p=><tr key={p.id}><td style={{padding:8}}>{p.name}</td><td style={{padding:8}}>{p.billing_interval}</td><td style={{padding:8}}>₹{p.price}</td></tr>)}</tbody>
    </table>
    {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No plans.</p>}
    </div>
  );
}
