import { useEffect, useState } from 'react';
import api from '../services/api';
import { Edit2 } from 'lucide-react';

export default function Products(){
  const [list,setList]=useState([]); const [q,setQ]=useState([]);
  const [show,setShow]=useState(false); const [form,setForm]=useState({name:'',type:'software',sales_price:0,cost_price:0,description:''});
  const [delId,setDelId]=useState(null); const [delOpen,setDelOpen]=useState(false);
  const load=()=>api.get('/products').then(r=>setList(r.data));
  useEffect(load,[]);
  const filtered=list.filter(p=>!q||p.name.toLowerCase().includes(q.toLowerCase()));
  const save=async()=>{ await api.post('/products',form); setShow(false); load(); };
  const del=async()=>{ await api.delete('/products/'+delId); setDelOpen(false); load(); };
  const badgeCls={active:'badge-green',confirmed:'badge-green',paid:'badge-green',draft:'badge-gray',closed:'badge-gray',paused:'badge-orange',quotation:'badge-orange',overdue:'badge-red',pending:'badge-orange'};
  return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div>
        <h2 style={{margin:0,fontSize:20,color:'#1e2a4a'}}>Products</h2>
        <p style={{margin:'4px 0 0',color:'#636e72',fontSize:13}}>Manage your product catalog.</p>
      </div>
      <button onClick={()=>{setForm({name:'',type:'software',sales_price:0,cost_price:0,description:''});setShow(true);}} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}>Add Product</button>
    </div>
    <div style={{position:'relative',width:300}}><div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#999'}}>🔍</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products" style={{width:'100%',paddingLeft:32,padding:'9px 12px',fontSize:14,borderRadius:8,border:'1px solid #dfe6e9',background:'#fff'}}/></div>
    <div style={{marginTop:12,background:'#fff',borderRadius:12,border:'1px solid #dfe6e9',overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Name</th>
            <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Type</th>
            <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Sales</th>
            <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Cost</th>
            <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Status</th>
            <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p=>(<tr key={p.id} style={{borderBottom:'1px solid #f0f1f5'}}>
            <td style={{padding:'12px 14px',fontSize:14}}>{p.name}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{p.type}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>₹{p.sales_price}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>₹{p.cost_price}</td>
            <td style={{padding:'12px 14px',fontSize:14}}><span style={{display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:badgeCls.active==='#'?'#eee':'#e6f9f3',color:'#00b894'}}>Active</span></td>
            <td style={{padding:'12px 14px',fontSize:14}}>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>{setForm({name:p.name,type:p.type,sales_price:p.sales_price,cost_price:p.cost_price,description:p.description||''});setShow(true);}} style={{background:'#fff',border:'1px solid #dfe6e9',padding:'6px 10px',borderRadius:6,cursor:'pointer'}}><Edit2 size={14}/></button>
                <button onClick={()=>{setDelId(p.id);setDelOpen(true);}} style={{color:'#d63031',border:'none',background:'none',cursor:'pointer'}}>Delete</button>
              </div>
            </td>
          </tr>))}
          {filtered.length===0&&<tr><td style={{padding:24,textAlign:'center',color:'#636e72'}} colSpan={6}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
    {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:12}}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
      <input placeholder="Sales Price" type="number" value={form.sales_price} onChange={e=>setForm({...form,sales_price:+e.target.value})} style={{marginRight:8,padding:8}}/>
      <input placeholder="Cost Price" type="number" value={form.cost_price} onChange={e=>setForm({...form,cost_price:+e.target.value})} style={{marginRight:8,padding:8}}/>
      <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
    </div>}
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:50,display:delOpen?'flex':'none',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',padding:24,borderRadius:12,width:400,boxShadow:'0 8px 24px rgba(0,0,0,.12)'}}>
        <h3 style={{margin:'0 0 10',color:'#1e2a4a'}}>Delete product</h3>
        <p style={{color:'#636e72',marginBottom:20}}>Are you sure you want to delete?</p>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={()=>setDelOpen(false)} style={{padding:'8px 16px',border:'1px solid #dfe6e9',borderRadius:8,cursor:'pointer'}}>Cancel</button>
          <button onClick={del} style={{padding:'8px 16px',borderRadius:8,background:'#d63031',color:'#fff',border:'none',cursor:'pointer'}}>Confirm</button>
        </div>
      </div>
    </div>
  </div>);
}
