import { Chess } from 'chess.js';
import fs from 'fs';
import path from 'path';

function createPuzzle(fen, moves, goal, hint, theme, difficulty) {
  const chess = new Chess(fen);
  const turn = chess.turn();

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    try {
      const res = chess.move(m);
      if (!res) {
        throw new Error(`Illegal move "${m}" in puzzle "${goal}" at step ${i}`);
      }
    } catch (err) {
      throw new Error(`Move error "${m}" in puzzle "${goal}": ${err.message}`);
    }
  }

  return {
    difficulty,
    difficultyLabel: difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard',
    fen,
    turn,
    goal,
    moves,
    theme,
    hint
  };
}

const rawPuzzles = [];

function addP(fen, moves, goal, hint, theme, difficulty) {
  try {
    const p = createPuzzle(fen, moves, goal, hint, theme, difficulty);
    rawPuzzles.push(p);
  } catch (err) {
    console.error(`Failed puzzle: [${goal}] -> ${err.message}`);
  }
}

// =========================================================================
// 1. EASY TACTICS (Difficulty 1) - ~75 Puzzles
// =========================================================================

// Opening & Diagonal Mates
addP("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1", ["Qxf7#"], "White to move — Scholar's mate in 1", "Attack the weak f7 square with your Queen.", "Checkmate", 1);
addP("r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1", ["Qxf7#"], "White to move — Scholar's mate on f7", "Strike the undefended f7 pawn with the Queen.", "Checkmate", 1);
addP("rnbqkbnr/ppppp2p/5p2/6p1/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 1", ["Qh5#"], "White to move — Fool's mate diagonal", "Exploit the open diagonal to deliver mate on h5.", "Checkmate", 1);
addP("rnbqkbnr/pppp1ppp/8/4p3/5PP1/8/PPPPP2P/RNBQKBNR b KQkq - 0 1", ["Qh4#"], "Black to move — Quick diagonal mate", "Deliver mate on h4 taking advantage of the weakened diagonal.", "Checkmate", 1);
addP("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5Q2/PPPP1PPP/RNB1KBNR w KQkq - 0 1", ["Qxf7#"], "White to move — Queen strike on f7", "Capture on f7 for an immediate checkmate.", "Checkmate", 1);

// White Back Rank Mates
addP("6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1", ["Ra8#"], "White to move — Back rank mate on a8", "Slide your Rook to the 8th rank on a8.", "Back Rank Mate", 1);
addP("6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1", ["Rb8#"], "White to move — Back rank mate on b8", "Rook to b8 checks the trapped King.", "Back Rank Mate", 1);
addP("6k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1", ["Rc8#"], "White to move — Back rank mate on c8", "Infiltrate the 8th rank on c8.", "Back Rank Mate", 1);
addP("6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", ["Rd8#"], "White to move — Back rank mate on d8", "Drop your Rook to d8 for mate.", "Back Rank Mate", 1);
addP("6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", ["Re8#"], "White to move — Back rank mate on e8", "Rook e8 delivers back rank mate.", "Back Rank Mate", 1);
addP("3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", ["Rxd8#"], "White to move — Capture rook & checkmate", "Capture the enemy rook on d8 for mate.", "Back Rank Mate", 1);
addP("2r3k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1", ["Rxc8#"], "White to move — Capture on c8 with mate", "Trade on c8 with checkmate.", "Back Rank Mate", 1);
addP("4r1k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", ["Rxe8#"], "White to move — Capture on e8 with mate", "Take the rook on e8 to mate.", "Back Rank Mate", 1);
addP("6k1/3R1ppp/8/8/8/8/5PPP/6K1 w - - 0 1", ["Rd8#"], "White to move — 7th rank to 8th rank mate", "Push the d7 rook to d8.", "Back Rank Mate", 1);
addP("6k1/5ppp/8/8/8/8/5PPP/2Q3K1 w - - 0 1", ["Qc8#"], "White to move — Queen back rank mate", "Move Queen to c8.", "Back Rank Mate", 1);
addP("6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1", ["Qd8#"], "White to move — Queen to d8 mate", "Queen d8 delivers mate.", "Back Rank Mate", 1);
addP("6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1", ["Qe8#"], "White to move — Queen to e8 mate", "Queen e8 delivers mate.", "Back Rank Mate", 1);

// Black Back Rank Mates
addP("1r4k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1", ["Rb1#"], "Black to move — Rook to b1 mate", "Rook to b1 delivers back rank mate.", "Back Rank Mate", 1);
addP("2r3k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1", ["Rc1#"], "Black to move — Rook to c1 mate", "Rook to c1 mates the trapped King.", "Back Rank Mate", 1);
addP("3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1", ["Rd1#"], "Black to move — Rook to d1 mate", "Drop your Rook to d1.", "Back Rank Mate", 1);
addP("4r1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1", ["Re1#"], "Black to move — Rook to e1 mate", "Rook to e1 delivers mate.", "Back Rank Mate", 1);
addP("3q2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1", ["Qd1#"], "Black to move — Queen to d1 mate", "Slide Queen to d1 for checkmate.", "Back Rank Mate", 1);
addP("4q1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1", ["Qe1#"], "Black to move — Queen to e1 mate", "Queen to e1 delivers checkmate.", "Back Rank Mate", 1);

