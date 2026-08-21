const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('[BUILD] Generating codebase graph dynamically...');
  const scriptPath = path.join(__dirname, '..', 'scripts', 'code_graph', 'generate_graph.py');
  
  // Try running with python3, fallback to python
  try {
    execSync(`python3 "${scriptPath}"`, { stdio: 'inherit' });
  } catch (e) {
    execSync(`python "${scriptPath}"`, { stdio: 'inherit' });
  }
  console.log('[BUILD] Codebase graph generated successfully.');
} catch (err) {
  console.warn('[BUILD] Warning: Codebase graph generation skipped/failed:', err.message);
}
