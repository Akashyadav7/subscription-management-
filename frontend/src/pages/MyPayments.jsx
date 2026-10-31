import { useEffect, useState } from 'react';
import api from '../services/api';
export default function MyPayments(){
  const [list,setList]=useState([]);
  useEffect(()=>{ api.get('/payments').then(r=>setList(r.data)).catch(()=>{}); },[]);
  return (<div><h2 style={{color:'#1e2a4a'}}>My Payments</h2>
  <table style={{width:'100%',background:'#fff',marginTop:12,borderCollapse:'collapse'}}>
    <thead><tr><th style={{padding:8,textAlign:'left'}}>Invoice</th><th style={{padding:8,textAlign:'left'}}>Amount</th><th style={{padding:8,textAlign:'left'}}>Method</th><th style={{padding:8,textAlign:'left'}}>Date</th></tr></thead>
    <tbody>{list.map(p=><tr key={p.id}><td style={{padding:8}}>{p.invoice_id}</td><td style={{padding:8}}>₹{p.amount}</td><td style={{padding:8}}>{p.method}</td><td style={{padding:8}}>{p.paid_at}</td></tr>)}</tbody>
  </table>
  {list.length===0&&<p style={{marginTop:12,color:'#666'}}>No payments.</p>}
  </div>);
}