// Kiss of Death / Helper Queen Mates
addP("7k/5K2/6Q1/8/8/8/8/8 w - - 0 1", ["Qg7#"], "White to move — Kiss of death mate", "Move Queen right next to the King on g7.", "Checkmate", 1);
addP("k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", ["Qb7#"], "White to move — Mate on b7", "Queen to b7 finishes the game.", "Checkmate", 1);
addP("k7/8/1K6/8/8/8/8/7Q w - - 0 1", ["Qh8#"], "White to move — Back rank Queen mate", "Queen to h8 with King support.", "Checkmate", 1);
addP("8/8/8/8/8/5K2/6Q1/7k w - - 0 1", ["Qh3#"], "White to move — Corner mate on h3", "Queen to h3 corners the King.", "Checkmate", 1);
addP("8/8/8/8/8/5K1k/6Q1/8 w - - 0 1", ["Qg4#"], "White to move — Queen mate on g4", "Queen to g4 seals the position.", "Checkmate", 1);
addP("8/8/8/8/3Q4/6K1/8/6k1 w - - 0 1", ["Qf2#"], "White to move — Queen mate in 1", "Place Queen on f2 right next to the King.", "Checkmate", 1);
addP("8/8/8/8/8/4K3/5Q2/7k w - - 0 1", ["Qf1#"], "White to move — Queen mate on f1", "Move Queen to f1.", "Checkmate", 1);
addP("8/8/8/8/8/5K2/6Q1/6k1 w - - 0 1", ["Qg1#"], "White to move — Queen mate on g1", "Drop Queen to g1.", "Checkmate", 1);
addP("k7/R6R/8/8/8/1K6/8/8 w - - 0 1", ["Rh8#"], "White to move — Blind swine rook mate", "Rook to h8 mates.", "Checkmate", 1);
addP("k7/8/1K6/8/8/8/8/2R5 w - - 0 1", ["Rc8#"], "White to move — Rook mate on c8", "Move Rook to c8.", "Checkmate", 1);
addP("k7/8/1K6/8/8/8/8/3R4 w - - 0 1", ["Rd8#"], "White to move — Rook mate on d8", "Move Rook to d8.", "Checkmate", 1);
addP("k7/8/1K6/8/8/8/8/4R3 w - - 0 1", ["Re8#"], "White to move — Rook mate on e8", "Move Rook to e8.", "Checkmate", 1);
addP("k7/8/1K6/8/8/8/8/5R2 w - - 0 1", ["Rf8#"], "White to move — Rook mate on f8", "Move Rook to f8.", "Checkmate", 1);
addP("k7/8/1K6/8/8/8/8/6R1 w - - 0 1", ["Rg8#"], "White to move — Rook mate on g8", "Move Rook to g8.", "Checkmate", 1);
addP("k7/8/1K6/8/8/8/8/7R w - - 0 1", ["Rh8#"], "White to move — Rook mate on h8", "Move Rook to h8.", "Checkmate", 1);

// Free Captures & Hanging Pieces
addP("r1bqkbnr/pppp1ppp/2n5/4p3/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 1", ["dxe5"], "White to move — Win free central pawn", "Capture the e5 pawn with your d-pawn.", "Capture", 1);
addP("r1bqk2r/pppp1ppp/2n5/4p3/1b2n3/2NP1N2/PPP1PPPP/R1BQKB1R w KQkq - 0 1", ["dxe4"], "White to move — Capture undefended knight", "Take the knight on e4 with your d-pawn.", "Capture", 1);
addP("r1bqkbnr/pppp1ppp/8/4p3/4P3/5n2/PPPP1PPP/RNBQKBNR w KQkq - 0 1", ["Nxf3"], "White to move — Take checking knight", "Recapture the knight with your g1 knight.", "Capture", 1);
addP("r1bqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1nPP/RNBQKBNR w KQkq - 0 1", ["Kxf2"], "White to move — Capture attacking knight", "Take the f2 knight with your King.", "Capture", 1);
addP("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1", ["Nxe5"], "White to move — Capture e5 pawn", "Take the e5 pawn with your knight.", "Capture", 1);
addP("k6R/R7/8/8/8/1K6/8/8 b - - 0 1", ["Kxa7"], "Black to move — Capture attacking Rook", "Take the a7 rook with your King.", "Capture", 1);
addP("r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1", ["dxe4"], "White to move — Win free knight on e4", "Take the knight with dxe4.", "Capture", 1);
addP("r1bqkb1r/pppp1ppp/8/4n3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", ["Nxe5"], "White to move — Capture undefended knight", "Capture the e5 knight.", "Capture", 1);
addP("r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1", ["dxe4"], "White to move — Win the e4 Knight", "Capture the e4 knight with d-pawn.", "Capture", 1);
addP("r1bqk2r/pppp1ppp/2n2n2/4N3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 1", ["Nxe5"], "Black to move — Capture knight on e5", "Take the e5 knight with your c6 knight.", "Capture", 1);
addP("r1b1k2r/pppp1ppp/2n5/4p3/2B1n2q/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1", ["Nxh4"], "White to move — Capture enemy Queen on h4", "Take the queen with your knight.", "Capture", 1);
addP("r1b1k2r/pppp1ppp/2n5/4p3/2B1P1nq/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1", ["Nxh4"], "White to move — Capture the hanging Queen", "Knight captures Queen on h4.", "Capture", 1);
addP("r1bqk2r/pppp1ppp/2n5/2b1p3/2B1n3/3P1N2/PPP2PPP/RNBQ1RK1 w kq - 0 1", ["dxe4"], "White to move — Take knight on e4", "Pawn takes knight.", "Capture", 1);

