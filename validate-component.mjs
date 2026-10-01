#!/usr/bin/env node
/**
 * Validação Programática de Componentes Elementor Free — Pangolim Web Engine
 *
 * Exit codes:
 * 0 = PASS (válido)
 * 1 = FAIL (crítico - bloqueia entrega)
 * 2 = WARN (aviso - permite entrega com ressalvas)
 */

import fs from 'fs';
import path from 'path';

const COMPONENT_DIR = process.argv[2] || '.opp/components';

function findComponentJson(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const componentJson = path.join(fullPath, 'component.json');
      if (fs.existsSync(componentJson)) {
        return componentJson;
      }
      const nested = findComponentJson(fullPath);
      if (nested) return nested;
    }
  }
  return null;
}

function validateComponent(jsonPath) {
  const errors = [];
  const warnings = [];

  let content;
  try {
    content = fs.readFileSync(jsonPath, 'utf8');
  } catch (e) {
    return { errors: [`Cannot read ${jsonPath}: ${e.message}`], warnings: [] };
  }

  // BOM check
  if (content.charCodeAt(0) === 0xFEFF) {
    errors.push('File contains UTF-8 BOM (must be UTF-8 without BOM)');
  }

  // JSON parse check
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    return { errors: [`Invalid JSON: ${e.message}`], warnings: [] };
  }

  // UTF-8 well-formed check (mojibake patterns)
  const mojibakePatterns = [
    'Ã§', 'Ãµ', 'Ã£', 'Ã¡', 'Ã©', 'Ã³', 'Ã­', 'Ãº', 'Ã´', 'Ã¢',
    'Ãª', 'Ã¼', 'Ã±', 'Ã¶', 'Ã¤', 'Ã¼', 'Ã¥', 'Ã¦', 'Ã¸'
  ];
  for (const pattern of mojibakePatterns) {
    if (content.includes(pattern)) {
      errors.push(`Mojibake detected: "${pattern}" found in file`);
      break;
    }
  }

  // Traverse JSON to find widgets
  const widgets = [];
  function traverse(obj, parentKey = '') {
    if (!obj || typeof obj !== 'object') return;

    if (obj.widgetType) {
      widgets.push({ ...obj, parentKey });
    }

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        traverse(value, key);
      }
    }
  }
  traverse(data);

  // Validation: No HTML widget with inline HTML
  for (const widget of widgets) {
    if (widget.widgetType === 'html' || widget.widgetType === 'HTML') {
      const htmlContent = widget.settings?.html || widget.settings?.content;
      if (htmlContent && typeof htmlContent === 'string' && htmlContent.trim().length > 0) {
        errors.push(`Widget HTML com HTML inline detectado: "${htmlContent.substring(0, 100)}..."`);
      }
    }

    // text-editor with substantial HTML (likely inline structure)
    if (widget.widgetType === 'text-editor' || widget.widgetType === 'text_editor') {
      const editorContent = widget.settings?.editor || widget.settings?.content;
      if (editorContent && typeof editorContent === 'string') {
        const tagCount = (editorContent.match(/<\/?[a-z][\s\S]*>/gi) || []).length;
        if (tagCount > 3) { // More than basic formatting tags
          warnings.push(`text-editor com HTML estrutural suspeito (${tagCount} tags). Preferir widgets nativos.`);
        }
      }
    }
  }

  // Validation: Minimum 2 native widgets
  const nativeWidgetTypes = ['heading', 'text', 'text-editor', 'button', 'image', 'icon', 'spacer', 'divider', 'text_editor'];
  const nativeWidgets = widgets.filter(w => nativeWidgetTypes.includes(w.widgetType?.toLowerCase()));
  if (nativeWidgets.length < 2) {
    errors.push(`Componente deve ter pelo menos 2 widgets nativos. Encontrados: ${nativeWidgets.length} (${nativeWidgets.map(w => w.widgetType).join(', ')})`);
  }

  // Validation: content_width as string enum
  function checkContentWidth(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    if (obj.content_width !== undefined) {
      if (typeof obj.content_width !== 'string' || !['full', 'boxed'].includes(obj.content_width)) {
        errors.push(`content_width deve ser string "full" ou "boxed" em ${path}: ${JSON.stringify(obj.content_width)}`);
      }
    }
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        checkContentWidth(value, `${path}.${key}`);
      }
    }
  }
  checkContentWidth(data);

  // Validation: No _css_classes on containers
  function checkCssClasses(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    if (obj._css_classes && (path.includes('container') || path.includes('e-con'))) {
      warnings.push(`_css_classes definido em container (ignorado pelo Elementor Free): ${path}`);
    }
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        checkCssClasses(value, `${path}.${key}`);
      }
    }
  }
  checkCssClasses(data);

  return { errors, warnings };
}

function main() {
  const componentJson = findComponentJson(COMPONENT_DIR);

  if (!componentJson) {
    console.error('FAIL: No component.json found in', COMPONENT_DIR);
    process.exit(1);
  }

  console.log(`Validating: ${componentJson}`);
  const { errors, warnings } = validateComponent(componentJson);

  if (errors.length > 0) {
    console.error('\n❌ ERROS CRÍTICOS:');
    errors.forEach(e => console.error(`  - ${e}`));
    console.error('\nExit code: 1 (FAIL)');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  AVISOS:');
    warnings.forEach(w => console.warn(`  - ${w}`));
    console.warn('\nExit code: 2 (WARN)');
    process.exit(2);
  }

  console.log('\n✅ PASS: Componente válido');
  process.exit(0);
}

main();