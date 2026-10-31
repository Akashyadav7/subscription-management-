const express = require('express');
const router = express.Router();
const { db, bcrypt, jwt, passwordValid } = require('../middleware/auth');

router.post('/register', (req,res)=>{
  const { name,email,password,role } = req.body;
  if(!name||!email||!password) return res.status(400).json({error:'Missing fields'});
  if(!passwordValid(password)) return res.status(400).json({error:'Password must be >8 chars with upper, lower, special'});
  const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email);
  if(exists) return res.status(400).json({error:'Email already registered'});
  // only admin can create staff; public registration creates customer
  let r = 'customer';
  const token = req.headers.authorization?.split(' ')[1];
  if(token){
    try { const u=jwt.verify(token,process.env.JWT_SECRET||'secret'); if(u.role==='admin' && role) r=role; } catch(e){}
  }
  if(r==='staff' || r==='admin'){
    // require admin token
    try { const u=jwt.verify(token,process.env.JWT_SECRET||'secret'); if(u.role!=='admin') return res.status(403).json({error:'Only admin can create staff/admin'});}catch(e){return res.status(403).json({error:'Forbidden'});}
  }
  const hash = bcrypt.hashSync(password,10);
  const info = db.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)').run(name,email,hash,r);
  if(r==='customer'){
    db.prepare('INSERT INTO customers (name,email,user_id) VALUES (?,?,?)').run(name,email,info.lastInsertRowid);
  }
  res.json({id:info.lastInsertRowid, message:'Registered'});
});

router.post('/login', (req,res)=>{
  const { email,password } = req.body;
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if(!u || !bcrypt.compareSync(password,u.password)) return res.status(401).json({error:'Invalid credentials'});
  const token = jwt.sign({id:u.id,name:u.name,email:u.email,role:u.role}, process.env.JWT_SECRET||'secret', {expiresIn:'7d'});
  res.json({token,user:{id:u.id,name:u.name,email:u.email,role:u.role}});
});

router.post('/reset-password', (req,res)=>{
  const { email,newPassword } = req.body;
  if(!passwordValid(newPassword)) return res.status(400).json({error:'Weak password'});
  const u = db.prepare('SELECT id FROM users WHERE email=?').get(email);
  if(!u) return res.status(404).json({error:'User not found'});
  db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(newPassword,10),u.id);
  res.json({message:'Password reset (simulated)'});
});

module.exports = router;
