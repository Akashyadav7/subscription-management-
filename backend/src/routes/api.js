const express = require('express');
const router = express.Router();
const { db, authMiddleware, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = (function(){ try { return require('uuid'); } catch(e){ return {v4:()=>Date.now().toString(36)+Math.random().toString(36).slice(2)}; } })();

// PRODUCTS
router.get('/products', authMiddleware, (req,res)=>{ res.json(db.prepare('SELECT * FROM products ORDER BY id DESC').all()); });
router.post('/products', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,type,sales_price,cost_price,description,notes,variants} = req.body;
  const info = db.prepare('INSERT INTO products (name,type,sales_price,cost_price,description,notes) VALUES (?,?,?,?,?,?)').run(name,type,sales_price||0,cost_price||0,description,notes);
  if(Array.isArray(variants)) variants.forEach(v=> db.prepare('INSERT INTO product_variants (product_id,name,price_delta) VALUES (?,?,?)').run(info.lastInsertRowid,v.name,v.price_delta||0));
  res.json({id:info.lastInsertRowid});
});
router.put('/products/:id', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,type,sales_price,cost_price,description,notes,variants} = req.body;
  db.prepare('UPDATE products SET name=?,type=?,sales_price=?,cost_price=?,description=?,notes=? WHERE id=?').run(name,type,sales_price||0,cost_price||0,description,notes,req.params.id);
  if(Array.isArray(variants)){ db.prepare('DELETE FROM product_variants WHERE product_id=?').run(req.params.id); variants.forEach(v=> db.prepare('INSERT INTO product_variants (product_id,name,price_delta) VALUES (?,?,?)').run(req.params.id,v.name,v.price_delta||0)); }
  res.json({ok:true});
});
router.delete('/products/:id', authMiddleware, requireRole('admin'), (req,res)=>{ db.prepare('DELETE FROM products WHERE id=?').run(req.params.id); res.json({ok:true}); });
router.get('/products/:id/variants', authMiddleware, (req,res)=>{ res.json(db.prepare('SELECT * FROM product_variants WHERE product_id=?').all(req.params.id)); });

// PLANS
router.get('/plans', authMiddleware, (req,res)=>{ res.json(db.prepare('SELECT p.*, pr.name as product_name FROM plans p LEFT JOIN products pr ON p.product_id=pr.id ORDER BY p.id DESC').all()); });
router.post('/plans', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,product_id,price,billing_interval,min_quantity,available_from,available_to,auto_close,active} = req.body;
  const info = db.prepare('INSERT INTO plans (name,product_id,price,billing_interval,min_quantity,available_from,available_to,auto_close,active) VALUES (?,?,?,?,?,?,?,?,?)').run(name,product_id,price||0,billing_interval||'monthly',min_quantity||1,available_from,available_to,auto_close?1:0,active!==false?1:0);
  res.json({id:info.lastInsertRowid});
});
router.put('/plans/:id', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,product_id,price,billing_interval,min_quantity,available_from,available_to,auto_close,active} = req.body;
  db.prepare('UPDATE plans SET name=?,product_id=?,price=?,billing_interval=?,min_quantity=?,available_from=?,available_to=?,auto_close=?,active=? WHERE id=?').run(name,product_id,price||0,billing_interval||'monthly',min_quantity||1,available_from,available_to,auto_close?1:0,active!==false?1:0,req.params.id);
  res.json({ok:true});
});
router.delete('/plans/:id', authMiddleware, requireRole('admin'), (req,res)=>{ db.prepare('UPDATE plans SET active=0 WHERE id=?').run(req.params.id); res.json({ok:true}); });

