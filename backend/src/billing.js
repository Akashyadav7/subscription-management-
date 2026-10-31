const db = require('./db');

function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); }
function addMonths(d,n){ const x=new Date(d); x.setMonth(x.getMonth()+n); return x.toISOString().slice(0,10); }
function addYears(d,n){ const x=new Date(d); x.setFullYear(x.getFullYear()+n); return x.toISOString().slice(0,10); }

function nextBillingDate(current, interval){
  if(interval==='daily') return addDays(current,1);
  if(interval==='weekly') return addDays(current,7);
  if(interval==='monthly') return addMonths(current,1);
  if(interval==='yearly') return addYears(current,1);
  return addMonths(current,1);
}

function runBilling(){
  console.log('[billing] check started');
  const subs = db.prepare("SELECT s.*, p.billing_interval, p.price FROM subscriptions s JOIN plans p ON s.plan_id=p.id WHERE s.status='active'").all();
  let generated=0;
  for(const s of subs){
    if(!s.next_billing_date) continue;
    const today = new Date().toISOString().slice(0,10);
    if(s.expiry_date && s.next_billing_date > s.expiry_date) continue;
    let safety=0;
    while(s.next_billing_date <= today && safety < 12){
      safety++;
      const period = s.next_billing_date;
      const dup = db.prepare('SELECT id FROM invoices WHERE subscription_id=? AND billing_period=?').get(s.id, period);
      if(dup){ console.log('[billing] duplicate prevented', s.id, period); s.next_billing_date = nextBillingDate(s.next_billing_date, s.billing_interval); db.prepare('UPDATE subscriptions SET next_billing_date=? WHERE id=?').run(s.next_billing_date, s.id); continue; }
      try {
        const items = db.prepare('SELECT * FROM subscription_items WHERE subscription_id=?').all(s.id);
        let subtotal=0; items.forEach(it=> subtotal+=it.amount);
        let discount=0;
        const discs = db.prepare('SELECT * FROM discounts WHERE active=1').all();
        const now = period;
        for(const d of discs){
          if(d.start_date && now<d.start_date) continue;
          if(d.end_date && now>d.end_date) continue;
          if(d.max_usage>0 && d.usage_count>=d.max_usage) continue;
          if(d.min_purchase>0 && subtotal<d.min_purchase) continue;
          if(d.type==='fixed') discount+=d.value; else discount+=subtotal*d.value/100;
        }
        if(discount>subtotal) discount=subtotal;
        const taxable = subtotal-discount;
        let tax=0; items.forEach(it=> tax += it.amount*(it.tax_rate||0)/100);
        if(subtotal>0) tax = tax*(taxable/subtotal);
        const total = taxable+tax;
        const number = 'INV-'+Date.now().toString().slice(-6)+s.id;
        const due = new Date(period); due.setDate(due.getDate()+15);
        const iid = db.prepare('INSERT INTO invoices (number,subscription_id,customer_id,billing_period,due_date,subtotal,discount,taxable,tax,total,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(number,s.id,s.customer_id,period,due.toISOString().slice(0,10),subtotal,discount,taxable,tax,total,'confirmed').lastInsertRowid;
        items.forEach(it=> db.prepare('INSERT INTO invoice_items (invoice_id,product_id,description,quantity,unit_price,tax_rate,tax_amount,amount) VALUES (?,?,?,?,?,?,?,?)').run(iid,it.product_id,'Line',it.quantity,it.unit_price,it.tax_rate, it.amount*(it.tax_rate||0)/100, it.amount));
        console.log('[billing] invoice generated', iid, s.id, period);
        generated++;
        s.next_billing_date = nextBillingDate(s.next_billing_date, s.billing_interval);
        db.prepare('UPDATE subscriptions SET next_billing_date=? WHERE id=?').run(s.next_billing_date, s.id);
      } catch(e){ console.log('[billing] failure', s.id, e.message); break; }
    }
  }
  console.log('[billing] check done, generated', generated);
}

module.exports = { runBilling, nextBillingDate };
