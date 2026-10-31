endpoint = '''
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
'''
s=open('src/routes/api.js').read()
s=s.replace('module.exports = router;', endpoint+'\nmodule.exports = router;')
open('src/routes/api.js','w').write(s)
print('done')
