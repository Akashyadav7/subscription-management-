import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthCtx = createContext(null);
export function AuthProvider({children}){
  const [user,setUser] = useState(()=>{ try{return JSON.parse(localStorage.getItem('user'));}catch{return null;} });
  const [token,setToken] = useState(()=>localStorage.getItem('token'));
  const login = async (email,password) => {
    const {data} = await api.post('/auth/login',{email,password});
    localStorage.setItem('token',data.token); localStorage.setItem('user',JSON.stringify(data.user));
    setToken(data.token); setUser(data.user); return data.user;
  };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); };
  return <AuthCtx.Provider value={{user,token,login,logout}}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
