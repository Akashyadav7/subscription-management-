import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Payments(){
  const [list,setList]=useState([]); const [invoices,setInvoices]=useState([]);
  const [q,setQ]=useState(''); const [show,setShow]=useState(false);
  const [form,setForm]=useState({invoice_id:'',amount:0,method:'cash',paid_at:new Date().toISOString().slice(0,10),note:''});
  const [invDetail,setInvDetail]=useState(null); const [msg,setMsg]=useState('');
  const load=()=>{api.get('/payments').then(r=>setList(r.data));api.get('/invoices').then(r=>setInvoices(r.data));};
  useEffect(()=>{load();},[]);
  useEffect(()=>{
    if(!form.invoice_id){ setInvDetail(null); return; }
    api.get('/invoices/'+form.invoice_id).then(r=>setInvDetail(r.data)).catch(()=>setInvDetail(null));
  },[form.invoice_id]);
  const filtered=list.filter(p=>!q||String(p.invoice_id).includes(q));
  const outstanding = invDetail ? invDetail.balance : 0;
  const alreadyPaid = invDetail ? invDetail.paid : 0;
  const total = invDetail ? invDetail.invoice.total : 0;
  const fullyPaid = invDetail && outstanding <= 0.001;
  const validAmount = form.amount > 0 && form.amount <= outstanding + 0.001;
  const canSave = form.invoice_id && validAmount && !fullyPaid;
  const save=async()=>{
    setMsg('');
    if(fullyPaid){ setMsg('This invoice is already fully paid.'); return; }
    if(!form.invoice_id){ setMsg('Please select an invoice.'); return; }
    if(!validAmount){ setMsg('Amount must be greater than 0 and not exceed outstanding balance.'); return; }
    try { await api.post('/payments',form); setShow(false); setMsg('Payment recorded successfully.'); load(); }
    catch(e){ setMsg(e.response?.data?.error||'Payment failed.'); }
  };
  const totalCollected=list.reduce((a,b)=>a+b.amount,0);
  return (<div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h2 style={{margin:0,fontSize:20,color:'#1e2a4a'}}>Payments</h2><p style={{margin:'4px 0 0',color:'#636e72',fontSize:13}}>Track payment collections.</p></div>
      <button onClick={()=>setShow(!show)} style={{background:'#6c5ce7',color:'#fff',border:'none',padding:'10px 16px',borderRadius:8,cursor:'pointer'}}>Record Payment</button>
    </div>
    <div style={{background:'#fff',padding:12,borderRadius:12,border:'1px solid #dfe6e9',display:'inline-block',minWidth:160}}><div style={{fontSize:12,color:'#636e72'}}>Total Collected</div><div style={{fontSize:22,fontWeight:700,color:'#1e2a4a'}}>₹{totalCollected}</div></div>
    {show&&<div style={{background:'#fff',padding:16,marginTop:4,borderRadius:12,border:'1px solid #dfe6e9'}}>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:8}}>
        <select value={form.invoice_id} onChange={e=>setForm({...form,invoice_id:+e.target.value})} style={{padding:8}}>
          <option value="">Select Invoice</option>{invoices.map(i=><option key={i.id} value={i.id}>{i.number}</option>)}
        </select>
        {invDetail&&<div style={{fontSize:13,color:'#636e72'}}>
          <div>Customer: {invDetail.invoice.customer_name}</div>
          <div>Total: ₹{total} | Paid: ₹{alreadyPaid} | Outstanding: ₹{outstanding}</div>
        </div>}
      </div>
      {fullyPaid&&<div style={{color:'#d63031',marginBottom:8,fontSize:13}}>This invoice is already fully paid.</div>}
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <input placeholder="Amount" type="number" value={form.amount} onChange={e=>setForm({...form,amount:+e.target.value})} style={{padding:8}} disabled={fullyPaid}/>
        <select value={form.method} onChange={e=>setForm({...form,method:e.target.value})} style={{padding:8}}><option>cash</option><option>bank_transfer</option><option>upi</option><option>card</option></select>
        <input type="date" value={form.paid_at} onChange={e=>setForm({...form,paid_at:e.target.value})} style={{padding:8}}/>
        <button onClick={save} disabled={!canSave} style={{background:canSave?'#00b894':'#b2bec3',color:'#fff',border:'none',padding:'8px 14px',borderRadius:6,cursor:canSave?'pointer':'not-allowed'}}>Save</button>
      </div>
      {msg&&<div style={{marginTop:8,fontSize:13,color:msg.includes('success')?'#00b894':'#d63031'}}>{msg}</div>}
    </div>}
    <div style={{position:'relative',width:300}}><div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#999'}}>🔍</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search payments" style={{width:'100%',paddingLeft:32,padding:'9px 12px',fontSize:14,borderRadius:8,border:'1px solid #dfe6e9',background:'#fff'}}/></div>
    <div style={{background:'#fff',borderRadius:12,border:'1px solid #dfe6e9',overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Invoice</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Amount</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Method</th>
          <th style={{textAlign:'left',padding:'12px 14px',background:'#f0f1f5',color:'#1e2a4a',fontWeight:600,fontSize:13}}>Date</th>
        </tr></thead>
        <tbody>
          {filtered.map(p=>(<tr key={p.id} style={{borderBottom:'1px solid #f0f1f5'}}>
            <td style={{padding:'12px 14px',fontSize:14}}>{p.invoice_id}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>₹{p.amount}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{p.method}</td>
            <td style={{padding:'12px 14px',fontSize:14}}>{p.paid_at}</td>
          </tr>))}
          {filtered.length===0&&<tr><td style={{padding:24,textAlign:'center',color:'#636e72'}} colSpan={4}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>);
}
