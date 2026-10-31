import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, CreditCard, Users, FileText, Receipt, DollarSign, Tag, Settings, LogOut, User } from 'lucide-react';

const adminNav = [
  {path:'/',label:'Dashboard',icon:LayoutDashboard},
  {path:'/products',label:'Products',icon:Package},
  {path:'/plans',label:'Plans',icon:CreditCard},
  {path:'/customers',label:'Customers',icon:Users},
  {path:'/subscriptions',label:'Subscriptions',icon:FileText},
  {path:'/invoices',label:'Invoices',icon:Receipt},
  {path:'/payments',label:'Payments',icon:DollarSign},
  {path:'/discounts',label:'Discounts',icon:Tag},
  {path:'/taxes',label:'Tax',icon:Settings},
];
const customerNav = [
  {path:'/',label:'Dashboard',icon:LayoutDashboard},
  {path:'/my-subscriptions',label:'My Subscriptions',icon:FileText},
  {path:'/my-invoices',label:'My Invoices',icon:Receipt},
  {path:'/my-payments',label:'My Payments',icon:DollarSign},
  {path:'/profile',label:'My Profile',icon:User},
];
const staffNav = [
  {path:'/',label:'Dashboard',icon:LayoutDashboard},
  {path:'/customers',label:'Customers',icon:Users},
  {path:'/subscriptions',label:'Subscriptions',icon:FileText},
  {path:'/invoices',label:'Invoices',icon:Receipt},
  {path:'/payments',label:'Payments',icon:DollarSign},
  {path:'/profile',label:'My Profile',icon:User},
];

export default function Layout(){
  const {user,logout}=useAuth();
  const navv=useNavigate();
  const loc=useLocation();
  const nav = user?.role==='admin' ? adminNav : user?.role==='customer' ? customerNav : staffNav;
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f5f6fa'}}>
      <aside style={{width:220,background:'#1e2a4a',color:'#fff',padding:16}}>
        <h2 style={{marginBottom:20}}>BrightLoop</h2>
        {nav.map(n=>(
          <div key={n.path} onClick={()=>navv(n.path)} style={{padding:'10px 12px',marginBottom:4,borderRadius:8,cursor:'pointer',background:loc.pathname===n.path?'#6c5ce7':'transparent',display:'flex',alignItems:'center',gap:8}}>
            <n.icon size={18}/>{n.label}
          </div>
        ))}
        <div onClick={logout} style={{padding:'10px 12px',marginTop:20,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}><LogOut size={18}/>Logout</div>
        <div style={{marginTop:20,fontSize:12,opacity:.7}}>{user?.email} ({user?.role})</div>
      </aside>
      <main style={{flex:1,padding:24}}>
        <Outlet/>
      </main>
    </div>
  );
}

