import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login(){
  const [email,setEmail]=useState('admin@brightloop.com');
  const [password,setPassword]=useState('Admin@123');
  const [err,setErr]=useState('');
  const {login}=useAuth();
  const nav=useNavigate();
  const submit=async e=>{ e.preventDefault(); try{ await login(email,password); nav('/'); }catch(e){ setErr(e.response?.data?.error||'Login failed'); } };
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f6fa'}}>
      <form onSubmit={submit} style={{background:'#fff',padding:32,borderRadius:12,width:360,boxShadow:'0 4px 20px rgba(0,0,0,.08)'}}>
        <h2 style={{marginBottom:8}}>BrightLoop Login</h2>
        <p style={{fontSize:12,color:'#666',marginBottom:16}}>Demo: admin@brightloop.com / Admin@123 | staff@brightloop.com / Staff@123 | customer@brightloop.com / Customer@123</p>
        {err&&<div style={{color:'red',marginBottom:8}}>{err}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{width:'100%',padding:10,marginBottom:8,border:'1px solid #ddd',borderRadius:6}}/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{width:'100%',padding:10,marginBottom:16,border:'1px solid #ddd',borderRadius:6}}/>
        <button style={{width:'100%',padding:10,background:'#6c5ce7',color:'#fff',border:'none',borderRadius:6}}>Login</button>
      </form>
    </div>
  );
}
