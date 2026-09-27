const fs = require('fs');
const path = require('path');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, filesList);
    } else if (name.endsWith('.jsx')) {
      filesList.push(name);
    }
  }
  return filesList;
}

const files = getFiles('src/pages');
for (const file of files) {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  const search1 = 'className="h-16 w-auto object-contain drop-shadow-sm"';
  const replace1 = 'className="h-14 w-14 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-primary/20"';
  
  if (content.includes(search1)) {
    content = content.replace(new RegExp(search1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace1);
    changed = true;
  }
  
  const search2 = 'className="h-24 w-auto object-contain drop-shadow-sm"';
  const replace2 = 'className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-primary/20"';
  
  if (content.includes(search2)) {
    content = content.replace(new RegExp(search2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace2);
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
}
