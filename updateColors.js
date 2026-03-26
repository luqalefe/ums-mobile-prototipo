const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.js') || file.endsWith('.json')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

const map = [
  { p: /#1351B4/gi, r: '#1351B4' },  // Azul Primário
  { p: /#071D41/gi, r: '#071D41' },  // Azul Escuro
  { p: /#071D41/gi, r: '#071D41' },  // Azul Escuro
  { p: /#071D41/gi, r: '#071D41' },  // Azul Escuro
  { p: /#FFCD07/gi, r: '#FFCD07' },  // Amarelo
  { p: /#168821/gi, r: '#168821' },  // Verde
  { p: /#E52207/gi, r: '#E52207' },  // Vermelho
  { p: /#E52207/gi, r: '#E52207' },  // Vermelho
];

walk('.', (err, files) => {
  files.forEach(file => {
    if (file.includes('node_modules') || file.includes('.git') || file.includes('assets')) return;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    map.forEach(m => {
      if (m.p.test(content)) {
        content = content.replace(m.p, m.r);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  });
});
