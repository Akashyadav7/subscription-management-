import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Profile(){
  const [u,setU]=useState(null); const [c,setC]=useState(null);
  useEffect(()=>{ api.get('/profile').then(r=>setU(r.data)).catch(()=>{}); api.get('/customers').then(r=>{ if(r.data && r.data[0]) setC(r.data[0]); }).catch(()=>{}); },[]);
  if(!u) return <div>Loading...</div>;
  return (<div><h2 style={{color:'#1e2a4a'}}>My Profile</h2><div style={{background:'#fff',padding:16,marginTop:12,borderRadius:8}}>
    <p><strong>Name:</strong> {c?.name || u.name}</p>
    <p><strong>Email:</strong> {c?.email || u.email}</p>
    <p><strong>Phone:</strong> {c?.phone || '-'}</p>
    <p><strong>Address:</strong> {c?.address || '-'}</p>
    <p><strong>Role:</strong> {u.role}</p>
  </div></div>);
}
