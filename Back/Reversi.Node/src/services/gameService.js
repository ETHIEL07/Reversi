import { v4 as uuidv4 } from 'uuid';
import { GameEngine, PLAYER } from './gameEngine.js';

export class GameService {
  constructor(db) {
    this.db = db;
  }

  // Create a new game
  createGame(opponent, level, humanColor) {
    const id = uuidv4();
    const engine = new GameEngine();

    const stmt = this.db.prepare(`
      INSERT INTO games (id, opponent, level, human_color, moves_csv, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(id, opponent, level, humanColor, '');

    return {
      id,
      board: this.boardToArray(engine.getBoard()),
      currentPlayer: 'Black',
      status: 'InProgress',
      score: { black: 2, white: 2 },
      legalMoves: engine.getLegalMoves()
    };
  }

  // Get game by ID
  getGame(gameId) {
    const game = this.db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
    if (!game) return null;

    const engine = this.rebuildGame(game);
    const { black, white } = engine.getScore();

    return {
      id: game.id,
      board: this.boardToArray(engine.getBoard()),
      currentPlayer: this.playerName(engine.currentPlayer),
      status: game.status,
      score: { black, white },
      legalMoves: engine.getLegalMoves(),
      isOver: game.status === 'Ended'
    };
  }

  // Play a move
  playMove(gameId, row, col, deferComputer) {
    const game = this.db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
    if (!game) throw new Error('Game not found');

    const engine = this.rebuildGame(game);
    engine.play(row, col);

    // If not deferred, play computer move if applicable
    if (!deferComputer && game.opponent === 'Computer') {
      const computerMoves = engine.getLegalMoves();
      if (computerMoves.length > 0) {
        const computerMove = computerMoves[Math.floor(Math.random() * computerMoves.length)];
        engine.play(computerMove.row, computerMove.col);
      } else {
        engine.pass();
      }
    }

    // Save game
    const movesCsv = engine.history.map(m =>
      m.row >= 0 ? `${String.fromCharCode(97 + m.col)}${8 - m.row}` : '--'
    ).join(',');

    const status = engine.getLegalMoves().length === 0 ? 'Ended' : 'InProgress';

    this.db.prepare(`
      UPDATE games SET moves_csv = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(movesCsv, status, gameId);

    const { black, white } = engine.getScore();
    return {
      id: game.id,
      board: this.boardToArray(engine.getBoard()),
      currentPlayer: this.playerName(engine.currentPlayer),
      status,
      score: { black, white },
      legalMoves: engine.getLegalMoves()
    };
  }

  // List games (paginated)
  listGames(page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const games = this.db.prepare(`
      SELECT * FROM games ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(pageSize, offset);

    const total = this.db.prepare('SELECT COUNT(*) as count FROM games').get().count;

    return {
      items: games.map(g => ({
        id: g.id,
        opponent: g.opponent,
        level: g.level,
        status: g.status,
        createdAt: g.created_at
      })),
      page,
      pageSize,
      total
    };
  }

  // Helper: rebuild game state from move history
  rebuildGame(gameRecord) {
    const engine = new GameEngine();
    const moves = gameRecord.moves_csv ? gameRecord.moves_csv.split(',') : [];

    for (const moveStr of moves) {
      if (moveStr === '--') {
        engine.pass();
      } else if (moveStr) {
        const col = moveStr.charCodeAt(0) - 97;
        const row = 8 - parseInt(moveStr[1]);
        engine.play(row, col);
      }
    }

    return engine;
  }

  // Helper: convert board array to format
  boardToArray(board) {
    return board.map(row => row.map(cell =>
      cell === PLAYER.BLACK ? 'B' : cell === PLAYER.WHITE ? 'W' : '.'
    ).join(''));
  }

  playerName(player) {
    return player === PLAYER.BLACK ? 'Black' : 'White';
  }
}
