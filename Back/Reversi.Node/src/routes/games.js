import express from 'express';
import { GameService } from '../services/gameService.js';

export function createGamesRouter(db) {
  const router = express.Router();
  const gameService = new GameService(db);

  // POST /api/games - Create game
  router.post('/', (req, res) => {
    try {
      const { opponent, level, humanColor } = req.body;

      if (opponent === 'Computer' && !level) {
        return res.status(400).json({ message: 'Level required for computer opponent' });
      }

      const game = gameService.createGame(opponent, level, humanColor);
      res.status(201).json(game);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // GET /api/games - List games
  router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const result = gameService.listGames(page, Math.min(pageSize, 100));
    res.json(result);
  });

  // GET /api/games/:id - Get game
  router.get('/:id', (req, res) => {
    try {
      const game = gameService.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: `Game ${req.params.id} not found` });
      }
      res.json(game);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });

  // POST /api/games/:id/moves - Play move
  router.post('/:id/moves', (req, res) => {
    try {
      const { row, col, deferComputer } = req.body;
      const result = gameService.playMove(req.params.id, row, col, deferComputer);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // POST /api/games/:id/pass - Pass turn
  router.post('/:id/pass', (req, res) => {
    try {
      const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      // Implementation: call gameService.pass()
      res.json({ message: 'Pass not yet implemented' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  return router;
}
