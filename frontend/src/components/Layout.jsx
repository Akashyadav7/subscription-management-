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
const staffNav = [
  {path:'/',label:'Dashboard',icon:LayoutDashboard},
  {path:'/customers',label:'Customers',icon:Users},
  {path:'/subscriptions',label:'Subscriptions',icon:FileText},
  {path:'/invoices',label:'Invoices',icon:Receipt},
  {path:'/payments',label:'Payments',icon:DollarSign},
  {path:'/profile',label:'My Profile',icon:User},
];
const customerNav = [
  {path:'/',label:'Dashboard',icon:LayoutDashboard},
  {path:'/my-subscriptions',label:'My Subscriptions',icon:FileText},
  {path:'/my-invoices',label:'My Invoices',icon:Receipt},
  {path:'/my-payments',label:'My Payments',icon:DollarSign},
  {path:'/profile',label:'My Profile',icon:User},
];

export default function Layout(){
  const {user,logout}=useAuth();
  const navv=useNavigate();
  const loc=useLocation();
  const nav = user?.role==='admin' ? adminNav : user?.role==='customer' ? customerNav : staffNav;
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f5f6fa'}}>
      <aside style={{width:240,background:'#1e2a4a',color:'#fff',padding:20,display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:8,background:'#6c5ce7',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>B</div>
          <h2 style={{margin:0,color:'#fff',fontSize:20}}>BrightLoop</h2>
        </div>
        <nav style={{flex:1}}>
          {nav.map(n=>(
            <div key={n.path} onClick={()=>navv(n.path)} style={{padding:'10px 14px',marginBottom:4,borderRadius:8,cursor:'pointer',background:loc.pathname===n.path?'#6c5ce7':'transparent',display:'flex',alignItems:'center',gap:10,transition:'background .15s',fontSize:14}}>
              <n.icon size={18}/>{n.label}
            </div>
          ))}
        </nav>
        <div style={{borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:12}}>
          <div style={{fontSize:12,opacity:.7,marginBottom:8}}>{user?.email}</div>
          <div onClick={logout} style={{padding:'8px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,borderRadius:8,background:'rgba(255,255,255,.05)'}}><LogOut size={16}/>Logout</div>
        </div>
      </aside>
      <main style={{flex:1,padding:28,overflow:'auto'}}>
        <Outlet/>
      </main>
    </div>
  );
}
