/**
 * Script de Build CSS
 * Consolida todos os módulos CSS em um único arquivo para produção
 * 
 * Uso: node build-css.js
 */

const fs = require('fs');
const path = require('path');

// Ordem de importação (respeita dependências)
const cssModules = [
  'modules/base/_variables.css',
  'modules/base/_reset.css',
  'modules/base/_accessibility.css',
  'modules/layout/_grid.css',
  'modules/layout/_sidebar.css',
  'modules/layout/_topbar.css',
  'modules/components/_buttons.css',
  'modules/components/_cards.css',
  'modules/components/_table.css',
  'modules/components/_chart.css',
  'modules/components/_modal.css',
  'modules/components/_notifications.css',
  'modules/components/_pagination.css',
  'modules/components/_toast.css',
  'modules/components/_extras.css',
  'modules/pages/_dashboard.css',
  'modules/themes/_dark.css',
  'modules/responsive/_tablet.css',
  'modules/responsive/_mobile.css',
  'modules/utils/_skip-link.css'
];

const outputPath = 'style.css';
let output = `/* ==========================================================================
   ADMIN DASHBOARD - STYLESHEET CONSOLIDADO
   Gerado automaticamente por build-css.js - NÃO EDITAR MANUALMENTE
   Para modificar, edite os arquivos em css/modules/
   ========================================================================== */

`;

cssModules.forEach(module => {
  const filePath = path.join(__dirname, module);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    output += `\n/* ===== ${module.toUpperCase()} ===== */\n\n`;
    output += content + '\n\n';
    console.log(`✓ ${module}`);
  } else {
    console.warn(` Arquivo não encontrado: ${module}`);
  }
});

fs.writeFileSync(path.join(__dirname, outputPath), output, 'utf8');
console.log(`\n✓ CSS consolidado em ${outputPath} (${(output.length / 1024).toFixed(2)} KB)`);
