#!/usr/bin/env node

/**
 * Demo Mode Runner for CueWise
 * 
 * This script runs the application in demo mode with mock data
 * when a real database is not available.
 * 
 * Usage: npm run demo
 */

import { spawn } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create demo environment
const demoEnvContent = `# Demo Environment - Generated automatically
# This uses placeholder values for testing the UI without external services
DATABASE_URL=postgresql://demo:demo@localhost:5432/demo_db
OPENAI_API_KEY=sk-demo-key-for-ui-testing-only
PORT=5000
NODE_ENV=development
DEMO_MODE=true
`;

const envPath = join(__dirname, '.env');

// Create .env if it doesn't exist or has placeholder values
if (!existsSync(envPath)) {
  log(`${colors.yellow}⚠ Creating demo .env file...${colors.reset}`);
  writeFileSync(envPath, demoEnvContent);
  log(`${colors.green}✓ Demo .env created${colors.reset}`);
}

log(`${colors.bold}🎭 Starting CueWise in Demo Mode${colors.reset}\n`);

log(`${colors.blue}📝 Demo Mode Features:${colors.reset}`);
log('• UI testing without database');
log('• Mock data for all components');
log('• No external API calls');
log('• Safe for development and testing\n');

log(`${colors.yellow}⚠ Note: Database and AI features will not work in demo mode${colors.reset}`);
log(`For full functionality, configure a real database and OpenAI API key\n`);

log(`${colors.bold}Starting development server...${colors.reset}\n`);

// Start the development server
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Handle process termination
process.on('SIGINT', () => {
  log(`\n${colors.yellow}Shutting down demo mode...${colors.reset}`);
  devProcess.kill('SIGINT');
  process.exit(0);
});

devProcess.on('error', (error) => {
  log(`${colors.red}Error starting demo mode: ${error.message}${colors.reset}`);
  process.exit(1);
});

devProcess.on('close', (code) => {
  if (code !== 0) {
    log(`${colors.red}Demo mode exited with code ${code}${colors.reset}`);
    log(`\n${colors.yellow}Troubleshooting tips:${colors.reset}`);
    log('1. Run: npm install');
    log('2. Check for TypeScript errors: npm run check');
    log('3. See README.md for full setup instructions');
  }
  process.exit(code);
});