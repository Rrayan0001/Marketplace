const fs = require('fs');
const content = fs.readFileSync('app/globals.css', 'utf8');

const [customPart, shadcnPart] = content.split('@layer base {');

if (!shadcnPart) {
  console.error('Could not split file');
  process.exit(1);
}

let newCustom = customPart
  .replace(/--primary/g, '--brand-primary')
  .replace(/--secondary/g, '--brand-secondary')
  .replace(/--border/g, '--brand-border');

fs.writeFileSync('app/globals.css', newCustom + '@layer base {' + shadcnPart);
console.log('Successfully updated globals.css');
