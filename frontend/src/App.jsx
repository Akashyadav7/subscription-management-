import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StaffDashboard from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import MySubscriptions from './pages/MySubscriptions';
import MyInvoices from './pages/MyInvoices';
import MyPayments from './pages/MyPayments';
import Products from './pages/Products';
import Plans from './pages/Plans';
import Customers from './pages/Customers';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Discounts from './pages/Discounts';
import Taxes from './pages/Taxes';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

function Guard({children}){ const {user}=useAuth(); if(!user) return <Navigate to="/login"/>; return children; }
function AdminGuard({children}){ const {user}=useAuth(); if(user?.role!=='admin') return <Navigate to="/"/>; return children; }

export default function App(){
  return (
    <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/" element={<Guard><Layout/></Guard>}>
            <Route index element={<IndexPage/>}/>
            <Route path="customers" element={<Customers/>}/>
            <Route path="subscriptions" element={<Subscriptions/>}/>
            <Route path="invoices" element={<Invoices/>}/>
            <Route path="payments" element={<Payments/>}/>`n            <Route path="my-subscriptions" element={<MySubscriptions/>}/>`n            <Route path="my-invoices" element={<MyInvoices/>}/>`n            <Route path="my-payments" element={<MyPayments/>}/>`n            <Route path="profile" element={<Profile/>}/>
            <Route path="products" element={<AdminGuard><Products/></AdminGuard>}/>
            <Route path="plans" element={<AdminGuard><Plans/></AdminGuard>}/>
            <Route path="discounts" element={<AdminGuard><Discounts/></AdminGuard>}/>
            <Route path="taxes" element={<AdminGuard><Taxes/></AdminGuard>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}

function IndexPage(){
  const {user}=useAuth();
  return user?.role==='admin' ? <Dashboard/> : user?.role==='customer' ? <CustomerDashboard/> : <StaffDashboard/>;
}



