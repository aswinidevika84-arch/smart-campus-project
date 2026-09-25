const { spawn } = require('child_process');

console.log("\n=======================================================");
console.log(" 🚀 STARTING SMART CAMPUS (BACKEND + FRONTEND)...");
console.log("=======================================================\n");

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['--prefix', 'backend', 'start'], {
  stdio: 'inherit',
  shell: true
});

const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

backend.on('close', (code) => {
  console.log('Backend stopped with code ' + code);
});

frontend.on('close', (code) => {
  console.log('Frontend stopped with code ' + code);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
