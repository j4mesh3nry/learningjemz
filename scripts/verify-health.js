import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runCommand = (command, args) => {
  console.log(`\n\x1b[36mRunning: ${command} ${args.join(' ')}\x1b[0m`);
  
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    cwd: resolve(__dirname, '..')
  });

  if (result.status !== 0) {
    console.error(`\n\x1b[31mCommand failed: ${command} ${args.join(' ')}\x1b[0m`);
    return false;
  }
  return true;
};

const verify = () => {
  console.log('\x1b[35m=== LearningJemz Health Verification Pipeline ===\x1b[0m');

  // Step 1: Lint check
  if (!runCommand('npm', ['run', 'lint'])) {
    console.error('\x1b[31m❌ Health Verification FAILED at Step 1: Linting\x1b[0m\n');
    process.exit(1);
  }
  console.log('\x1b[32m✔ Step 1: Lint check passed.\x1b[0m');

  // Step 2: Build / Compile Check
  if (!runCommand('npm', ['run', 'build'])) {
    console.error('\x1b[31m❌ Health Verification FAILED at Step 2: Compile/Build\x1b[0m\n');
    process.exit(1);
  }
  console.log('\x1b[32m✔ Step 2: Compilation & build checks passed.\x1b[0m');

  // Step 3: Run Vitest Unit Tests
  if (!runCommand('npm', ['run', 'test'])) {
    console.error('\x1b[31m❌ Health Verification FAILED at Step 3: Unit Tests\x1b[0m\n');
    process.exit(1);
  }
  console.log('\x1b[32m✔ Step 3: All tests passed.\x1b[0m');

  console.log('\n\x1b[32m✨ HEALTH VERIFICATION PASSED. Code is green & ready to commit! ✨\x1b[0m\n');
  process.exit(0);
};

verify();