// CUSTOMERS
router.get('/customers', authMiddleware, (req,res)=>{
  if(req.user.role==='customer'){
    const c = db.prepare('SELECT * FROM customers WHERE user_id=?').get(req.user.id);
    return res.json(c?[c]:[]);
  }
  const q = req.query.q||'';
  res.json(db.prepare('SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? ORDER BY id DESC').all('%'+q+'%','%'+q+'%'));
});
router.post('/customers', authMiddleware, (req,res)=>{
  const {name,email,phone,address} = req.body;
  const info = db.prepare('INSERT INTO customers (name,email,phone,address) VALUES (?,?,?,?)').run(name,email,phone,address);
  res.json({id:info.lastInsertRowid});
});
router.put('/customers/:id', authMiddleware, (req,res)=>{
  const {name,email,phone,address} = req.body;
  // customer can only edit own
  if(req.user.role==='customer'){
    const c = db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id);
    if(!c || c.id!=req.params.id) return res.status(403).json({error:'Forbidden'});
  }
  db.prepare('UPDATE customers SET name=?,email=?,phone=?,address=? WHERE id=?').run(name,email,phone,address,req.params.id);
  res.json({ok:true});
});
router.get('/customers/:id', authMiddleware, (req,res)=>{
  if(req.user.role==='customer'){
    const c = db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id);
    if(!c || c.id!=req.params.id) return res.status(403).json({error:'Forbidden'});
  }
  const c = db.prepare('SELECT * FROM customers WHERE id=?').get(req.params.id);
  const subs = db.prepare('SELECT * FROM subscriptions WHERE customer_id=?').all(req.params.id);
  const invs = db.prepare('SELECT * FROM invoices WHERE customer_id=?').all(req.params.id);
  res.json({customer:c,subscriptions:subs,invoices:invs});
});

// DISCOUNTS
router.get('/discounts', authMiddleware, (req,res)=>{ res.json(db.prepare('SELECT * FROM discounts ORDER BY id DESC').all()); });
router.post('/discounts', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,type,value,min_purchase,min_quantity,start_date,end_date,max_usage,applies_to,product_id,active} = req.body;
  const info = db.prepare('INSERT INTO discounts (name,type,value,min_purchase,min_quantity,start_date,end_date,max_usage,applies_to,product_id,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(name,type||'fixed',value||0,min_purchase||0,min_quantity||0,start_date,end_date,max_usage||0,applies_to||'all',product_id||null,active!==false?1:0);
  res.json({id:info.lastInsertRowid});
});
router.put('/discounts/:id', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,type,value,min_purchase,min_quantity,start_date,end_date,max_usage,applies_to,product_id,active} = req.body;
  db.prepare('UPDATE discounts SET name=?,type=?,value=?,min_purchase=?,min_quantity=?,start_date=?,end_date=?,max_usage=?,applies_to=?,product_id=?,active=? WHERE id=?').run(name,type||'fixed',value||0,min_purchase||0,min_quantity||0,start_date,end_date,max_usage||0,applies_to||'all',product_id||null,active!==false?1:0,req.params.id);
  res.json({ok:true});
});
router.delete('/discounts/:id', authMiddleware, requireRole('admin'), (req,res)=>{ db.prepare('DELETE FROM discounts WHERE id=?').run(req.params.id); res.json({ok:true}); });

// TAX
router.get('/taxes', authMiddleware, (req,res)=>{ res.json(db.prepare('SELECT * FROM tax_rules ORDER BY id DESC').all()); });
router.post('/taxes', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,percentage,active} = req.body;
  const info = db.prepare('INSERT INTO tax_rules (name,percentage,active) VALUES (?,?,?)').run(name,percentage||0,active!==false?1:0);
  res.json({id:info.lastInsertRowid});
});
router.put('/taxes/:id', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,percentage,active} = req.body;
  db.prepare('UPDATE tax_rules SET name=?,percentage=?,active=? WHERE id=?').run(name,percentage||0,active!==false?1:0,req.params.id);
  res.json({ok:true});
});

// USERS/STAFF
router.get('/users', authMiddleware, requireRole('admin'), (req,res)=>{ res.json(db.prepare('SELECT id,name,email,role,created_at FROM users ORDER BY id DESC').all()); });
router.post('/users', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,email,password,role} = req.body;
  if(!passwordValid2(password)) return res.status(400).json({error:'Weak password'});
  const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email);
  if(exists) return res.status(400).json({error:'Email exists'});
  const hash = bcrypt2? null : null;
  const bcrypt = require('bcryptjs');
  const h = bcrypt.hashSync(password,10);
  const info = db.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)').run(name,email,h,role||'staff');
  if(role==='customer') db.prepare('INSERT INTO customers (name,email,user_id) VALUES (?,?,?)').run(name,email,info.lastInsertRowid);
  res.json({id:info.lastInsertRowid});
});

