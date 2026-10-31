import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Taxes(){
  const [list,setList]=useState([]); const [q,setQ]=useState(''); const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:'',percentage:0,active:true});
  const load=()=>api.get('/taxes').then(r=>setList(r.data));
  useEffect(()=>{load();},[]);
  const filtered=list.filter(t=>!q||t.name.toLowerCase().includes(q.toLowerCase()));
  const save=async()=>{ await api.post('/taxes',form); setShow(false); load(); };
  return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h2 style={{margin:0,fontSize:20,color:'#1e2a4a'}}>Tax Settings</h2><p style={{margin:'4px 0 0',color:'#636e72',fontSize:13}}>Manage tax rules.</p></div>
      <button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}>Add Tax</button>
    </div>
    <div style={{background:'#fff',borderRadius:12,border:'1px solid #dfe6e9',overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Name</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Percentage</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Status</th>
        </tr></thead>
        <tbody>
          {filtered.map(t=>(<tr key={t.id} style={{borderBottom:'1px solid #f0f1f5'}}>
            <td style={{padding:'12px 14px',fontSize:14}}>{t.name}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{t.percentage}%</td>
            <td style={{padding:'12px 14px',fontSize:14}}><span style={{display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:t.active?'#e6f9f3':'#eee',color:t.active?'#00b894':'#636e72'}}>{t.active?'Active':'Inactive'}</span></td>
          </tr>))}
          {filtered.length===0&&<tr><td style={{padding:24,textAlign:'center',color:'#636e72'}} colSpan={3}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
    {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:12}}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
      <input placeholder="Percentage" type="number" value={form.percentage} onChange={e=>setForm({...form,percentage:+e.target.value})} style={{marginRight:8,padding:8}}/>
      <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
    </div>}
  </div>);
}
