const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

function authMiddleware(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({error:'No token'});
  const token = h.split(' ')[1];
  try {
    const u = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = u;
    next();
  } catch(e){ res.status(401).json({error:'Invalid token'}); }
}

function requireRole(...roles){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({error:'No user'});
    if(!roles.includes(req.user.role)) return res.status(403).json({error:'Forbidden'});
    next();
  };
}

function passwordValid(p){
  return p && p.length>8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[^A-Za-z0-9]/.test(p);
}

module.exports = { authMiddleware, requireRole, passwordValid, db, bcrypt, jwt };
