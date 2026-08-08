import express from 'express';
import cors from 'cors';
import initDatabase from './models/database.js';
import { createGamesRouter } from './routes/games.js';

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://reversi-psi-two.vercel.app', 'http://localhost:5213'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Initialize database
const db = initDatabase();

// Routes
app.get('/', (req, res) => {
  res.redirect('/swagger');
});

app.get('/api/version', (req, res) => {
  res.json({
    number: '260808.1400',
    date: new Date().toISOString().split('T')[0] + ' 14:00',
    gitVersion: 'v1.0.0 - Node.js'
  });
});

app.use('/api/games', createGamesRouter(db));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Reversi API running on http://localhost:${PORT}`);
  console.log(`✓ Database: ${process.env.DATABASE_PATH || './reversi.db'}`);
});
