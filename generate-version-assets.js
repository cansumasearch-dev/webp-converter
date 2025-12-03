#!/usr/bin/env node

/**
 * Generate version.json for assets/json/ folder
 * Run this script during deployment to update the version file
 * 
 * Usage:
 *   node generate-version.js
 *   node generate-version.js --version 2.1.0
 *   node generate-version.js --message "Bug fixes and improvements"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? args[index + 1] : null;
};

// Get version from package.json or command line
let version = getArg('version');
if (!version) {
    try {
        const packageJson = require('./package.json');
        version = packageJson.version;
    } catch (e) {
        version = '1.0.0';
    }
}

// Get custom message
const customMessage = getArg('message');

// Get git commit hash or use provided hash
let hash = getArg('hash');
if (!hash) {
    try {
        hash = execSync('git rev-parse --short HEAD').toString().trim();
    } catch (e) {
        hash = Math.random().toString(36).substring(2, 10);
    }
}

// Get git branch
let branch = 'unknown';
try {
    branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (e) {
    // Ignore
}

// Generate version data
const versionData = {
    version: version,
    timestamp: Date.now(),
    hash: hash,
    branch: branch,
    buildDate: new Date().toISOString(),
    deployedBy: process.env.USER || process.env.USERNAME || 'unknown'
};

// Add custom message if provided
if (customMessage) {
    versionData.message = customMessage;
}

// Create assets/json directory if it doesn't exist
const outputDir = path.join(__dirname, 'assets', 'json');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Created directory: assets/json/');
}

// Write to version.json
const outputPath = path.join(outputDir, 'version.json');
fs.writeFileSync(outputPath, JSON.stringify(versionData, null, 2), 'utf8');

console.log('✅ version.json generated successfully!');
console.log('📍 Location: assets/json/version.json');
console.log(JSON.stringify(versionData, null, 2));