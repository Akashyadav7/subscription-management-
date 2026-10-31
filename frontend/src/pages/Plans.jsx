import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Plans(){
  const [list,setList]=useState([]); const [products,setProducts]=useState([]);
  const [q,setQ]=useState(''); const [iv,setIv]=useState('all'); const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:'',product_id:'',price:0,billing_interval:'monthly',min_quantity:1,active:true});
  const load=()=>{api.get('/plans').then(r=>setList(r.data));api.get('/products').then(r=>setProducts(r.data));};
  useEffect(()=>{load();},[]);
  const filtered=list.filter(p=>(!q||p.name.toLowerCase().includes(q.toLowerCase()))&&(iv==='all'||p.billing_interval===iv));
  const save=async()=>{ await api.post('/plans',form); setShow(false); load(); };
  const intervalColor={daily:'#6c5ce7',weekly:'#00b894',monthly:'#0984e3',yearly:'#e17055'};
  return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h2 style={{margin:0,fontSize:20,color:'#1e2a4a'}}>Plans</h2><p style={{margin:'4px 0 0',color:'#636e72',fontSize:13}}>Manage billing plans.</p></div>
      <button onClick={()=>{setForm({name:'',product_id:'',price:0,billing_interval:'monthly',min_quantity:1,active:true});setShow(true);}} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}>Add Plan</button>
    </div>
    <div style={{background:'#fff',padding:12,borderRadius:12,border:'1px solid #dfe6e9',display:'inline-block',minWidth:160}}><div style={{fontSize:12,color:'#636e72'}}>Total Plans</div><div style={{fontSize:22,fontWeight:700,color:'#1e2a4a'}}>{list.length}</div></div>
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <div style={{position:'relative',width:300}}><div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#999'}}>🔍</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search plans" style={{width:'100%',paddingLeft:32,padding:'9px 12px',fontSize:14,borderRadius:8,border:'1px solid #dfe6e9',background:'#fff'}}/></div>
      <select value={iv} onChange={e=>setIv(e.target.value)} style={{padding:'9px 12px',borderRadius:8,border:'1px solid #dfe6e9'}}><option value="all">All intervals</option><option>daily</option><option>weekly</option><option>monthly</option><option>yearly</option></select>
    </div>
    <div style={{background:'#fff',borderRadius:12,border:'1px solid #dfe6e9',overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Plan Name</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Product</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Interval</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Price</th>
        </tr></thead>
        <tbody>
          {filtered.map(p=>(<tr key={p.id} style={{borderBottom:'1px solid #f0f1f5'}}>
            <td style={{padding:'12px 14px',fontSize:14}}>{p.name}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{p.product_name||'-'}</td>
            <td style={{padding:'12px 14px',fontSize:14}}><span style={{display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:intervalColor[p.billing_interval]+'22',color:intervalColor[p.billing_interval]}}>{p.billing_interval}</span></td>
            <td style={{padding:'12px 14px',fontSize:14}}>₹{p.price}</td>
          </tr>))}
          {filtered.length===0&&<tr><td style={{padding:24,textAlign:'center',color:'#636e72'}} colSpan={4}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
    {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:12}}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
      <select value={form.product_id} onChange={e=>setForm({...form,product_id:+e.target.value})} style={{marginRight:8,padding:8}}><option value="">Product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form,price:+e.target.value})} style={{marginRight:8,padding:8}}/>
      <select value={form.billing_interval} onChange={e=>setForm({...form,billing_interval:e.target.value})} style={{marginRight:8,padding:8}}><option>daily</option><option>weekly</option><option>monthly</option><option>yearly</option></select>
      <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
    </div>}
  </div>);
}
