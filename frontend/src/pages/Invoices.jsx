import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Invoices(){
  const [list,setList]=useState([]);
  const load=()=>api.get('/invoices').then(r=>setList(r.data));
  useEffect(()=>{load();},[]);
  const gen=async()=>{ await api.post('/invoices/generate',{}); load(); };
  return (<div><div style={{display:'flex',justifyContent:'space-between'}}><h2>Invoices</h2><button onClick={gen} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6}}>Generate Invoices</button></div>
  <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
    <thead><tr><th style={{padding:8,textAlign:'left'}}>Number</th><th style={{padding:8,textAlign:'left'}}>Customer</th><th style={{padding:8,textAlign:'left'}}>Total</th><th style={{padding:8,textAlign:'left'}}>Status</th></tr></thead>
    <tbody>{list.map(i=><tr key={i.id}><td style={{padding:8}}>{i.number}</td><td style={{padding:8}}>{i.customer_name}</td><td style={{padding:8}}>₹{i.total}</td><td style={{padding:8}}>{i.status}</td></tr>)}</tbody>
  </table>
  {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No invoices.</p>}
  </div>);
}
