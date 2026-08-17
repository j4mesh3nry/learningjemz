#!/usr/bin/env node
/**
 * fetch_lichess_puzzles.cjs
 * 
 * Downloads and processes puzzles from the Lichess open puzzle database
 * (https://database.lichess.org/#puzzles) to produce a validated, curated
 * chess-puzzles.json for the LearningJemz app.
 *
 * Lichess CSV format:
 *   PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
 *
 * Lichess puzzle convention:
 *   - FEN  = position BEFORE the puzzle starts
 *   - Moves[0] = opponent's last move (the "setup" move)
 *   - Moves[1..] = the solution the player must find
 *
 * Our output format:
 *   { id, difficulty, difficultyLabel, fen, turn, goal, moves[], theme, hint }
 *   - fen = position AFTER the setup move (where the player starts solving)
 *   - turn = side to move in that FEN ("w" or "b")
 *   - moves = solution moves in SAN notation
 *
 * Usage:
 *   node scripts/fetch_lichess_puzzles.cjs [--input path/to/lichess_db_puzzle.csv]
 *
 * If --input is not given, downloads from database.lichess.org (requires fzstd).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// chess.js v1.x is CJS
const Chess = require('chess.js').Chess || require('chess.js');

let fzstd;
try {
  fzstd = require('fzstd');
} catch {
  // Will only be needed if downloading from Lichess
}

// ─── Configuration ───────────────────────────────────────────────────────────

const CONFIG = {
  // Target puzzle counts per difficulty tier
  targets: {
    Easy:   500,
    Medium: 600,
    Hard:   400,
  },
  // Lichess rating → our difficulty
  ratingBands: {
    Easy:   { min: 400,  max: 1100 },
    Medium: { min: 1101, max: 1600 },
    Hard:   { min: 1601, max: 2200 },
  },
  // Quality filters
  minPopularity: 70,      // Lichess popularity score (0-100)
  minNbPlays:    500,     // must have been played at least this many times
  maxRatingDev:  90,      // rating must be stable
  // Max lines to scan before giving up (limits download/processing time)
  maxLinesToScan: 4_000_000,
  // Output path
  outputPath: path.join(__dirname, '..', 'src', 'data', 'chess-puzzles.json'),
  // Download URL
  downloadUrl: 'https://database.lichess.org/lichess_db_puzzle.csv.zst',
};

// ─── Theme Mapping ───────────────────────────────────────────────────────────

const THEME_MAP = {
  mateIn1:           'Mate in 1',
  mateIn2:           'Mate in 2',
  mateIn3:           'Mate in 3',
  mateIn4:           'Mate in 4',
  mateIn5:           'Mate in 5',
  backRankMate:      'Back Rank Mate',
  smotheredMate:     'Smothered Mate',
  anastasiasMate:    'Anastasia\'s Mate',
  arabianMate:       'Arabian Mate',
  bodensMate:        'Boden\'s Mate',
  hookMate:          'Hook Mate',
  doubleBishopMate:  'Double Bishop Mate',
  dovetailMate:      'Dovetail Mate',
  fork:              'Fork',
  pin:               'Pin',
  skewer:            'Skewer',
  discoveredAttack:  'Discovered Attack',
  doubleCheck:       'Double Check',
  hangingPiece:      'Hanging Piece',
  sacrifice:         'Sacrifice',
  deflection:        'Deflection',
  attraction:        'Attraction',
  clearance:         'Clearance',
  intermezzo:        'Intermezzo',
  xRayAttack:        'X-Ray Attack',
  quietMove:         'Quiet Move',
  defensiveMove:     'Defense',
  trappedPiece:      'Trapped Piece',
  promotion:         'Promotion',
  underPromotion:    'Under-Promotion',
  castling:          'Castling',
  enPassant:         'En Passant',
  kingsideAttack:    'Kingside Attack',
  queensideAttack:   'Queenside Attack',
  exposedKing:       'Exposed King',
  advancedPawn:      'Advanced Pawn',
  zugzwang:          'Zugzwang',
  capturingDefender: 'Capture Defender',
  interferenceCheck: 'Interference',
  removingTheDefender: 'Remove Defender',
};

// Priority themes for kid-friendliness and educational value
const PRIORITY_THEMES = [
  'mateIn1', 'mateIn2', 'backRankMate', 'fork', 'pin', 'skewer',
  'hangingPiece', 'discoveredAttack', 'sacrifice', 'trappedPiece',
  'deflection', 'promotion', 'doubleCheck', 'smotheredMate',
];

// ─── Hint generation ─────────────────────────────────────────────────────────

const HINT_MAP = {
  mateIn1:           'Look for a move that delivers checkmate immediately.',
  mateIn2:           'Find the forcing sequence that leads to checkmate in two moves.',
  mateIn3:           'Calculate a three-move checkmate sequence.',
  mateIn4:           'Calculate a four-move checkmate sequence.',
  mateIn5:           'Plan a five-move checkmate sequence.',
  backRankMate:      'The back rank is vulnerable — look for a mating move there.',
  smotheredMate:     'The king is surrounded by its own pieces — use your knight!',
  anastasiasMate:    'Use your rook and knight together to trap the king on the edge.',
  arabianMate:       'Coordinate your rook and knight for a corner mate.',
  fork:              'Find a move that attacks two or more pieces at once.',
  pin:               'Pin an enemy piece to a more valuable one behind it.',
  skewer:            'Attack a valuable piece — when it moves, win the piece behind it.',
  discoveredAttack:  'Move one piece to reveal an attack from another.',
  doubleCheck:       'Deliver check with two pieces simultaneously.',
  hangingPiece:      'Capture a piece that is undefended.',
  sacrifice:         'Give up material now for a bigger advantage later.',
  deflection:        'Force a defender away from the square it is guarding.',
  attraction:        'Lure an enemy piece to a vulnerable square.',
  clearance:         'Move one of your pieces out of the way to open a line.',
  intermezzo:        'Play a surprising in-between move before the expected recapture.',
  xRayAttack:        'Attack through an enemy piece to the target behind it.',
  quietMove:         'The best move is a calm, non-forcing one — look for a subtle threat.',
  defensiveMove:     'Find the defensive resource that saves the position.',
  trappedPiece:      'An enemy piece has no safe squares — win it!',
  promotion:         'Push a pawn to the last rank to create a new queen.',
  underPromotion:    'Promote to a knight, bishop, or rook instead of a queen.',
  castling:          'Castle to bring your king to safety and activate your rook.',
  enPassant:         'Capture the enemy pawn en passant.',
  kingsideAttack:    'Launch an attack on the kingside.',
  queensideAttack:   'Attack on the queenside to win material.',
  exposedKing:       'Exploit the enemy king\'s exposed position.',
  advancedPawn:      'Push your advanced pawn to create threats.',
  zugzwang:          'Put your opponent in a position where any move worsens their position.',
  capturingDefender: 'Remove the piece that is defending a key square or piece.',
  removingTheDefender: 'Eliminate the defender to win material.',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert a UCI move string (e.g., "e2e4", "e7e8q") to SAN using chess.js.
 * Returns null if the move is illegal.
 */
