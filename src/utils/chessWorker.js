import { Chess } from 'chess.js';
import { getBestMove } from './chessEngine';

// Listen for messages from the main thread
self.onmessage = function(e) {
  const { fen, depth, difficulty } = e.data;
  
  try {
    const game = new Chess(fen);
    
    // Engine calculation can take some time but won't block UI since it's in a worker
    const bestMove = getBestMove(game, depth, difficulty);
    
    if (bestMove) {
      self.postMessage({ type: 'MOVE_FOUND', move: bestMove.san });
    } else {
      self.postMessage({ type: 'ERROR', message: 'No legal moves found' });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', message: error.message });
  }
};