// Basic Defense & Solid Moves
addP("r1b1k2r/pppp1ppp/2n5/4p3/4q3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq - 0 1", ["Be2"], "White to move — Block Queen check", "Develop your Bishop to e2 to block check.", "Defense", 1);
addP("r1bqkb1r/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1", ["g6"], "Black to move — Defend against f7 mate", "Push g6 to block the Queen.", "Defense", 1);
addP("r1bq1rk1/pppp1ppp/2n5/4p3/2B1P1n1/2NP1N2/PPP2bPP/R1BQK2R w KQ - 0 1", ["Kf1"], "White to move — Step King to safety on f1", "King to f1 avoids check.", "King Move", 1);
addP("r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P1n1/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1", ["O-O"], "White to move — Castle for safety", "Castle Kingside to protect f2.", "King Safety", 1);
addP("r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P1n1/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1", ["O-O"], "White to move — Castle to protect f2", "Castle Kingside.", "Castling", 1);
addP("r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 1", ["O-O"], "White to move — Castle Kingside", "Castle Kingside.", "King Safety", 1);
addP("r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 0 1", ["O-O"], "Black to move — Castle Kingside", "Castle your King to safety.", "King Safety", 1);
addP("r1bqkb1r/ppp2ppp/2n5/3np3/2B5/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", ["O-O"], "White to move — Castle before striking", "Castle Kingside to activate your rook.", "King Safety", 1);
addP("r1bqk2r/ppp2ppp/2n5/3np3/1bB5/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1", ["O-O"], "White to move — Castle to unpin", "Castle Kingside to break the pin.", "King Safety", 1);
addP("r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 b - - 0 1", ["d6"], "Black to move — Open diagonal for Bishop", "Push d6 to activate your light-square Bishop.", "Development", 1);
addP("r1bq1rk1/ppp2ppp/2np4/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 b - - 0 1", ["Qd7"], "Black to move — Unpin the Queen", "Step Queen to d7 out of the pin.", "Defense", 1);
addP("r1bqkb1r/pppp1ppp/2n5/3QP3/2B1n3/5N2/PPP2PPP/RNB1K2R b KQkq - 0 1", ["Qe7"], "Black to move — Defend against Qxf7#", "Queen to e7 defends f7.", "Defense", 1);
addP("r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 1", ["Bc5"], "Black to move — Develop dark-square Bishop", "Develop your bishop to c5.", "Development", 1);
addP("r1bqk2r/pppp1ppp/2n2n2/4p1B1/1b2P3/2NP3P/PPP2PP1/R2QKBNR b KQkq - 0 1", ["h6"], "Black to move — Question the Bishop", "Push h6 to challenge the pinned Bishop.", "Tactic", 1);
addP("r1bqkb1r/pppp1p1p/2n2np1/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1", ["d3"], "White to move — Solidify center", "Push d3 to support the center.", "Development", 1);
addP("r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", ["c3"], "White to move — Prepare d4 push with c3", "Pawn to c3 prepares center expansion.", "Preparation", 1);
addP("r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 1", ["d6"], "Black to move — Solidify center with d6", "Pawn to d6 supports e5.", "Solidify", 1);
addP("r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2PP1N2/PP3PPP/RN1Q1RK1 w - - 0 1", ["h3"], "White to move — Prevent g4 jump with h3", "Pawn to h3 controls g4.", "Quiet Move", 1);
addP("r1bq1rk1/ppp2pp1/2np1n1p/2b1p1B1/2B1P3/2PP1N1P/PP3PP1/RN1Q1RK1 w - - 0 1", ["Bh4"], "White to move — Maintain pin with Bh4", "Retreat Bishop to h4.", "Retreat", 1);


// =========================================================================
// 2. MEDIUM TACTICS (Difficulty 2) - ~60 Puzzles
// =========================================================================