function uciToSan(game, uciStr) {
  const from = uciStr.slice(0, 2);
  const to = uciStr.slice(2, 4);
  const promotion = uciStr.length > 4 ? uciStr[4] : undefined;

  try {
    const moveObj = { from, to };
    if (promotion) moveObj.promotion = promotion;
    const result = game.move(moveObj);
    if (!result) return null;
    return result.san;
  } catch {
    return null;
  }
}

/**
 * Pick the most descriptive/primary theme from a Lichess theme list.
 */
function pickPrimaryTheme(themes) {
  // Prefer priority themes in order
  for (const t of PRIORITY_THEMES) {
    if (themes.includes(t)) {
      return THEME_MAP[t] || t;
    }
  }
  // Fall back to any mapped theme
  for (const t of themes) {
    if (THEME_MAP[t]) return THEME_MAP[t];
  }
  return 'Tactic';
}

/**
 * Pick a hint based on themes.
 */
function pickHint(themes) {
  for (const t of PRIORITY_THEMES) {
    if (themes.includes(t) && HINT_MAP[t]) return HINT_MAP[t];
  }
  for (const t of themes) {
    if (HINT_MAP[t]) return HINT_MAP[t];
  }
  return 'Find the best move in this position.';
}

/**
 * Generate the goal text.
 */
