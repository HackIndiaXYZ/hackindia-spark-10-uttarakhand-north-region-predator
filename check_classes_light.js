const fs = require('fs');
const files = fs.readdirSync('client/src/pages').map(f => 'client/src/pages/' + f);
files.forEach(f => {
  if (!f.endsWith('.jsx')) return;
  const code = fs.readFileSync(f, 'utf8');
  const matches = [...code.matchAll(/className=(?:["']([^"']*)["']|{`([^`]*)`})/g)];
  matches.forEach(m => {
    const cls = m[1] || m[2] || '';
    const lightBgHovers = ['hover:bg-slate-50', 'hover:bg-slate-100', 'hover:bg-white', 'hover:bg-rose-50', 'hover:bg-orange-50', 'hover:bg-emerald-50'];
    const hasLightBgHover = lightBgHovers.some(h => cls.includes(h));
    const hasDarkText = cls.includes('text-slate') || cls.includes('hover:text-slate') || cls.includes('hover:text-rose') || cls.includes('text-rose') || cls.includes('hover:text-orange') || cls.includes('text-orange') || cls.includes('text-emerald');
    if (hasLightBgHover && !hasDarkText) {
      console.log('BUGGY CLASS in ' + f + ': ' + cls);
    }
  });
});
