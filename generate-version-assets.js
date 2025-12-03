#!/usr/bin/env node

/**
 * Generate version.json with auto-increment
 * Automatically increments patch version (1.0.0 → 1.0.1 → 1.0.2)
 * 
 * Usage:
 *   node generate-version-assets.js              → Auto-increment patch (1.0.0 → 1.0.1)
 *   node generate-version-assets.js --major      → Increment major (1.0.0 → 2.0.0)
 *   node generate-version-assets.js --minor      → Increment minor (1.0.0 → 1.1.0)
 *   node generate-version-assets.js --patch      → Increment patch (1.0.0 → 1.0.1)
 *   node generate-version-assets.js --version 2.0.0  → Set specific version
 *   node generate-version-assets.js --message "Bug fixes"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(`--${flag}`);
const getArg = (name) => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? args[index + 1] : null;
};

/**
 * Parse version string to array [major, minor, patch]
 */
function parseVersion(versionString) {
    const parts = versionString.split('.').map(Number);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * Increment version based on type
 */
function incrementVersion(version, type = 'patch') {
    const [major, minor, patch] = parseVersion(version);
    
    switch(type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
        default:
            return `${major}.${minor}.${patch + 1}`;
    }
}

/**
 * Read current version from version.json if it exists
 */
function getCurrentVersion() {
    const versionPath = path.join(__dirname, 'assets', 'json', 'version.json');
    
    if (fs.existsSync(versionPath)) {
        try {
            const data = fs.readFileSync(versionPath, 'utf8');
            const json = JSON.parse(data);
            return json.version || '1.0.0';
        } catch (e) {
            return '1.0.0';
        }
    }
    
    return '1.0.0';
}

// Determine version
let version;
const manualVersion = getArg('version');

if (manualVersion) {
    // Manual version specified
    version = manualVersion;
    console.log(`📌 Using manual version: ${version}`);
} else {
    // Auto-increment
    const currentVersion = getCurrentVersion();
    let incrementType = 'patch'; // Default
    
    if (hasFlag('major')) {
        incrementType = 'major';
    } else if (hasFlag('minor')) {
        incrementType = 'minor';
    } else if (hasFlag('patch')) {
        incrementType = 'patch';
    }
    
    version = incrementVersion(currentVersion, incrementType);
    console.log(`⬆️  Auto-increment (${incrementType}): ${currentVersion} → ${version}`);
}

// Get custom message
const customMessage = getArg('message');

// Get git commit hash
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
console.log('');
console.log(JSON.stringify(versionData, null, 2));