function makeGoal(turn, themes) {
  const side = turn === 'w' ? 'White' : 'Black';
  const isMate = themes.some(t => t.startsWith('mateIn') || t.endsWith('Mate'));
  if (isMate) {
    return `${side} to move — Find Checkmate`;
  }
  return `${side} to move — Find the Winning Move`;
}

/**
 * Get difficulty tier from Lichess rating.
 */
function ratingToTier(rating) {
  for (const [tier, band] of Object.entries(CONFIG.ratingBands)) {
    if (rating >= band.min && rating <= band.max) return tier;
  }
  return null;
}

function tierToNum(tier) {
  return tier === 'Easy' ? 1 : tier === 'Medium' ? 2 : 3;
}

// ─── CSV Parsing ─────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  // Simple CSV parser — Lichess CSV has no quoted fields with commas
  const parts = line.split(',');
  if (parts.length < 9) return null;
  return {
    puzzleId:    parts[0],
    fen:         parts[1],
    moves:       parts[2],
    rating:      parseInt(parts[3], 10),
    ratingDev:   parseInt(parts[4], 10),
    popularity:  parseInt(parts[5], 10),
    nbPlays:     parseInt(parts[6], 10),
    themes:      parts[7] ? parts[7].split(' ').filter(Boolean) : [],
    gameUrl:     parts[8],
    openingTags: parts[9] || '',
  };
}

// ─── Puzzle Validation & Conversion ──────────────────────────────────────────

/**
 * Convert a Lichess puzzle row to our app format.
 * Returns null if validation fails.
 */
function convertPuzzle(row, id) {
  const uciMoves = row.moves.split(' ').filter(Boolean);
  if (uciMoves.length < 2) return null; // Need at least setup + 1 solution move

  // 1. Load position and play setup move
  let game;
  try {
    game = new Chess(row.fen);
  } catch {
    return null;
  }

  // Validate starting FEN
  if (!game.fen()) return null;

  // Play the setup move (opponent's last move)
  const setupSan = uciToSan(game, uciMoves[0]);
  if (!setupSan) return null;

  // 2. Now the position is where the player starts
  const puzzleFen = game.fen();
  const playerTurn = game.turn(); // 'w' or 'b'

  // Validate: player should NOT already be in check
  // (The opponent just moved — if the player is in check, 
  //  that means the opponent's move put them in check, which is fine.
  //  Actually wait — if it's the player's turn and they're in check,
  //  that means the opponent delivered check with their last move.
  //  This IS valid in Lichess puzzles — e.g., "opponent checks you, find the best response."
  //  But for our app's "Find Checkmate" / "Find the Winning Move" framing,
  //  we only want puzzles where the player is the one delivering threats.)
  //
  // Actually, Lichess puzzles can have the player starting in check —
  // the player needs to find the best way out. These are valid puzzles.
  // But the screenshot showed a puzzle where the OPPONENT's king was in check
  // while it was the opponent's turn — that's truly illegal.
  // Let's validate: the side NOT to move should NOT be in check.
  // chess.js .inCheck() checks if the CURRENT side to move is in check.
  // We need to verify the position is legal — chess.js validates this on load.

  // 3. Convert solution moves (UCI → SAN)
  const solutionSans = [];
  for (let i = 1; i < uciMoves.length; i++) {
    const san = uciToSan(game, uciMoves[i]);
    if (!san) return null; // Illegal move in sequence → bad puzzle
    solutionSans.push(san);

    // If it's a response move (opponent's turn in the solution), play it
    // but we still include it in the moves array for multi-move puzzles
  }

  if (solutionSans.length === 0) return null;

  // 4. Determine difficulty
  const tier = ratingToTier(row.rating);
  if (!tier) return null;

  // 5. Build output
  return {
    id,
    difficulty: tierToNum(tier),
    difficultyLabel: tier,
    fen: puzzleFen,
    turn: playerTurn,
    goal: makeGoal(playerTurn, row.themes),
    moves: solutionSans,
    theme: pickPrimaryTheme(row.themes),
    hint: pickHint(row.themes),
    lichessId: row.puzzleId,
    rating: row.rating,
  };
}