addP("8/8/8/8/8/4K3/5Q2/6k1 w - - 0 1", ["Qg3+", "Kh1", "Qg2#"], "White to move — 2-move Queen mate", "Force the King to the corner with Qg3+.", "Checkmate", 2);
addP("7k/8/5K2/8/8/8/8/7R w - - 0 1", ["Kg6+", "Kg8", "Rh8#"], "White to move — Discovered checkmate combo", "Step King to g6 with discovered check.", "Discovered Check", 2);
addP("r1bqk2r/pppp1ppp/2n5/4P3/1bB1n3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1", ["Bxf7+", "Kxf7", "Qd5+"], "White to move — Bishop sacrifice fork", "Sacrifice Bishop on f7 then fork King and Knight with Qd5.", "Fork", 2);
addP("r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 0 1", ["Nxc3", "bxc3", "d5"], "Black to move — Win space with center fork", "Trade on c3 and push d5 to fork Bishop and center.", "Fork", 2);
addP("r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", ["Nxe5", "Nxe5", "d4"], "White to move — Center fork trick", "Capture e5 with Knight, then fork with d4.", "Center Fork Trick", 2);
addP("r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", ["d4", "exd4", "Nxd4"], "White to move — Open the center with d4", "Strike in the center with d4.", "Center Open", 2);
addP("r1bqkb1r/pppp1ppp/2n5/4p3/3Pn3/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 0 1", ["Nxe4", "d5", "Nc3"], "White to move — Take free knight on e4", "Take the knight on e4.", "Piece Play", 2);
addP("r1b2rk1/pp3ppp/8/8/1B6/8/PPP2PPP/3R2K1 w - - 0 1", ["Bxf8", "Kxf8", "Rd8+"], "White to move — Win Rook and dominate 8th rank", "Trade on f8 and invade with your Rook.", "Combination", 2);
addP("r2q1rk1/ppp2ppp/2n5/3p4/3P4/2N1RB2/PPP2PPP/R2Q2K1 w - - 0 1", ["Bxd5"], "White to move — Win free central pawn", "Capture the undefended d5 pawn with your Bishop.", "Tactic", 2);
addP("3r2k1/5ppp/8/8/8/4Q3/5PPP/6K1 w - - 0 1", ["Qe1"], "White to move — Defend back rank", "Retreat the Queen to e1 to stop Black's back rank mate.", "Defense", 2);
addP("2r3k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1", ["Rb7"], "White to move — Infiltrate the 7th rank", "Place your rook on the 7th rank to target pawns.", "7th Rank Pig", 2);
addP("r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/3RR1K1 w - - 0 1", ["Rd7"], "White to move — Invade 7th rank", "Rook to d7.", "7th Rank", 2);
addP("r2qk2r/ppp1bppp/2np1n2/4p3/2B1P1b1/2NP1N2/PPP1BPPP/R1BQ1RK1 w kq - 0 1", ["h3", "Bh5", "g4"], "White to move — Question and push Bishop", "Play h3 then g4 to gain kingside space.", "Space Advantage", 2);
addP("r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 1", ["Bg5", "h6", "Bh4"], "White to move — Pin the f6 Knight", "Bishop to g5 creates an annoying pin.", "Pin", 2);
addP("r1b2rk1/ppp2ppp/2n2q2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", ["Nd5", "Qd8", "Bg5"], "White to move — Jump Knight into d5 outpost", "Place your Knight on the dominant d5 square.", "Outpost / Initiative", 2);
addP("r1b1k2r/ppp2ppp/2n2q2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1", ["Nd5", "Qd8", "Bg5"], "White to move — Centralize knight on d5", "Knight to d5 attacks the Queen with tempo.", "Outpost", 2);
addP("r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 0 1", ["d5", "exd5", "Nxd5"], "Black to move — Strike in the center with d5", "Push d5 to open diagonals.", "Center Break", 2);
addP("r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2PP1N2/PP3PPP/RN1Q1RK1 b - - 0 1", ["h6", "Bh4", "g5"], "Black to move — Break the pin with h6 and g5", "Push h6 then g5 to break the pin.", "Break Pin", 2);
addP("r1bq1rk1/ppp2p2/2np1n1p/2b1p1p1/2B1P2B/2PP1N1P/PP3PP1/RN1Q1RK1 w - - 0 1", ["Nxg5", "hxg5", "Bxg5"], "White to move — Knight sacrifice for pawns & attack", "Nxg5 opens Black's King position.", "Sacrifice", 2);
addP("r1bqkb1r/pppp1ppp/2n5/4P3/2B1n3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 1", ["Qd5"], "White to move — Double attack on f7 and e4", "Queen to d5 attacks both the knight and f7 checkmate.", "Double Attack", 2);
addP("r1b1kb1r/pppp1ppp/5n2/4q3/4P3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 1", ["Bd3"], "White to move — Defend e4 pawn", "Develop Bishop to d3 to protect e4.", "Defense", 2);
addP("r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1", ["Re1"], "White to move — Pin the e4 Knight", "Place your Rook on the open e-file.", "Pin", 2);
addP("r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1", ["Qh5"], "White to move — Threaten mate on f7", "Move Queen to h5 to create a mating battery.", "Attack", 2);
addP("r1bqkb1r/pppp1p1p/2n3p1/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1", ["Qf3"], "White to move — Renew f7 mating threat", "Retreat Queen to f3 to threaten mate again.", "Attack", 2);
addP("r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 0 1", ["Bg5"], "White to move — Pin the f6 Knight", "Bishop to g5 creates a strong pin.", "Pin", 2);
addP("r1b2rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", ["Bg5"], "White to move — Pin knight to Queen", "Bishop to g5 pins the knight.", "Pin", 2);
addP("k7/8/1K6/8/8/8/8/R7 w - - 0 1", ["Ra7", "Kb8", "Rh7"], "White to move — Rook maneuver to corner King", "Rook to a7 controls the rank.", "Endgame Technique", 2);
addP("r1bq1rk1/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP1BPPP/R1BQK2R w KQ - 0 1", ["O-O", "d6", "Bg5"], "White to move — Castle and pin", "Castle safely then pin with Bg5.", "Development", 2);
addP("r1bq1rk1/ppp2ppp/2np1n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", ["Nd5", "Nxd5", "Bxd5"], "White to move — Trade on d5 outpost", "Jump Knight to d5.", "Outpost", 2);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bB1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 1", ["exd5", "Nxd5", "Bd2"], "White to move — Unpin on d2", "Capture d5 then develop Bd2.", "Tactic", 2);
addP("r1bqk2r/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1bPP/RNBQK2R w KQkq - 0 1", ["Kxf2"], "White to move — Take sacrifice bishop", "Take the bishop on f2.", "King Safety", 2);
addP("r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 1", ["exd4", "Nxd4", "Bb4"], "Black to move — Pin knight with Bb4", "Capture d4 and pin c3.", "Opening Pin", 2);
addP("r1bqkb1r/ppp2ppp/2n5/3pp3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1", ["Nxd5", "Nxd5", "exd5"], "White to move — Central liquidation", "Take on d5.", "Tactic", 2);
addP("r1bqk2r/ppp2ppp/2n5/3pp3/1b1PP3/2N2N2/PPP1BPPP/R1BQK2R w KQkq - 0 1", ["O-O", "Bxc3", "bxc3"], "White to move — Castle and maintain center", "Castle Kingside.", "Solid Center", 2);
addP("r1bqk2r/ppp2ppp/2n5/3P4/1b2P3/5N2/PP1B1PPP/R2QKB1R b KQkq - 0 1", ["Bxd2+", "Qxd2", "Ne7"], "Black to move — Trade Bishops", "Exchange on d2 and retreat knight.", "Simplification", 2);
addP("r1bqk2r/pppp1ppp/2n5/4p3/1b1PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1", ["d5", "Ne7", "a3"], "White to move — Push d5 and kick Bishop", "Push d5 then play a3.", "Space Gain", 2);
addP("r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQ - 0 1", ["d3", "d6", "Bg5"], "White to move — Quiet development and pin", "Play d3 followed by Bg5 pin.", "Pin Setup", 2);
addP("r1bq1rk1/ppp2ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP3PP/R1BQK2R w KQ - 0 1", ["Bg5", "h6", "Bh4"], "White to move — Italian game pin", "Develop Bg5 and preserve diagonal.", "Italian Pin", 2);
addP("r1bq1rk1/ppp2ppp/2np4/2b1p1N1/2B1P1n1/2NP4/PPP2PPP/R1BQ1RK1 w - - 0 1", ["h3", "Nf6", "Nf3"], "White to move — Repel Black's Knight", "Push h3 to dislodge the knight.", "Defense", 2);
addP("r1bq1rk1/ppp2ppp/2np4/2b1p3/2B1P1n1/2NP1N1P/PPP2PP1/R1BQ1RK1 b - - 0 1", ["Nf6", "Bg5", "h6"], "Black to move — Reposition knight to f6", "Retreat knight to safety.", "Repositioning", 2);
addP("r1bq1rk1/ppp2pp1/2np3p/2b1p1N1/2B1P3/2NP3P/PPP2PP1/R1BQ1RK1 w - - 0 1", ["Nf3", "Be6", "Bxe6"], "White to move — Trade Bishops on e6", "Trade on e6 to weaken Black's pawns.", "Exchange", 2);
addP("r1bq1rk1/ppp2pp1/2np1b1p/4p3/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 1", ["Nd5", "Bg7", "c3"], "White to move — Solidify d5 outpost", "Occupy d5 with Knight.", "Outpost", 2);
addP("r1bq1rk1/ppp2pp1/2np3p/3Np3/2B1P3/2PP1N2/PP3PPP/R2Q1RK1 b - - 0 1", ["Na5", "Bb3", "Nxb3"], "Black to move — Hunt White's light Bishop", "Knight to a5 to trade off Bishop.", "Bishop Hunt", 2);
addP("r1bq1rk1/ppp2pp1/3p3p/n2Np3/4P3/1BPP1N2/PP3PPP/R2Q1RK1 w - - 0 1", ["Bc2", "c6", "Ne3"], "White to move — Preserve light Bishop", "Retreat Bishop to c2.", "Bishop Retreat", 2);
addP("r1bq1rk1/ppp2pp1/2np3p/4p3/4P3/2PP1N2/PP1N1PPP/R2Q1RK1 w - - 0 1", ["Nc4", "f5", "exf5"], "White to move — Knight activation", "Reroute Knight to c4.", "Knight Tour", 2);


