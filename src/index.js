// src/index.js
(function () {
  // CONFIG: cambia aquí si querés otro título por defecto o sufijo
  const DEFAULT_TITLE = 'INDICADORES PROVINCIALES EDUCATIVOS: SECUNDARIO';
  const SUFFIX = ''; // si querés que siempre muestre ": SECUNDARIO" pon ': SECUNDARIO' aquí

  // util: extrae valor "presentable" de una celda
  function readCellValue(cell) {
    if (cell === null || cell === undefined) return '';
    // dscc.objectTransform cell often as [value, formattedValue]
    if (Array.isArray(cell)) {
      // prefer formatted string if provided
      if (cell.length > 1 && cell[1] !== undefined && cell[1] !== null && String(cell[1]).trim() !== '') {
        return String(cell[1]).trim();
      }
      if (cell[0] !== undefined && cell[0] !== null) return String(cell[0]).trim();
      return '';
    }
    // fallback if primitive
    return String(cell).trim();
  }

  function renderTitle(container, title) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.padding = '12px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.background = '#ffffff';

    const h2 = document.createElement('h2');
    h2.style.margin = '0';
    h2.style.fontSize = '24px';
    h2.style.lineHeight = '1.1';
    h2.style.color = '#0f172a';
    h2.style.fontWeight = '700';
    h2.style.fontFamily = "'Montserrat', sans-serif";

    h2.textContent = title;
    wrapper.appendChild(h2);
    container.appendChild(wrapper);
  }

  function choosePrimaryKey(fields, table) {
    // Prefer a column whose field.role == 'DIMENSION' (case-insensitive)
    // fields is an object mapping keys -> {name,label,role,...}
    if (fields && Object.keys(fields).length) {
      const keys = Object.keys(fields);
      // try explicit DIMENSION
      for (const k of keys) {
        const f = fields[k] || {};
        if (f.role && String(f.role).toUpperCase() === 'DIMENSION') return k;
      }
      // otherwise, fallback to first field
      return keys[0];
    }
    // if no fields meta, fallback to first column key of first row
    if (table && table.length && Object.keys(table[0]).length) {
      return Object.keys(table[0])[0];
    }
    return null;
  }

  function drawViz(data) {
    // create root container if missing
    const container = document.getElementById('viz-root') || (function () {
      const d = document.createElement('div');
      d.id = 'viz-root';
      d.style.width = '100%';
      d.style.height = '100%';
      document.body.appendChild(d);
      // load Montserrat once
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return d;
    })();

    try {
      const table = (data && data.tables && data.tables.DEFAULT) ? data.tables.DEFAULT : [];
      const fields = (data && data.fields) ? data.fields : {};

      if (!table || !table.length) {
        renderTitle(container, DEFAULT_TITLE);
        return;
      }

      const primaryKey = choosePrimaryKey(fields, table);
      if (!primaryKey) {
        renderTitle(container, DEFAULT_TITLE);
        return;
      }

      // Collect values from the selected primary column
      const values = table.map(row => {
        const cell = row[primaryKey];
        return readCellValue(cell);
      }).filter(v => v !== '');

      // uniques
      const uniques = Array.from(new Set(values));

      if (uniques.length === 1) {
        const finalText = SUFFIX ? (uniques[0] + SUFFIX) : uniques[0];
        renderTitle(container, String(finalText));
      } else {
        renderTitle(container, DEFAULT_TITLE);
      }
    } catch (err) {
      console.error('drawViz error:', err);
      renderTitle(container, DEFAULT_TITLE);
    }
  }

  // subscribe using dscc.objectTransform (robust)
  if (typeof dscc !== 'undefined' && dscc.subscribeToData) {
    dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
  } else {
    // debug fallback
    window.addEventListener('load', function () {
      const p = document.createElement('div');
      p.style.padding = '10px';
      p.style.color = '#666';
      p.textContent = 'dscc no cargado — carga el componente en Looker Studio para probar.';
      document.body.appendChild(p);
      // show default
      const d = document.createElement('div');
      document.body.appendChild(d);
      renderTitle(d, DEFAULT_TITLE);
    });
  }
})();