function passwordValid2(p){ return p && p.length>8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[^A-Za-z0-9]/.test(p); }

// SUBSCRIPTIONS
router.get('/subscriptions', authMiddleware, (req,res)=>{
  let rows;
  if(req.user.role==='customer'){
    const c = db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id);
    rows = db.prepare('SELECT s.*, c.name as customer_name, p.name as plan_name FROM subscriptions s JOIN customers c ON s.customer_id=c.id JOIN plans p ON s.plan_id=p.id WHERE s.customer_id=? ORDER BY s.id DESC').all(c?.id);
  } else {
    rows = db.prepare('SELECT s.*, c.name as customer_name, p.name as plan_name FROM subscriptions s JOIN customers c ON s.customer_id=c.id JOIN plans p ON s.plan_id=p.id ORDER BY s.id DESC').all();
  }
  res.json(rows);
});
router.get('/subscriptions/:id', authMiddleware, (req,res)=>{
  const s = db.prepare('SELECT s.*, c.name as customer_name, p.name as plan_name FROM subscriptions s JOIN customers c ON s.customer_id=c.id JOIN plans p ON s.plan_id=p.id WHERE s.id=?').get(req.params.id);
  if(!s) return res.status(404).json({error:'Not found'});
  if(req.user.role==='customer'){ const c=db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id); if(c?.id!==s.customer_id) return res.status(403).json({error:'Forbidden'}); }
  const items = db.prepare('SELECT si.*, pr.name as product_name FROM subscription_items si JOIN products pr ON si.product_id=pr.id WHERE si.subscription_id=?').all(req.params.id);
  const history = db.prepare('SELECT * FROM subscription_status_history WHERE subscription_id=? ORDER BY id').all(req.params.id);
  res.json({subscription:s,items,history});
});
router.post('/subscriptions', authMiddleware, (req,res)=>{
  const {customer_id,plan_id,start_date,expiry_date,payment_terms,status,items} = req.body;
  const number = 'SUB-'+Date.now().toString().slice(-6);
  const info = db.prepare('INSERT INTO subscriptions (number,customer_id,plan_id,start_date,expiry_date,payment_terms,status) VALUES (?,?,?,?,?,?,?)').run(number,customer_id,plan_id,start_date,expiry_date,payment_terms,status||'draft');
  const sid = info.lastInsertRowid;
  if(Array.isArray(items)) items.forEach(it=>{
    const amt = (it.quantity||1)*(it.unit_price||0);
    db.prepare('INSERT INTO subscription_items (subscription_id,product_id,variant_id,quantity,unit_price,tax_rate,amount) VALUES (?,?,?,?,?,?,?)').run(sid,it.product_id,it.variant_id||null,it.quantity||1,it.unit_price||0,it.tax_rate||0,amt);
  });
  db.prepare('INSERT INTO subscription_status_history (subscription_id,status) VALUES (?,?)').run(sid,status||'draft');
  res.json({id:sid,number});
});
router.put('/subscriptions/:id/status', authMiddleware, (req,res)=>{
  const {status} = req.body;
  db.prepare('UPDATE subscriptions SET status=? WHERE id=?').run(status,req.params.id);
  db.prepare('INSERT INTO subscription_status_history (subscription_id,status) VALUES (?,?)').run(req.params.id,status);
  res.json({ok:true});
});
router.post('/subscriptions/:id/renew', authMiddleware, (req,res)=>{
  const s = db.prepare('SELECT * FROM subscriptions WHERE id=?').get(req.params.id);
  const number = 'SUB-'+Date.now().toString().slice(-6);
  const info = db.prepare('INSERT INTO subscriptions (number,customer_id,plan_id,start_date,expiry_date,payment_terms,status) VALUES (?,?,?,?,?,?,?)').run(number,s.customer_id,s.plan_id,new Date().toISOString().slice(0,10),s.expiry_date,s.payment_terms,'active');
  res.json({id:info.lastInsertRowid,number});
});

