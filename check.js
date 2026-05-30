const fs = require('fs');
const content = fs.readFileSync('frontend/app/checkout/page.tsx', 'utf8').split('\n');
let depth = 0;
let stack = [];
for(let i = 0; i < content.length; i++) {
  const line = content[i];
  let inString = false;
  let stringChar = '';
  for(let j = 0; j < line.length; j++) {
    // Only toggle string if not escaped
    if ((line[j] === '"' || line[j] === "'" || line[j] === '`') && line[j-1] !== '\\') {
      if (!inString) { inString = true; stringChar = line[j]; }
      else if (stringChar === line[j]) { inString = false; }
    }
    // Very simple comment ignore
    if (line[j] === '/' && line[j+1] === '/' && !inString) break;
    
    if (!inString) {
      if (line[j] === '{') { depth++; stack.push(i+1); }
      if (line[j] === '}') { depth--; stack.pop(); }
    }
  }
}
console.log('Final depth:', depth);
console.log('Unclosed braces on lines:', stack);
