require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { seedIfEmpty } = require('./db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const { runBilling } = require('./billing');
const { authMiddleware } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// init db + seed
try { db.exec('SELECT 1'); } catch(e){}
const seed = require('./seed');
seed.run(db);

app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware, apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Backend running on', PORT));