// INVOICES
function calcInvoice(subId){
  const items = db.prepare('SELECT * FROM subscription_items WHERE subscription_id=?').all(subId);
  let subtotal=0;
  items.forEach(it=> subtotal+=it.amount);
  // discount
  let discount=0;
  const discs = db.prepare('SELECT * FROM discounts WHERE active=1').all();
  const now = new Date().toISOString().slice(0,10);
  for(const d of discs){
    if(d.start_date && now<d.start_date) continue;
    if(d.end_date && now>d.end_date) continue;
    if(d.max_usage>0 && d.usage_count>=d.max_usage) continue;
    if(d.min_purchase>0 && subtotal<d.min_purchase) continue;
    let totalQty = items.reduce((a,b)=>a+b.quantity,0);
    if(d.min_quantity>0 && totalQty<d.min_quantity) continue;
    if(d.type==='fixed') discount+=d.value; else discount+=subtotal*d.value/100;
  }
  if(discount>subtotal) discount=subtotal;
  const taxable = subtotal-discount;
  // tax: use item tax rates
  let tax=0;
  items.forEach(it=> tax += it.amount * (it.tax_rate||0)/100);
  // scale tax by discount proportion
  if(subtotal>0) tax = tax*(taxable/subtotal);
  const total = taxable+tax;
  return {subtotal,discount,taxable,tax,total,items};
}