// =========================================================================
// 3. HARD COMBINATIONS (Difficulty 3) - ~55 Puzzles
// =========================================================================

addP("r1b2rk1/ppp2ppp/8/4N3/2B5/8/PPP2PPP/3R2K1 w - - 0 1", ["Bxf7+", "Rxf7", "Rd8+", "Rf8", "Rxf8#"], "White to move — Sacrificial checkmate combo (3 moves)", "Sacrifice the Bishop on f7 to open up the enemy King.", "Sacrifice Mate", 3);
addP("4rrk1/ppp2ppp/2n5/3p4/3P2n1/P3P1Pq/1P1N1P1P/R1BQR1K1 w - - 0 1", ["Nf1"], "White to move — Defend against mate on h2", "Reroute your d2 Knight to f1 to defend the critical h2 square.", "Defense", 3);
addP("8/8/8/8/4Q3/8/5K1k/8 w - - 0 1", ["Qh4#"], "White to move — Corner checkmate", "Move Queen to h4 to seal off all escape squares.", "Checkmate", 3);
addP("r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", ["Qe2", "d5", "d3"], "White to move — Pin the e4 knight with Qe2", "Play Qe2 to pin the knight along the e-file.", "Pin & Win", 3);
addP("r1bq1rk1/pppp1ppp/2n5/4p3/1bB1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 0 1", ["c3", "Bc5", "d4"], "White to move — Expand in the center with c3 and d4", "Push c3 then d4 to claim the entire center.", "Center Domination", 3);
addP("r1bq1rk1/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQ1RK1 w - - 0 1", ["d4", "exd4", "cxd4"], "White to move — Establish classical pawn duo", "Play d4 and recapture with c-pawn.", "Pawn Center", 3);
addP("r1bq1rk1/ppp2ppp/2n5/1Bbp4/3NP3/2P5/PP3PPP/RNBQ1RK1 w - - 0 1", ["Nxc6", "bxc6", "Bxc6"], "White to move — Win pawn and damage pawn structure", "Trade on c6 then take with Bishop.", "Combination", 3);
addP("r1bq1rk1/p1p2ppp/2B5/2bp4/4P3/8/PPP2PPP/RNBQ1RK1 w - - 0 1", ["Bxa8"], "White to move — Capture the trapped Rook on a8", "Bishop captures rook on a8.", "Material Gain", 3);
addP("r1b2rk1/pp3ppp/8/3p4/4P3/8/PPP2PPP/RNBQ1RK1 w - - 0 1", ["exd5"], "White to move — Create an isolated passed pawn", "Capture on d5 to create a strong passed pawn.", "Passed Pawn", 3);
addP("r1bq1rk1/ppp2ppp/2n5/3np3/1bB5/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 1", ["Nxd5", "Bxe1", "Qxe1"], "White to move — Exchange sacrifice for pieces", "Take knight on d5.", "Combination", 3);
addP("r1bq1rk1/ppp2ppp/2n5/3Np3/1bB5/3P1N2/PPP2PPP/R1BQR1K1 b - - 0 1", ["Bxe1", "Qxe1", "Be6"], "Black to move — Win exchange with Bxe1", "Take the rook on e1.", "Tactical Gain", 3);
addP("r2q1rk1/ppp1bppp/2np1n2/4p3/4P1b1/2NP1N2/PPP1BPPP/R1BQR1K1 w - - 0 1", ["h3", "Bh5", "Nxe5", "Bxe2", "Nxc6"], "White to move — Knight discovered attack tactic", "Play h3 then Nxe5 winning a pawn.", "Discovery", 3);
addP("r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w kq - 0 1", ["c3", "d6", "b4", "Bb6", "a4"], "White to move — Queenside expansion attack", "Push c3, b4, and a4 to trap the bishop.", "Pawn Storm", 3);
addP("r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1", ["O-O", "O-O", "Bg5", "d6", "Nd5"], "White to move — Build overwhelming pressure on f6", "Castle, pin with Bg5, and jump Nd5.", "Attack", 3);
addP("r1bq1rk1/pppp1ppp/2n2n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 1", ["O-O", "Bxc3", "bxc3", "d6", "Bg5"], "White to move — Accept doubled pawns for open lines", "Castle, recapture on c3, and pin.", "Positional Play", 3);
addP("r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 0 1", ["Nbd2", "a6", "Re1", "Ba7", "Nf1"], "White to move — Spanish/Italian knight rerouting to g3", "Nbd2 to f1 to g3.", "Maneuver", 3);
addP("r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1NN1/PP3PPP/R1BQK2R b KQ - 0 1", ["Be6", "Bb3", "Bxb3", "axb3"], "Black to move — Challenge White's powerful bishop", "Play Be6 to trade bishops.", "Piece Exchange", 3);
addP("r1bq1rk1/ppp2ppp/2np1n2/4p3/2B1P3/2PP1N2/PP1N1PPP/R1BQK2R w KQ - 0 1", ["O-O", "Be6", "Re1", "Bxc4", "Nxc4"], "White to move — Recapture with knight on c4", "Recapture with Knight to establish outpost.", "Outpost Recapture", 3);
addP("r1bq1rk1/ppp2ppp/2n5/3np3/1bB5/2PP1N2/PP3PPP/RNBQK2R w KQ - 0 1", ["cxb4", "Ndxb4", "O-O"], "White to move — Win piece on b4", "Take bishop on b4 with pawn.", "Material Gain", 3);
addP("r1bq1rk1/pppn1ppp/3p1n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 1", ["O-O", "c6", "a4", "a5", "Re1"], "White to move — Restrain Black's queenside expansion", "Push a4 to stop b5.", "Prophylaxis", 3);
addP("r1bq1rk1/ppp2ppp/2np4/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", ["Bg5", "Qd7", "Nd5", "Kh8", "c3"], "White to move — Launch central assault", "Combine Bg5, Nd5 and c3.", "Initiative", 3);
addP("r1bq1rk1/ppp2ppp/2n5/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 1", ["Be3", "Bxe3", "Rxe3"], "White to move — Trade dark-square bishops", "Recapture with rook on e3.", "Piece Trading", 3);
addP("r1bq1rk1/ppp2ppp/2n5/3np3/2B5/3P1N2/PPP2PPP/RNBQR1K1 w - - 0 1", ["Nxe5", "Nxe5", "Rxe5"], "White to move — Win central pawn with tactical trade", "Take on e5 then recapture with Rook.", "Pawn Snatch", 3);
addP("r1bq1rk1/ppp2ppp/2n5/3nR3/2B5/3P1N2/PPP2PPP/RNBQ2K1 b - - 0 1", ["Nxe5", "Nxe5", "Be6"], "Black to move — Trade Rook for Knight and develop", "Take rook on e5 and play Be6.", "Exchange", 3);
addP("r1bq1rk1/ppp2ppp/2n5/4p3/2B5/3P1N2/PPP2PPP/RNBQR1K1 w - - 0 1", ["Nxe5", "Nxe5", "Rxe5", "c6", "d4"], "White to move — Cement dominant central rook", "Win pawn on e5 and support with d4.", "Central Dominance", 3);
addP("r1b1k2r/ppppqppp/2n5/4p3/2B1n3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1", ["dxe4", "Qb4+", "c3", "Qxc4", "Nbd2"], "White to move — Regain piece with tempo", "Take knight on e4 and block check with c3.", "Tactic", 3);
addP("r1bq1rk1/pppp1ppp/2n5/4p3/2B1n3/2PP1N2/PP3PPP/RNBQK2R w KQ - 0 1", ["dxe4", "d5", "exd5", "Qxd5", "Bxd5"], "White to move — Queen capture on d5", "Liquidate center and win material.", "Tactical Liquidation", 3);
addP("r1bq1rk1/pppp1ppp/2n5/4p3/1bB1P3/2PP1N2/PP3PPP/RNBQK2R b KQ - 0 1", ["Be7", "O-O", "d6", "h3", "Be6"], "Black to move — Solid defense and trade bishops", "Retreat to e7 and challenge white bishop.", "Positional Defense", 3);
addP("r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP1NPPP/R1BQK2R w KQ - 0 1", ["O-O", "Be6", "Bb3", "Bxb3", "axb3"], "White to move — Solid castle and open a-file", "Castle and recapture on b3 with a-pawn.", "Pawn Structure", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/2b1p3/4P3/2PP1N2/PP2BPPP/RNBQK2R w KQ - 0 1", ["O-O", "Bg4", "Nbd2", "Qe7", "b4"], "White to move — Queenside expansion with b4", "Expand on queenside with b4.", "Expansion", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/4P3/2PP1N2/PP1NBPPP/R2QK2R w KQ - 0 1", ["O-O", "Be6", "Re1", "h6", "Qc2"], "White to move — Harmonious development", "Castle, place Rook on e1, Queen on c2.", "Strategy", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/3PP3/2P2N2/PP1NBPPP/R2QK2R b KQ - 0 1", ["dxe4", "Nxe5", "Nxe5", "dxe5", "Nd7"], "Black to move — Counter-strike in center", "Take on e4 and reposition knight.", "Center Counter", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/3PP3/2P1BN2/PP1N1PPP/R2QKB1R w KQ - 0 1", ["exd5", "Nxd5", "Bg5", "f6", "Bh4"], "White to move — Pin setup on h4", "Open center and maintain bishop diagonal.", "Pin Tactics", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/4p3/3Pp3/2P1BN2/PP1N1PPP/R2QKB1R w KQ - 0 1", ["dxe5", "exf3", "exf6", "Qxf6", "Nxf3"], "White to move — Dynamic central tactical exchange", "Trade pawns and knights with active pieces.", "Sharp Tactics", 3);
addP("r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP2NPPP/R1BQK2R b KQ - 0 1", ["Be6", "Bb3", "Bxb3", "Qxb3", "Bb6"], "Black to move — Harmonious bishop swap", "Trade bishops on b3 and tuck remaining bishop on b6.", "Positional Balance", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bPP4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 0 1", ["cxd5", "Nxd5", "Nxd5", "Bxd2+", "Qxd2"], "White to move — Central liquidation into comfortable game", "Trade pawns and bishops on d2.", "Liquidation", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bPP4/2N1PN2/PP1B1PPP/R2QKB1R b KQ - 0 1", ["exd4", "Nxd4", "Nxd4", "exd4", "Re8+"], "Black to move — Seize e-file with Re8+", "Capture on d4 and check on e-file.", "E-file Control", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bPP4/4PN2/PP1B1PPP/RN1QKB1R w KQ - 0 1", ["Bxb4", "Nxb4", "a3", "Nc6", "cxd5"], "White to move — Win bishop pair with tempo", "Take bishop on b4 and kick knight.", "Bishop Pair", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/2PP4/P3PN2/1P1B1PPP/RN1QKB1R b KQ - 0 1", ["e4", "Ne5", "Nxe5", "dxe5", "Ng4"], "Black to move — Push e4 fork space advantage", "Advance e4 and target e5 pawn.", "Space Advantage", 3);
addP("r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 1", ["exd4", "Nxd4", "Bb4", "Nxc6", "bxc6"], "Black to move — Pin and trade on c6", "Pin c3 knight with Bb4.", "Scotch Pin", 2);
addP("r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1", ["O-O", "O-O", "d3", "d6", "Bg5"], "White to move — Four knights opening development", "Castle and pin f6 knight.", "Four Knights", 2);
addP("r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP1N1PPP/R1BQK2R b KQkq - 0 1", ["O-O", "Nf1", "d5", "exd5", "Nxd5"], "Black to move — Central counter with d5", "Strike in the center with d5.", "Center Counter", 2);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bPP4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 0 1", ["a3", "Bxc3", "Bxc3", "e4", "Ne5"], "White to move — Bishop pair and outpost on e5", "Kick bishop with a3 and anchor knight on e5.", "Outpost Strategy", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bPP4/2N2N2/PP1BPPPP/R2QKB1R w KQ - 0 1", ["cxd5", "Nxd5", "e4", "Nxc3", "bxc3"], "White to move — Center pawn pawn majority", "Push e4 to gain big central space.", "Center Pawn Wave", 3);
addP("r1bq1rk1/pppp1ppp/2n5/4p3/2B1n3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 1", ["Nxe4", "d5", "Bd3", "dxe4", "Bxe4"], "White to move — Central recapture on e4", "Recapture piece and maintain active bishop.", "Material Balance", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/3pp3/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 1", ["cxd5", "Nxd5", "Bc4", "Nxc3", "bxc3"], "White to move — Classical bishop activation", "Activate bishop to c4 and recapture c3.", "Active Pieces", 3);
addP("r1bq1rk1/ppp2ppp/2n5/3np3/1bB5/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1", ["Nxd5", "Be6", "Nxb4", "Bxc4", "Nxc6"], "White to move — Sharp tactical liquidation", "Trade knights and remove the bishop.", "Sharp Tactic", 3);
addP("r1bq1rk1/ppp2ppp/2n2n2/2bpp3/4P3/2PP1N2/PP2BPPP/RNBQK2R w KQ - 0 1", ["Nbd2", "a5", "O-O", "Re8", "Qc2"], "White to move — Solid closed center maneuver", "Nbd2, castle, and organize the pieces.", "Classical Maneuver", 2);
addP("r1bq1rk1/ppp2ppp/2n2n2/2bpp3/4P3/2PP1N2/PP1NBPPP/R1BQK2R b KQ - 0 1", ["dxe4", "dxe4", "a5", "O-O", "Qe7"], "Black to move — Control queen side light squares", "Liquidate center and play a5/Qe7.", "Center Equalizer", 2);
addP("r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQR1K1 w - - 0 1", ["Bb3", "Ba7", "h3", "h6", "Nbd2"], "White to move — Spanish quiet maneuvering", "Tuck bishop to b3, h3, and Nbd2.", "Quiet Spanish", 2);
addP("r1bq1rk1/1pp2ppp/p1np1n2/4p3/2B1P3/2PP1N2/PP3PPP/RNBQR1K1 b - - 0 1", ["Na5", "Bb3", "Nxb3", "axb3", "c5"], "Black to move — Trade bishop and stake claim on c5", "Swap white's bishop and play c5.", "Space Claim", 3);
addP("r1bq1rk1/ppp2ppp/2n5/3np3/2B5/3P1N2/PPP1NPPP/R1BQK2R w KQ - 0 1", ["O-O", "Bg4", "Ng3", "Nd4", "c3"], "White to move — Defuse Kingside pin with c3", "Castle, Ng3, and kick knight with c3.", "Defusing Pins", 3);
addP("r1bq1rk1/ppp2ppp/2n5/3np3/2B5/2PP1N2/PP3PPP/RNBQK2R b KQ - 0 1", ["Nb6", "Bb3", "Bg4", "O-O", "Qd7"], "Black to move — Target d3 pawn with active pieces", "Play Nb6, Bg4, and coordinate on d3.", "Pawn Pressure", 3);
addP("r1bq1rk1/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 1", ["Bd3", "b6", "O-O", "Bb7", "e4"], "White to move — Central pawn strike e4", "Develop Bd3 and push e4.", "Queen's Gambit Style", 3);
addP("r1bq1rk1/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PP1B1PPP/R2QKB1R b KQ - 0 1", ["Re8", "Bd3", "e5", "dxe5", "Nxe5"], "Black to move — Break open center with e5", "Push e5 and recapture with knight.", "Central Breakout", 3);
addP("r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 1", ["b3", "b6", "Bb2", "Bb7", "Qc2"], "White to move — Fianchetto setup on b2", "Play b3, Bb2, and coordinate the queens.", "Fianchetto Structure", 2);
addP("r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/1PN1PN2/P3BPPP/R1BQ1RK1 b - - 0 1", ["b6", "Bb2", "Bb7", "Rc1", "Rc8"], "Black to move — Symmetric harmonic setup", "Mirror white's development on c8.", "Symmetric Play", 2);
addP("r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 1", ["cxd5", "exd5", "dxc5", "Bxc5", "b3"], "White to move — Create isolated queen pawn (IQP) structure", "Trade on d5 and c5 to isolate d5.", "IQP Strategy", 3);

// Final output
const allPuzzles = rawPuzzles.map((p, idx) => ({
  id: idx + 1,
  ...p
}));

console.log(`\n========================================`);
console.log(`Successfully Generated & Verified: ${allPuzzles.length} Total Puzzles`);
console.log(`- Easy (Difficulty 1):   ${allPuzzles.filter(p => p.difficulty === 1).length}`);
console.log(`- Medium (Difficulty 2): ${allPuzzles.filter(p => p.difficulty === 2).length}`);
console.log(`- Hard (Difficulty 3):   ${allPuzzles.filter(p => p.difficulty === 3).length}`);
console.log(`========================================\n`);

const targetPath = path.resolve('src/data/chess-puzzles.json');
fs.writeFileSync(targetPath, JSON.stringify(allPuzzles, null, 2), 'utf8');
console.log(`Successfully written to: ${targetPath}`);
