// scripts/concat-dscc.js
const fs = require('fs');
const path = require('path');

function findDsccMin() {
  try {
    // intenta resolver desde node_modules
    return require.resolve('@google/dscc/_bundles/dscc.min.js');
  } catch (e) {
    // fallback a path relativo (por si la estructura es diferente)
    const p = path.join(__dirname, '..', 'node_modules', '@google', 'dscc', 'dist', 'dscc.min.js');
    if (fs.existsSync(p)) return p;
    throw new Error('No encontré dscc.min.js. Instalá @google/dscc con npm.');
  }
}

try {
  const dsccPath = findDsccMin();
  const srcPath = path.join(__dirname, '..', 'src', 'index.js');
  const outDir = path.join(__dirname, '..', 'dist');
  const outPath = path.join(outDir, 'myViz.js');

  if (!fs.existsSync(srcPath)) {
    console.error('No existe src/index.js — pega ahí el código de la visualización primero.');
    process.exit(1);
  }

  const dsccCode = fs.readFileSync(dsccPath, 'utf8');
  const srcCode = fs.readFileSync(srcPath, 'utf8');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // concatenamos dscc + tu código y escribimos el bundle final
  fs.writeFileSync(outPath, dsccCode + '\n' + srcCode, 'utf8');
  console.log('Bundle creado en:', outPath);
} catch (err) {
  console.error('Error en el build:', err.message || err);
  process.exit(1);
}
