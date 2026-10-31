import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Products(){
  const [list,setList]=useState([]);
  const [form,setForm]=useState({name:'',type:'software',sales_price:0,cost_price:0,description:''});
  const [show,setShow]=useState(false);
  const load=()=>api.get('/products').then(r=>setList(r.data));
  useEffect(()=>{load();},[]);
  const save=async()=>{ await api.post('/products',form); setShow(false); load(); };
  const del=async(id)=>{ await api.delete('/products/'+id); load(); };
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>Products</h2><button onClick={()=>setShow(true)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>+ Add Product</button></div>
      {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:8}}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
        <input placeholder="Sales Price" type="number" value={form.sales_price} onChange={e=>setForm({...form,sales_price:+e.target.value})} style={{marginRight:8,padding:8}}/>
        <input placeholder="Cost Price" type="number" value={form.cost_price} onChange={e=>setForm({...form,cost_price:+e.target.value})} style={{marginRight:8,padding:8}}/>
        <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
      </div>}
      <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
        <thead><tr><th style={{padding:8,textAlign:'left'}}>Name</th><th style={{padding:8,textAlign:'left'}}>Type</th><th style={{padding:8,textAlign:'left'}}>Sales</th><th style={{padding:8,textAlign:'left'}}>Cost</th><th style={{padding:8}}></th></tr></thead>
        <tbody>{list.map(p=><tr key={p.id}><td style={{padding:8}}>{p.name}</td><td style={{padding:8}}>{p.type}</td><td style={{padding:8}}>₹{p.sales_price}</td><td style={{padding:8}}>₹{p.cost_price}</td><td style={{padding:8}}><button onClick={()=>del(p.id)} style={{color:'red',border:'none',background:'none',cursor:'pointer'}}>Delete</button></td></tr>)}</tbody>
      </table>
      {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No products yet.</p>}
    </div>
  );
}