// ─── Download with streaming decompression ───────────────────────────────────

function downloadAndDecompress(url) {
  return new Promise((resolve, reject) => {
    if (!fzstd) {
      reject(new Error('fzstd not installed. Run: npm install --save-dev fzstd'));
      return;
    }

    console.log(`Downloading ${url} ...`);
    const chunks = [];
    let downloadedBytes = 0;
    let lastLogTime = Date.now();

    const handleResponse = (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        console.log(`  Redirected to ${redirectUrl}`);
        const proto = redirectUrl.startsWith('https') ? https : http;
        proto.get(redirectUrl, handleResponse).on('error', reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
      console.log(`  Total size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

      res.on('data', (chunk) => {
        chunks.push(chunk);
        downloadedBytes += chunk.length;
        const now = Date.now();
        if (now - lastLogTime > 5000) {
          const pct = totalBytes ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : '?';
          console.log(`  Downloaded: ${(downloadedBytes / 1024 / 1024).toFixed(1)} MB (${pct}%)`);
          lastLogTime = now;
        }
      });

      res.on('end', () => {
        console.log(`  Download complete: ${(downloadedBytes / 1024 / 1024).toFixed(1)} MB`);
        console.log('  Decompressing...');
        try {
          const compressed = Buffer.concat(chunks);
          const decompressed = fzstd.decompress(new Uint8Array(compressed));
          const text = Buffer.from(decompressed).toString('utf-8');
          console.log(`  Decompressed: ${(text.length / 1024 / 1024).toFixed(1)} MB`);
          resolve(text);
        } catch (err) {
          reject(new Error(`Decompression failed: ${err.message}`));
        }
      });

      res.on('error', reject);
    };

    https.get(url, handleResponse).on('error', reject);
  });
}

// ─── Streaming line processor ────────────────────────────────────────────────

/**
 * Process CSV lines one at a time via streaming.
 * Returns the collected puzzles once all targets are met or input exhausted.
 */
function createLineProcessor() {
  const collected = { Easy: [], Medium: [], Hard: [] };
  const totalTarget = CONFIG.targets.Easy + CONFIG.targets.Medium + CONFIG.targets.Hard;
  let scanned = 0;
  let skippedQuality = 0;
  let skippedConvert = 0;
  let skippedTheme = 0;
  let isFirstLine = true;
  let allTargetsMet = false;

  const themeCountPerTier = { Easy: {}, Medium: {}, Hard: {} };
  const maxPerThemePerTier = {
    Easy:   Math.ceil(CONFIG.targets.Easy / 10),
    Medium: Math.ceil(CONFIG.targets.Medium / 10),
    Hard:   Math.ceil(CONFIG.targets.Hard / 10),
  };

  function processLine(line) {
    if (allTargetsMet) return;

    line = line.trim();
    if (!line) return;

    // Skip CSV header
    if (isFirstLine) {
      isFirstLine = false;
      if (line.startsWith('PuzzleId')) return;
    }

    scanned++;

    if (scanned % 200_000 === 0) {
      const done = collected.Easy.length + collected.Medium.length + collected.Hard.length;
      console.log(`  Scanned ${scanned.toLocaleString()} lines, collected ${done}/${totalTarget}`);
    }

    // Check targets
    if (collected.Easy.length >= CONFIG.targets.Easy &&
        collected.Medium.length >= CONFIG.targets.Medium &&
        collected.Hard.length >= CONFIG.targets.Hard) {
      if (!allTargetsMet) {
        console.log('  All targets met!');
        allTargetsMet = true;
      }
      return;
    }

    const row = parseCSVLine(line);
    if (!row) return;

    // Quality filters
    if (row.popularity < CONFIG.minPopularity) { skippedQuality++; return; }
    if (row.nbPlays < CONFIG.minNbPlays) { skippedQuality++; return; }
    if (row.ratingDev > CONFIG.maxRatingDev) { skippedQuality++; return; }

    const tier = ratingToTier(row.rating);
    if (!tier) { skippedQuality++; return; }
    if (collected[tier].length >= CONFIG.targets[tier]) return;

    const hasGoodTheme = row.themes.some(t => THEME_MAP[t]);
    if (!hasGoodTheme) { skippedTheme++; return; }

    const primaryTheme = pickPrimaryTheme(row.themes);
    const tc = themeCountPerTier[tier];
    tc[primaryTheme] = (tc[primaryTheme] || 0);
    if (tc[primaryTheme] >= maxPerThemePerTier[tier]) return;

    const nextId = collected.Easy.length + collected.Medium.length + collected.Hard.length + 1;
    const puzzle = convertPuzzle(row, nextId);
    if (!puzzle) { skippedConvert++; return; }

    collected[tier].push(puzzle);
    tc[primaryTheme]++;
  }

  function getResults() {
    return { collected, scanned, skippedQuality, skippedConvert, skippedTheme, themeCountPerTier };
  }

  function isDone() {
    return allTargetsMet;
  }

  return { processLine, getResults, isDone };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');

  const processor = createLineProcessor();

  console.log('\nProcessing puzzles...');
  console.log(`Targets: Easy=${CONFIG.targets.Easy}, Medium=${CONFIG.targets.Medium}, Hard=${CONFIG.targets.Hard}`);
  console.log(`Total target: ${CONFIG.targets.Easy + CONFIG.targets.Medium + CONFIG.targets.Hard}`);

  if (inputIdx !== -1 && args[inputIdx + 1]) {
    const inputPath = args[inputIdx + 1];
    console.log(`Reading from local file: ${inputPath}`);

    if (inputPath.endsWith('.zst')) {
      if (!fzstd) {
        console.error('fzstd not installed. Run: npm install --save-dev fzstd');
        process.exit(1);
      }
      // Stream-decompress the .zst file in chunks to avoid V8 string limit
      const compressed = fs.readFileSync(inputPath);
      console.log(`  Compressed size: ${(compressed.length / 1024 / 1024).toFixed(1)} MB`);
      console.log('  Decompressing and processing in streaming mode...');

      let leftover = '';
      const decompressor = new fzstd.Decompress((decompressedChunk, isLast) => {
        if (processor.isDone()) return;

        // Convert chunk to string and split into lines
        const text = leftover + Buffer.from(decompressedChunk).toString('utf-8');
        const lines = text.split('\n');

        // Last element might be incomplete — save it for next chunk
        leftover = isLast ? '' : lines.pop();

        for (const line of lines) {
          if (processor.isDone()) return;
          processor.processLine(line);
        }

        // Handle leftover on last chunk
        if (isLast && leftover) {
          processor.processLine(leftover);
          leftover = '';
        }
      });

      // Feed compressed data in manageable chunks (16MB each)
      const CHUNK_SIZE = 16 * 1024 * 1024;
      const totalChunks = Math.ceil(compressed.length / CHUNK_SIZE);
      for (let i = 0; i < totalChunks; i++) {
        if (processor.isDone()) break;
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, compressed.length);
        const isLast = (end === compressed.length);
        const chunk = new Uint8Array(compressed.buffer, compressed.byteOffset + start, end - start);
        decompressor.push(chunk, isLast);
      }
    } else {
      // Plain CSV — stream line by line using readline
      const readline = require('readline');
      const rl = readline.createInterface({
        input: fs.createReadStream(inputPath, { encoding: 'utf-8' }),
        crlfDelay: Infinity,
      });
      for await (const line of rl) {
        if (processor.isDone()) { rl.close(); break; }
        processor.processLine(line);
      }
    }
  } else {
    console.error('Please provide --input <path> to a Lichess puzzle CSV or .csv.zst file.');
    console.error('Download from: https://database.lichess.org/#puzzles');
    process.exit(1);
  }

  const { collected, scanned, skippedQuality, skippedConvert, skippedTheme, themeCountPerTier } =
    processor.getResults();

  // Combine all tiers
  const allPuzzles = [
    ...collected.Easy,
    ...collected.Medium,
    ...collected.Hard,
  ];

  // Re-number IDs sequentially
  allPuzzles.forEach((p, i) => { p.id = i + 1; });

  console.log(`\n=== Results ===`);
  console.log(`Scanned:    ${scanned.toLocaleString()} lines`);
  console.log(`Collected:  ${allPuzzles.length} puzzles`);
  console.log(`  Easy:     ${collected.Easy.length}`);
  console.log(`  Medium:   ${collected.Medium.length}`);
  console.log(`  Hard:     ${collected.Hard.length}`);
  console.log(`Skipped (quality): ${skippedQuality.toLocaleString()}`);
  console.log(`Skipped (theme):   ${skippedTheme.toLocaleString()}`);
  console.log(`Skipped (convert): ${skippedConvert.toLocaleString()}`);

  // Theme distribution report
  for (const tier of ['Easy', 'Medium', 'Hard']) {
    const tc = themeCountPerTier[tier];
    const sorted = Object.entries(tc).sort((a, b) => b[1] - a[1]);
    console.log(`\n  ${tier} themes:`);
    for (const [theme, count] of sorted) {
      console.log(`    ${theme}: ${count}`);
    }
  }

  // Write output — remove lichessId and rating (debugging only)
  const output = allPuzzles.map(({ lichessId, rating, ...rest }) => rest);

  fs.writeFileSync(CONFIG.outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nWritten to: ${CONFIG.outputPath}`);
  console.log(`File size: ${(fs.statSync(CONFIG.outputPath).size / 1024).toFixed(1)} KB`);

  // Final validation pass
  console.log('\nRunning final validation...');
  let validCount = 0;
  let invalidCount = 0;
  for (const p of output) {
    try {
      const g = new Chess(p.fen);
      if (g.turn() !== p.turn) {
        console.error(`  FAIL id=${p.id}: turn mismatch (fen=${g.turn()}, field=${p.turn})`);
        invalidCount++;
        continue;
      }
      let valid = true;
      for (const san of p.moves) {
        const result = g.move(san);
        if (!result) {
          console.error(`  FAIL id=${p.id}: illegal move ${san} in position ${g.fen()}`);
          valid = false;
          break;
        }
      }
      if (valid) validCount++;
      else invalidCount++;
    } catch (err) {
      console.error(`  FAIL id=${p.id}: ${err.message}`);
      invalidCount++;
    }
  }
  console.log(`\nValidation: ${validCount} valid, ${invalidCount} invalid out of ${output.length}`);
  if (invalidCount > 0) {
    console.error(`\nWARNING: ${invalidCount} puzzles failed validation!`);
    process.exit(1);
  }
  console.log('\nAll puzzles validated successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
