import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Discounts(){
  const [list,setList]=useState([]); const [q,setQ]=useState(''); const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:'',type:'fixed',value:0,min_purchase:0,min_quantity:0,start_date:'',end_date:'',max_usage:0,applies_to:'all',active:true});
  const load=()=>api.get('/discounts').then(r=>setList(r.data));
  useEffect(()=>{load();},[]);
  const filtered=list.filter(d=>!q||d.name.toLowerCase().includes(q.toLowerCase()));
  const save=async()=>{ await api.post('/discounts',form); setShow(false); load(); };
  return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h2 style={{margin:0,fontSize:20,color:'#1e2a4a'}}>Discounts</h2><p style={{margin:'4px 0 0',color:'#636e72',fontSize:13}}>Manage discount rules.</p></div>
      <button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}>Add Discount</button>
    </div>
    <div style={{background:'#fff',borderRadius:12,border:'1px solid #dfe6e9',overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Name</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Type</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Value</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Status</th>
        </tr></thead>
        <tbody>
          {filtered.map(d=>(<tr key={d.id} style={{borderBottom:'1px solid #f0f1f5'}}>
            <td style={{padding:'12px 14px',fontSize:14}}>{d.name}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{d.type}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{d.value}</td>
            <td style={{padding:'12px 14px',fontSize:14}}><span style={{display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:d.active?'#e6f9f3':'#eee',color:d.active?'#00b894':'#636e72'}}>{d.active?'Active':'Inactive'}</span></td>
          </tr>))}
          {filtered.length===0&&<tr><td style={{padding:24,textAlign:'center',color:'#636e72'}} colSpan={4}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
    {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:12}}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
      <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{marginRight:8,padding:8}}><option>fixed</option><option>percentage</option></select>
      <input placeholder="Value" type="number" value={form.value} onChange={e=>setForm({...form,value:+e.target.value})} style={{marginRight:8,padding:8}}/>
      <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
    </div>}
  </div>);
}
