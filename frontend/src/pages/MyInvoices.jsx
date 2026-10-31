import { useEffect, useState } from 'react';
import api from '../services/api';
export default function MyInvoices(){
  const [list,setList]=useState([]);
  useEffect(()=>{ api.get('/invoices').then(r=>setList(r.data)).catch(()=>{}); },[]);
  return (<div><h2 style={{color:'#1e2a4a'}}>My Invoices</h2>
  <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
    <thead><tr><th style={{padding:8,textAlign:'left'}}>Number</th><th style={{padding:8,textAlign:'left'}}>Total</th><th style={{padding:8,textAlign:'left'}}>Status</th><th style={{padding:8,textAlign:'left'}}>Due</th></tr></thead>
    <tbody>{list.map(i=><tr key={i.id}><td style={{padding:8}}>{i.number}</td><td style={{padding:8}}>₹{i.total}</td><td style={{padding:8}}>{i.status}</td><td style={{padding:8}}>{i.due_date}</td></tr>)}</tbody>
  </table>
  {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No invoices.</p>}
  </div>);
}