router.get('/invoices', authMiddleware, (req,res)=>{
  let rows;
  if(req.user.role==='customer'){
    const c = db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id);
    rows = db.prepare('SELECT i.*, c.name as customer_name FROM invoices i JOIN customers c ON i.customer_id=c.id WHERE i.customer_id=? ORDER BY i.id DESC').all(c?.id);
  } else {
    rows = db.prepare('SELECT i.*, c.name as customer_name FROM invoices i JOIN customers c ON i.customer_id=c.id ORDER BY i.id DESC').all();
  }
  res.json(rows);
});
router.get('/invoices/:id', authMiddleware, (req,res)=>{
  const inv = db.prepare('SELECT i.*, c.name as customer_name, c.email as customer_email, c.phone, c.address FROM invoices i JOIN customers c ON i.customer_id=c.id WHERE i.id=?').get(req.params.id);
  if(!inv) return res.status(404).json({error:'Not found'});
  if(req.user.role==='customer'){ const c=db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id); if(c?.id!==inv.customer_id) return res.status(403).json({error:'Forbidden'}); }
  const items = db.prepare('SELECT ii.*, p.name as product_name FROM invoice_items ii JOIN products p ON ii.product_id=p.id WHERE ii.invoice_id=?').all(req.params.id);
  const payments = db.prepare('SELECT * FROM payments WHERE invoice_id=?').all(req.params.id);
  const paid = payments.reduce((a,b)=>a+b.amount,0);
  res.json({invoice:inv,items,payments,paid,balance:inv.total-paid});
});
router.post('/invoices/generate', authMiddleware, requireRole('admin','staff'), (req,res)=>{
  const {subscription_ids} = req.body;
  const ids = Array.isArray(subscription_ids)? subscription_ids : [];
  const subs = ids.length? ids : db.prepare("SELECT id FROM subscriptions WHERE status='active'").all().map(x=>x.id);
  const created=[];
  const tx = db.transaction(()=>{
    for(const sid of subs){
      const s = db.prepare('SELECT * FROM subscriptions WHERE id=?').get(sid);
      if(!s || (s.status!=='active' && s.status!=='confirmed')) continue;
      // prevent duplicate for current month
      const period = new Date().toISOString().slice(0,7);
      const dup = db.prepare('SELECT id FROM invoices WHERE subscription_id=? AND billing_period=?').get(sid,period);
      if(dup) continue;
      const c = calcInvoice(sid);
      const number = 'INV-'+Date.now().toString().slice(-6)+sid;
      const due = new Date(); due.setDate(due.getDate()+15);
      const iid = db.prepare('INSERT INTO invoices (number,subscription_id,customer_id,billing_period,due_date,subtotal,discount,taxable,tax,total,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(number,sid,s.customer_id,period,due.toISOString().slice(0,10),c.subtotal,c.discount,c.taxable,c.tax,c.total,'confirmed').lastInsertRowid;
      c.items.forEach(it=> db.prepare('INSERT INTO invoice_items (invoice_id,product_id,description,quantity,unit_price,tax_rate,tax_amount,amount) VALUES (?,?,?,?,?,?,?,?)').run(iid,it.product_id,'Line',it.quantity,it.unit_price,it.tax_rate, it.amount*(it.tax_rate||0)/100, it.amount));
      // increment discount usage
      db.prepare('UPDATE discounts SET usage_count=usage_count+1 WHERE active=1').run();
      created.push(iid);
    }
  });
  tx();
  res.json({created});
});
router.post('/invoices/:id/confirm', authMiddleware, requireRole('admin','staff'), (req,res)=>{ db.prepare('UPDATE invoices SET status="confirmed" WHERE id=?').run(req.params.id); res.json({ok:true}); });
router.post('/invoices/:id/cancel', authMiddleware, requireRole('admin','staff'), (req,res)=>{ db.prepare('UPDATE invoices SET status="cancelled" WHERE id=?').run(req.params.id); res.json({ok:true}); });

// PAYMENTS
router.get('/payments', authMiddleware, (req,res)=>{
  if(req.user.role==='customer'){
    const c = db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id);
    const invIds = db.prepare('SELECT id FROM invoices WHERE customer_id=?').all(c?.id).map(x=>x.id);
    if(!invIds.length) return res.json([]);
    const ph = invIds.map(()=>'?').join(',');
    return res.json(db.prepare(`SELECT * FROM payments WHERE invoice_id IN (${ph}) ORDER BY id DESC`).all(...invIds));
  }
  res.json(db.prepare('SELECT * FROM payments ORDER BY id DESC').all());
});
router.post('/payments', authMiddleware, (req,res)=>{
  const {invoice_id,amount,method,paid_at,note} = req.body;
  const inv = db.prepare('SELECT * FROM invoices WHERE id=?').get(invoice_id);
  if(!inv) return res.status(404).json({error:'Invoice not found'});
  if(req.user.role==='customer'){ const c=db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id); if(c?.id!==inv.customer_id) return res.status(403).json({error:'Forbidden'}); }
  const payments = db.prepare('SELECT COALESCE(SUM(amount),0) s FROM payments WHERE invoice_id=?').get(invoice_id).s;
  const balance = inv.total - payments;
  if(amount>balance+0.001) return res.status(400).json({error:'Amount exceeds balance'});
  db.prepare('INSERT INTO payments (invoice_id,amount,method,paid_at,note) VALUES (?,?,?,?,?)').run(invoice_id,amount,method||'cash',paid_at||new Date().toISOString().slice(0,10),note);
  const newPaid = payments + amount;
  if(newPaid >= inv.total - 0.001) db.prepare(`UPDATE invoices SET status='paid' WHERE id=?`).run(invoice_id);
  res.json({ok:true,balance:inv.total-newPaid});
});

