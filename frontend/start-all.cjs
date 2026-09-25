const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log("\n=======================================================");
console.log(" 🚀 STARTING SMART CAMPUS (BACKEND + FRONTEND)...");
console.log("=======================================================\n");

// Locate the project root
let rootDir = __dirname;
if (!fs.existsSync(path.join(rootDir, 'backend')) && fs.existsSync(path.join(rootDir, '..', 'backend'))) {
  rootDir = path.resolve(rootDir, '..');
}

const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['start'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
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
