const bcrypt = require('bcryptjs');

function run(db) {
  const existing = db.prepare('SELECT COUNT(*) c FROM users').get();
  if (existing.c > 0) return;

  const hash = (p) => bcrypt.hashSync(p, 10);

  const insUser = db.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)');
  insUser.run('Admin User','admin@brightloop.com',hash('Admin@123'),'admin');
  insUser.run('Staff User','staff@brightloop.com',hash('Staff@123'),'staff');
  insUser.run('Customer User','customer@brightloop.com',hash('Customer@123'),'customer');

  const cust = db.prepare('INSERT INTO customers (name,email,phone,address,user_id) VALUES (?,?,?,?,?)');
  const customers = [
    ['Acme Corp','acme@example.com','9876543210','Mumbai, India',null],
    ['Beta LLC','beta@example.com','9876543211','Delhi, India',null],
    ['Gamma Inc','gamma@example.com','9876543212','Bangalore, India',null],
    ['Delta Co','delta@example.com','9876543213','Chennai, India',null],
    ['Epsilon Ltd','epsilon@example.com','9876543214','Hyderabad, India',null],
    ['Zeta Pvt','zeta@example.com','9876543215','Pune, India',null],
    ['Eta Systems','eta@example.com','9876543216','Kolkata, India',null],
    ['Theta Tech','theta@example.com','9876543217','Ahmedabad, India',null],
  ];
  const custIds = customers.map(c=>cust.run(...c).lastInsertRowid);
  // link customer user to first customer
  db.prepare('UPDATE customers SET user_id=? WHERE id=?').run(3, custIds[0]);

  const prod = db.prepare('INSERT INTO products (name,type,sales_price,cost_price,description,notes) VALUES (?,?,?,?,?,?)');
  const p1 = prod.run('Odoo','software',1000,400,'Odoo ERP software','').lastInsertRowid;
  const p2 = prod.run('BrightCRM','software',500,200,'CRM tool','').lastInsertRowid;
  const p3 = prod.run('Support Plan','service',300,100,'Support service','').lastInsertRowid;
  const p4 = prod.run('Analytics Module','software',800,300,'Analytics','').lastInsertRowid;
  const p5 = prod.run('Storage Addon','addon',200,50,'Storage','').lastInsertRowid;

  // variant: Odoo brand adds 560
  db.prepare('INSERT INTO product_variants (product_id,name,price_delta) VALUES (?,?,?)').run(p1,'Odoo Brand',560);

  const plan = db.prepare('INSERT INTO plans (name,product_id,price,billing_interval,min_quantity,available_from,available_to,auto_close,active) VALUES (?,?,?,?,?,?,?,?,?)');
  const pl1 = plan.run('Odoo Monthly',p1,1000,'monthly',1,'2025-01-01','2026-12-31',0,1).lastInsertRowid;
  const pl2 = plan.run('BrightCRM Monthly',p2,500,'monthly',1,'2025-01-01','2026-12-31',0,1).lastInsertRowid;
  const pl3 = plan.run('Support Yearly',p3,3000,'yearly',1,'2025-01-01','2026-12-31',1,1).lastInsertRowid;
  const pl4 = plan.run('Analytics Monthly',p4,800,'monthly',1,'2025-01-01','2026-12-31',0,1).lastInsertRowid;
  const pl5 = plan.run('Storage Weekly',p5,200,'weekly',1,'2025-01-01','2026-12-31',0,1).lastInsertRowid;

  db.prepare('INSERT INTO quotation_templates (name,validity_days) VALUES (?,?)').run('Standard Quotation',30);

  const tax = db.prepare('INSERT INTO tax_rules (name,percentage,active) VALUES (?,?,?)');
  const t1 = tax.run('GST 18%',18,1).lastInsertRowid;
  const t2 = tax.run('Service Tax 5%',5,1).lastInsertRowid;

  const disc = db.prepare('INSERT INTO discounts (name,type,value,min_purchase,min_quantity,start_date,end_date,max_usage,applies_to,product_id,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  disc.run('Flat 100','fixed',100,500,0,'2025-01-01','2026-12-31',100,'all',null,1);
  disc.run('10% Off','percentage',10,0,0,'2025-01-01','2026-12-31',50,'all',null,1);

  // subscriptions
  const sub = db.prepare('INSERT INTO subscriptions (number,customer_id,plan_id,start_date,expiry_date,payment_terms,status) VALUES (?,?,?,?,?,?,?)');
  const statuses = ['draft','quotation','confirmed','active','paused','closed'];
  let n = 1;
  for (let i=0;i<10;i++){
    const cid = custIds[i % custIds.length];
    const pid = [pl1,pl2,pl3,pl4,pl5][i%5];
    const st = statuses[i % statuses.length];
    const num = 'SUB-'+String(n++).padStart(4,'0');
    const sid = sub.run(num,cid,pid,'2026-09-01','2026-12-31','Net 30',st).lastInsertRowid;
    db.prepare('INSERT INTO subscription_items (subscription_id,product_id,quantity,unit_price,tax_rate,amount) VALUES (?,?,?,?,?,?)').run(sid, [p1,p2,p3,p4,p5][i%5], 1, [1000,500,3000,800,200][i%5], 18, [1000,500,3000,800,200][i%5]);
    db.prepare('INSERT INTO subscription_status_history (subscription_id,status) VALUES (?,?)').run(sid,st);
  }

  // invoices for active/confirmed subs
  const subs = db.prepare("SELECT * FROM subscriptions WHERE status IN ('active','confirmed')").all();
  const inv = db.prepare('INSERT INTO invoices (number,subscription_id,customer_id,billing_period,due_date,subtotal,discount,taxable,tax,total,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  const invItem = db.prepare('INSERT INTO invoice_items (invoice_id,product_id,description,quantity,unit_price,tax_rate,tax_amount,amount) VALUES (?,?,?,?,?,?,?,?)');
  let invn=1;
  for (const s of subs){
    const item = db.prepare('SELECT * FROM subscription_items WHERE subscription_id=?').get(s.id);
    const subtotal = item.amount;
    const taxAmt = subtotal*0.18;
    const total = subtotal+taxAmt;
    const num = 'INV-'+String(invn++).padStart(4,'0');
    const iid = inv.run(num,s.id,s.customer_id,'2026-10','2026-11-15',subtotal,0,subtotal,taxAmt,total, invn%3===0?'paid':'confirmed').lastInsertRowid;
    invItem.run(iid,item.product_id,'Line',item.quantity,item.unit_price,item.tax_rate,taxAmt,subtotal);
  }

  // payments for paid invoices
  const paidInvs = db.prepare('SELECT * FROM invoices WHERE status="paid"').all();
  const pay = db.prepare('INSERT INTO payments (invoice_id,amount,method,paid_at,note) VALUES (?,?,?,?,?)');
  for (const inv of paidInvs){
    pay.run(inv.id, inv.total, 'upi', '2026-10-20','Paid in full');
  }
  // one partial
  const firstConfirmed = db.prepare('SELECT * FROM invoices WHERE status="confirmed" LIMIT 1').get();
  if (firstConfirmed) pay.run(firstConfirmed.id, Math.round(firstConfirmed.total*0.3), 'cash', '2026-10-22','Partial payment');
}

module.exports = { run };
