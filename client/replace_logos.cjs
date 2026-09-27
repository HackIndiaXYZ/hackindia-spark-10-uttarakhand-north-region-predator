const fs = require('fs'); 
const files = ['./src/pages/MyRidesPage.jsx', './src/pages/Home.jsx', './src/pages/DriverPackages.jsx', './src/pages/DriverHistory.jsx', './src/pages/DriverDashboard.jsx', './src/pages/CustomerPools.jsx', './src/pages/CustomerPackages.jsx', './src/pages/CustomerDashboard.jsx', './src/pages/AuthPage.jsx', './src/pages/AdminDashboard.jsx']; 
files.forEach(f => { 
  let c = fs.readFileSync(f, 'utf8'); 
  c = c.replace(/className="size-10 object-contain drop-shadow-sm"/g, 'className="h-16 w-auto object-contain drop-shadow-sm"'); 
  c = c.replace(/className="size-14 object-contain drop-shadow-sm"/g, 'className="h-24 w-auto object-contain drop-shadow-sm"'); 
  fs.writeFileSync(f, c); 
}); 
console.log('Done');
