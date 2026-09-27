const fs = require('fs');
const files = ['client/src/pages/CustomerDashboard.jsx', 'client/src/pages/DriverDashboard.jsx', 'client/src/pages/AdminDashboard.jsx'];
files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  const matches = [...code.matchAll(/<button[^>]*>[\s\S]*?<\/button>/g)];
  console.log('--- ' + f + ' ---');
  matches.forEach(m => {
    const btn = m[0];
    const clsMatch = btn.match(/className=["']([^"']*)["']/);
    const cls = clsMatch ? clsMatch[1] : '';
    const textMatch = btn.match(/>([^<]*)<\/button>/);
    const text = textMatch ? textMatch[1].trim() : '';
    if (!cls.includes('hover:bg') && !cls.includes('hover:text') && !cls.includes('hover:ring') && !cls.includes('hover:opacity') && !cls.includes('hover:border') && !cls.includes('hover:shadow')) {
      console.log('MISSING HOVER (' + text + '): ' + cls);
    }
  });
});
