/**
 * Reversi/Othello game engine
 * Rules: WOF (World Othello Federation)
 */

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

export class GameEngine {
  constructor(board = null) {
    // Initialize 8x8 board
    this.board = board || this.initializeBoard();
    this.currentPlayer = BLACK; // Black starts
    this.history = [];
    this.lastMove = null;
  }

  initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
    // Standard starting position
    board[3][3] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    board[4][4] = WHITE;
    return board;
  }

  getBoard() {
    return this.board.map(row => [...row]);
  }

  // Get legal moves for current player
  getLegalMoves() {
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isLegalMove(r, c, this.currentPlayer)) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  isLegalMove(row, col, player) {
    // Square must be empty
    if (this.board[row][col] !== EMPTY) return false;

    // Check all 8 directions for valid flip
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dr, dc] of directions) {
      if (this.hasValidFlips(row, col, dr, dc, player)) {
        return true;
      }
    }
    return false;
  }

  hasValidFlips(row, col, dr, dc, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    let r = row + dr;
    let c = col + dc;
    let flips = 0;

    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (this.board[r][c] === EMPTY) return false;
      if (this.board[r][c] === player) return flips > 0;
      flips++;
      r += dr;
      c += dc;
    }
    return false;
  }

  // Play a move
  play(row, col) {
    if (!this.isLegalMove(row, col, this.currentPlayer)) {
      throw new Error(`Invalid move: ${row},${col}`);
    }

    // Flip pieces
    this.flipPieces(row, col, this.currentPlayer);
    this.board[row][col] = this.currentPlayer;

    // Record move
    this.history.push({ row, col, player: this.currentPlayer });
    this.lastMove = { row, col };

    // Switch player
    this.currentPlayer = this.currentPlayer === BLACK ? WHITE : BLACK;

    // Check if next player can move, if not, pass
    if (this.getLegalMoves().length === 0) {
      this.currentPlayer = this.currentPlayer === BLACK ? WHITE : BLACK;
      if (this.getLegalMoves().length === 0) {
        // Game over
        return { gameOver: true, winner: this.getWinner() };
      }
    }

    return { gameOver: false };
  }

  flipPieces(row, col, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dr, dc] of directions) {
      const toFlip = [];
      let r = row + dr;
      let c = col + dc;

      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (this.board[r][c] === EMPTY) break;
        if (this.board[r][c] === player) {
          toFlip.forEach(([fr, fc]) => {
            this.board[fr][fc] = player;
          });
          break;
        }
        toFlip.push([r, c]);
        r += dr;
        c += dc;
      }
    }
  }

  pass() {
    if (this.getLegalMoves().length > 0) {
      throw new Error("Cannot pass when legal moves exist");
    }
    this.history.push({ row: -1, col: -1, player: this.currentPlayer });
    this.currentPlayer = this.currentPlayer === BLACK ? WHITE : BLACK;

    if (this.getLegalMoves().length === 0) {
      return { gameOver: true, winner: this.getWinner() };
    }
    return { gameOver: false };
  }

  getScore() {
    let black = 0, white = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] === BLACK) black++;
        else if (this.board[r][c] === WHITE) white++;
      }
    }
    return { black, white };
  }

  getWinner() {
    const { black, white } = this.getScore();
    if (black > white) return "Black";
    if (white > black) return "White";
    return "Draw";
  }

  // Serialize board to CSV string (like C# version)
  serializeBoard() {
    return this.board.map(row => row.join(",")).join(";");
  }

  static deserializeBoard(csv) {
    return csv.split(";").map(row => row.split(",").map(Number));
  }

  undo() {
    if (this.history.length === 0) {
      throw new Error("No moves to undo");
    }
    this.history.pop();
    // Rebuild board from history
    this.board = this.initializeBoard();
    const nextPlayer = BLACK;
    this.currentPlayer = nextPlayer;
    for (const move of this.history) {
      if (move.row >= 0) {
        this.play(move.row, move.col);
      } else {
        this.pass();
      }
    }
  }
}

export const PLAYER = { BLACK, WHITE, EMPTY };
