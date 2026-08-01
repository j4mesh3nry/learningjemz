import { Chess } from 'chess.js';

// Simple Opening Book (moves as standard algebraic notation)
const OPENING_BOOK = {
  // White openings
  '': ['e4', 'd4', 'Nf3'],
  // Black responses to e4
  'e4': ['e5', 'c5', 'e6', 'c6'],
  // Black responses to d4
  'd4': ['d5', 'Nf6'],
  // White response to e4 e5
  'e4 e5': ['Nf3', 'Bc4', 'Nc3'],
  // White response to e4 c5
  'e4 c5': ['Nf3', 'Nc3'],
  // Black response to e4 e5 Nf3
  'e4 e5 Nf3': ['Nc6', 'Nf6', 'd6'],
  // Black response to d4 d5
  'd4 d5': ['c4', 'Nf3', 'Bf4']
};

// Piece values
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece Square Tables (PST) adapted from standard simplified evaluation
const PST = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

// Evaluate the board
function evaluateBoard(game) {
  let totalEvaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const isWhite = piece.color === 'w';
        let value = PIECE_VALUES[piece.type];
        
        // Add PST value
        const pstRow = isWhite ? i : 7 - i;
        value += PST[piece.type][pstRow][j];

        totalEvaluation += isWhite ? value : -value;
      }
    }
  }

  return totalEvaluation;
}

function minimax(game, depth, alpha, beta, isMaximizingPlayer) {
  if (depth === 0 || game.isGameOver()) {
    if (game.isCheckmate()) {
      return isMaximizingPlayer ? -99999 : 99999;
    }
    if (game.isDraw()) return 0;
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  if (isMaximizingPlayer) {
    let bestVal = -Infinity;
    for (const move of moves) {
      game.move(move.san);
      bestVal = Math.max(bestVal, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      alpha = Math.max(alpha, bestVal);
      if (beta <= alpha) break;
    }
    return bestVal;
  } else {
    let bestVal = Infinity;
    for (const move of moves) {
      game.move(move.san);
      bestVal = Math.min(bestVal, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      beta = Math.min(beta, bestVal);
      if (beta <= alpha) break;
    }
    return bestVal;
  }
}

export function getBestMove(game, depth = 3, difficulty = 'Hard') {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Opening book lookup
  const historyStr = game.history().join(' ');
  if (OPENING_BOOK[historyStr]) {
    const bookMoves = OPENING_BOOK[historyStr];
    const bookMoveStr = bookMoves[Math.floor(Math.random() * bookMoves.length)];
    const bookMove = moves.find(m => m.san === bookMoveStr);
    if (bookMove) return bookMove;
  }

  // Blunder rates: Easy makes mostly random moves, Medium occasionally blunders
  if (difficulty === 'Easy' && Math.random() < 0.75) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
  if (difficulty === 'Medium' && Math.random() < 0.15) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const isMaximizingPlayer = game.turn() === 'w';

  let bestMove = moves[0];
  let bestVal = isMaximizingPlayer ? -Infinity : Infinity;

  // Simple move ordering: captures first to improve alpha-beta pruning
  moves.sort((a, b) => {
    return (b.flags.includes('c') ? 1 : 0) - (a.flags.includes('c') ? 1 : 0);
  });

  for (const move of moves) {
    game.move(move.san);
    const boardVal = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizingPlayer);
    game.undo();

    if (isMaximizingPlayer) {
      if (boardVal > bestVal) {
        bestVal = boardVal;
        bestMove = move;
      }
    } else {
      if (boardVal < bestVal) {
        bestVal = boardVal;
        bestMove = move;
      }
    }
  }

  return bestMove;
}
