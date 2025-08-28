#!/usr/bin/env node

/**
 * CueWise Setup Validator
 * 
 * This script helps validate your environment setup before running the application.
 * Run with: node validate-setup.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Colors for console output
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

function checkMark() {
  return `${colors.green}✓${colors.reset}`;
}

function crossMark() {
  return `${colors.red}✗${colors.reset}`;
}

function warningMark() {
  return `${colors.yellow}⚠${colors.reset}`;
}

async function validateSetup() {
  log(`${colors.bold}🚀 CueWise Setup Validator${colors.reset}\n`);
  
  let allChecks = true;

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    log(`${checkMark()} Node.js version: ${nodeVersion}`, 'green');
  } else {
    log(`${crossMark()} Node.js version: ${nodeVersion} (required: 18+)`, 'red');
    allChecks = false;
  }

  // Check if package.json exists
  const packageJsonPath = join(__dirname, 'package.json');
  if (existsSync(packageJsonPath)) {
    log(`${checkMark()} package.json found`, 'green');
  } else {
    log(`${crossMark()} package.json not found`, 'red');
    allChecks = false;
    return;
  }

  // Check if node_modules exists
  const nodeModulesPath = join(__dirname, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    log(`${checkMark()} node_modules directory found`, 'green');
  } else {
    log(`${crossMark()} node_modules directory not found. Run: npm install`, 'red');
    allChecks = false;
  }

  // Check critical dependencies
  const criticalDeps = ['express', 'react', 'vite', 'drizzle-orm', '@neondatabase/serverless'];
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  for (const dep of criticalDeps) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      log(`${checkMark()} Dependency found: ${dep}`, 'green');
    } else {
      log(`${crossMark()} Missing dependency: ${dep}`, 'red');
      allChecks = false;
    }
  }

  // Check .env file
  const envPath = join(__dirname, '.env');
  if (existsSync(envPath)) {
    log(`${checkMark()} .env file found`, 'green');
    
    const envContent = readFileSync(envPath, 'utf8');
    
    // Check required environment variables
    const requiredVars = ['DATABASE_URL', 'OPENAI_API_KEY'];
    for (const varName of requiredVars) {
      if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`) && !envContent.includes(`${varName}=sk-test`)) {
        log(`${checkMark()} ${varName} configured`, 'green');
      } else if (envContent.includes(`${varName}=`)) {
        log(`${warningMark()} ${varName} found but appears to be placeholder value`, 'yellow');
      } else {
        log(`${crossMark()} ${varName} not found in .env`, 'red');
        allChecks = false;
      }
    }

    // Check optional variables
    const optionalVars = ['PORT', 'NODE_ENV'];
    for (const varName of optionalVars) {
      if (envContent.includes(`${varName}=`)) {
        log(`${checkMark()} ${varName} configured (optional)`, 'green');
      } else {
        log(`${warningMark()} ${varName} not configured (optional)`, 'yellow');
      }
    }
  } else {
    log(`${crossMark()} .env file not found. Copy from .env.example`, 'red');
    allChecks = false;
  }

  // Check project structure
  const requiredPaths = [
    'client/src',
    'server',
    'shared/schema.ts',
    'vite.config.ts',
    'drizzle.config.ts'
  ];

  for (const path of requiredPaths) {
    const fullPath = join(__dirname, path);
    if (existsSync(fullPath)) {
      log(`${checkMark()} Found: ${path}`, 'green');
    } else {
      log(`${crossMark()} Missing: ${path}`, 'red');
      allChecks = false;
    }
  }

  // Test database connection (if configured)
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    if (dbUrlMatch && dbUrlMatch[1] && !dbUrlMatch[1].includes('localhost') && !dbUrlMatch[1].includes('test')) {
      log('\n📡 Testing database connection...');
      try {
        // This is a basic test - in practice you'd want to test the actual connection
        if (dbUrlMatch[1].startsWith('postgresql://')) {
          log(`${checkMark()} Database URL format appears valid`, 'green');
        } else {
          log(`${warningMark()} Database URL format may be invalid`, 'yellow');
        }
      } catch (error) {
        log(`${crossMark()} Database connection test failed: ${error.message}`, 'red');
      }
    }
  }

  // Summary
  log('\n' + '='.repeat(50));
  if (allChecks) {
    log(`${colors.bold}${colors.green}🎉 Setup validation passed!${colors.reset}`);
    log('\nYou can now run the application:');
    log(`${colors.blue}npm run dev${colors.reset} - Start development server`);
    log(`${colors.blue}npm run build${colors.reset} - Build for production`);
  } else {
    log(`${colors.bold}${colors.red}❌ Setup validation failed!${colors.reset}`);
    log('\nPlease fix the issues above and run this script again.');
    log('\nQuick setup commands:');
    log(`${colors.blue}npm install${colors.reset} - Install dependencies`);
    log(`${colors.blue}cp .env.example .env${colors.reset} - Create environment file`);
    log(`${colors.blue}# Edit .env with your database URL and API keys${colors.reset}`);
  }
  
  log('\n📚 For detailed setup instructions, see README.md');
  log('🧪 For testing guide, see TESTING.md\n');
}

// Run validation
validateSetup().catch(console.error);