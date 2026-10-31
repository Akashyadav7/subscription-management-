import { useEffect, useState } from 'react';
import api from '../services/api';
import { Edit2 } from 'lucide-react';

export default function Customers(){
  const [list,setList]=useState([]); const [q,setQ]=useState('');
  const [form,setForm]=useState({name:'',email:'',phone:'',address:''}); const [show,setShow]=useState(false);
  const load=()=>api.get('/customers').then(r=>setList(r.data));
  useEffect(()=>{load();},[]);
  const filtered=list.filter(c=>!q||c.name.toLowerCase().includes(q.toLowerCase())|| (c.email||'').toLowerCase().includes(q.toLowerCase()));
  const save=async()=>{ await api.post('/customers',form); setShow(false); load(); };
  const badgeCls={active:'#e6f9f3',confirmed:'#e6f9f3',paid:'#e6f9f3',draft:'#eee',closed:'#eee',paused:'#fff8e1',quotation:'#fff8e1',overdue:'#fde8e8',pending:'#fff8e1'};
  const badgeTxt={active:'#00b894',confirmed:'#00b894',paid:'#00b894',draft:'#636e72',closed:'#636e72',paused:'#e17055',quotation:'#e17055',overdue:'#d63031',pending:'#e17055'};
  return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h2 style={{margin:0,fontSize:20,color:'#1e2a4a'}}>Customers</h2><p style={{margin:'4px 0 0',color:'#636e72',fontSize:13}}>Manage your customer relationships.</p></div>
      <button onClick={()=>{setForm({name:'',email:'',phone:'',address:''});setShow(true);}} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}>Add Customer</button>
    </div>
    <div style={{background:'#fff',padding:12,borderRadius:12,border:'1px solid #dfe6e9',display:'inline-block',minWidth:160}}><div style={{fontSize:12,color:'#636e72'}}>Total Customers</div><div style={{fontSize:22,fontWeight:700,color:'#1e2a4a'}}>{list.length}</div></div>
    <div style={{position:'relative',width:300}}><div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#999'}}>🔍</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search customers" style={{width:'100%',paddingLeft:32,padding:'9px 12px',fontSize:14,borderRadius:8,border:'1px solid #dfe6e9',background:'#fff'}}/></div>
    <div style={{background:'#fff',borderRadius:12,border:'1px solid #dfe6e9',overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Name</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Email</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Phone</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Status</th>
        </tr></thead>
        <tbody>
          {filtered.map(c=>(<tr key={c.id} style={{borderBottom:'1px solid #f0f1f5'}}>
            <td style={{padding:'12px 14px',fontSize:14}}>{c.name}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{c.email}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{c.phone||'-'}</td>
            <td style={{padding:'12px 14px',fontSize:14}}><span style={{display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:'#e6f9f3',color:'#00b894'}}>Active</span></td>
          </tr>))}
          {filtered.length===0&&<tr><td style={{padding:24,textAlign:'center',color:'#636e72'}} colSpan={4}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
    {show&&<div style={{background:'#fff',padding:16,marginTop:12,borderRadius:12}}>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginRight:8,padding:8}}/>
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{marginRight:8,padding:8}}/>
      <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{marginRight:8,padding:8}}/>
      <button onClick={save} style={{background:'#00b894',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Save</button>
    </div>}
  </div>);
}