// DASHBOARD
router.get('/dashboard', authMiddleware, (req,res)=>{
  const totalCustomers = db.prepare('SELECT COUNT(*) c FROM customers').get().c;
  const activeSubs = db.prepare(`SELECT COUNT(*) c FROM subscriptions WHERE status='active'`).get().c;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(amount),0) s FROM payments').get().s;
  const outstanding = db.prepare(`SELECT COALESCE(SUM(total),0) s FROM invoices WHERE status IN ('confirmed','draft')`).get().s;
  const overdue = db.prepare(`SELECT COUNT(*) c FROM invoices WHERE status='confirmed' AND due_date < date('now')`).get().c;
  const mrr = db.prepare(`SELECT COALESCE(SUM(p.price),0) s FROM subscriptions s JOIN plans p ON s.plan_id=p.id WHERE s.status='active' AND p.billing_interval='monthly'`).get().s;
  const recentSubs = db.prepare('SELECT s.*, c.name as customer_name FROM subscriptions s JOIN customers c ON s.customer_id=c.id ORDER BY s.id DESC LIMIT 5').all();
  const recentPayments = db.prepare('SELECT * FROM payments ORDER BY id DESC LIMIT 5').all();
  const upcomingRenewals = db.prepare(`SELECT s.*, c.name as customer_name FROM subscriptions s JOIN customers c ON s.customer_id=c.id WHERE s.expiry_date >= date('now') ORDER BY s.expiry_date LIMIT 5`).all();
  // charts
  const subStatus = db.prepare('SELECT status, COUNT(*) count FROM subscriptions GROUP BY status').all();
  const invStatus = db.prepare('SELECT status, COUNT(*) count FROM invoices GROUP BY status').all();
  const revenueByMonth = db.prepare(`SELECT strftime('%Y-%m', paid_at) m, SUM(amount) total FROM payments GROUP BY m ORDER BY m`).all();
  res.json({totalCustomers,activeSubs,mrr,totalRevenue,outstanding,overdue,recentSubs,recentPayments,upcomingRenewals,subStatus,invStatus,revenueByMonth});
});

// QUOTATIONS (templates)
router.get('/quotations', authMiddleware, (req,res)=>{ res.json(db.prepare('SELECT * FROM quotation_templates ORDER BY id DESC').all()); });
router.post('/quotations', authMiddleware, requireRole('admin'), (req,res)=>{
  const {name,validity_days} = req.body;
  const info = db.prepare('INSERT INTO quotation_templates (name,validity_days) VALUES (?,?)').run(name,validity_days||30);
  res.json({id:info.lastInsertRowid});
});

// PROFILE
router.get('/profile', authMiddleware, (req,res)=>{ const u=db.prepare('SELECT id,name,email,role,created_at FROM users WHERE id=?').get(req.user.id); res.json(u); });


// CUSTOMER DASHBOARD
router.get('/customer/dashboard', authMiddleware, (req,res)=>{
  if(req.user.role!=='customer') return res.status(403).json({error:'Forbidden'});
  const c = db.prepare('SELECT id FROM customers WHERE user_id=?').get(req.user.id);
  if(!c) return res.status(404).json({error:'No customer record'});
  const cid = c.id;
  const activeSubs = db.prepare("SELECT COUNT(*) c FROM subscriptions WHERE customer_id=? AND status='active'").get(cid).c;
  const totalPaid = db.prepare('SELECT COALESCE(SUM(p.amount),0) s FROM payments p JOIN invoices i ON p.invoice_id=i.id WHERE i.customer_id=?').get(cid).s;
  const outstanding = db.prepare("SELECT COALESCE(SUM(total),0) s FROM invoices WHERE customer_id=? AND status IN ('confirmed','draft')").get(cid).s;
  const recentSubs = db.prepare('SELECT s.*, pl.name as plan_name FROM subscriptions s JOIN plans pl ON s.plan_id=pl.id WHERE s.customer_id=? ORDER BY s.id DESC LIMIT 5').all(cid);
  const recentInvs = db.prepare('SELECT * FROM invoices WHERE customer_id=? ORDER BY id DESC LIMIT 5').all(cid);
  const recentPays = db.prepare('SELECT p.* FROM payments p JOIN invoices i ON p.invoice_id=i.id WHERE i.customer_id=? ORDER BY p.id DESC LIMIT 5').all(cid);
  const upcoming = db.prepare("SELECT * FROM invoices WHERE customer_id=? AND status='confirmed' ORDER BY due_date LIMIT 5").all(cid);
  res.json({activeSubs,totalPaid,outstanding,recentSubs,recentInvs,recentPays,upcoming});
});

module.exports = router;

