const fs = require('fs');
const files = fs.readdirSync('client/src/pages').map(f => 'client/src/pages/' + f);
files.forEach(f => {
  if (!f.endsWith('.jsx')) return;
  const code = fs.readFileSync(f, 'utf8');
  // Match className strings (both double quotes, single quotes, and template literals)
  // Simple regex for string literals
  const matches = [...code.matchAll(/className=(?:["']([^"']*)["']|{`([^`]*)`})/g)];
  matches.forEach(m => {
    const cls = m[1] || m[2] || '';
    const darkBgHovers = ['hover:bg-slate-900', 'hover:bg-slate-800', 'hover:bg-primary', 'hover:bg-orange-500', 'hover:bg-emerald-500', 'hover:bg-emerald-600', 'hover:bg-rose-500', 'hover:bg-rose-600'];
    const hasDarkBgHover = darkBgHovers.some(h => cls.includes(h));
    const hasWhiteText = cls.includes('text-white') || cls.includes('hover:text-white');
    if (hasDarkBgHover && !hasWhiteText) {
      console.log('BUGGY CLASS in ' + f + ': ' + cls);
    }
  });
});
