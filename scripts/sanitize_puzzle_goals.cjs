const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');

const puzzlesPath = path.join(__dirname, '../src/data/chess-puzzles.json');
const puzzles = JSON.parse(fs.readFileSync(puzzlesPath, 'utf8'));

let updated = 0;
let fensChecked = 0;
let invalidFens = 0;

puzzles.forEach(p => {
  const turnLabel = p.turn === 'w' ? 'White' : 'Black';
  const isMate = (p.moves && p.moves.some(m => m.includes('#'))) || (p.goal && p.goal.toLowerCase().includes('mate'));
  const cleanGoal = isMate ? `${turnLabel} to move — Find Checkmate` : `${turnLabel} to move — Find the Winning Move`;
  
  if (p.goal !== cleanGoal) {
    p.goal = cleanGoal;
    updated++;
  }

  // Audit FEN legality
  try {
    const c = new Chess(p.fen);
    fensChecked++;
  } catch (e) {
    console.error(`Invalid FEN in puzzle ID ${p.id}:`, p.fen);
    invalidFens++;
  }
});

fs.writeFileSync(puzzlesPath, JSON.stringify(puzzles, null, 2), 'utf8');
console.log(`Sanitized goals for ${updated} puzzles.`);
console.log(`Audited ${fensChecked} puzzle FENs. Invalid FENs: ${invalidFens}`);
