import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';



import authRoutes from './routes/auth.routes.js';
import recordsRoutes from './routes/records.routes.js';
import intelligenceRoutes from './routes/intelligence.routes.js';
import companiesRoutes from './routes/companies.routes.js';
import peopleRoutes from './routes/people.routes.js';
import financeRoutes from './routes/finance.routes.js';
import decisionsRoutes from './routes/decisions.routes.js';

import {connectDB} from './config/db.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
connectDB()


// API Mounting
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/decisions', decisionsRoutes);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ACTIVE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Founder OS Backend running on port ${PORT}`);
});
