#!/usr/bin/env node
/**
 * validate-component.mjs
 * Validação programática de componentes Elementor Free
 * 
 * Uso: node validate-component.mjs <caminho-do-componente>
 * Exemplo: node validate-component.mjs .opp/components/hero
 * 
 * Exit codes:
 *   0 = PASS (todos critical passam)
 *   1 = FAIL (pelo menos 1 critical falhou)
 *   2 = WARN (apenas warnings)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// CONFIG
// ============================================
const ALLOWED_WIDGETS = new Set([
  'heading', 'text-editor', 'image', 'video', 'button', 'divider', 'spacer',
  'icon', 'google-maps', 'icon-box', 'image-box', 'star-rating', 'social-icons',
  'progress-bar', 'soundcloud', 'shortcode', 'html', 'menu-anchor', 'sidebar',
  'alert', 'accordion', 'tabs', 'toggle', 'counter', 'progress', 'pie-chart',
  'chart', 'testimonial', 'team-member', 'portfolio', 'posts', 'archive-posts',
  'search-form', 'login-form', 'registration-form', 'password-form',
  'navigation-menu', 'nav-menu', 'page-title', 'site-logo', 'site-title',
  'site-tagline', 'breadcrumbs', 'post-title', 'post-excerpt', 'post-content',
  'post-date', 'post-author', 'post-comments', 'post-navigation', 'post-tags',
  'post-categories', 'post-featured-image', 'loop-grid', 'loop-carousel',
  'loop-slider', 'template', 'container', 'flexbox', 'grid'
]);

const COLOR_PROPS = [
  'background_color', 'text_color', 'border_color', 'color',
  'box_shadow_color', 'gradient_color_1', 'gradient_color_2',
  'background_gradient_color', 'border_color_tablet', 'border_color_mobile'
];

const WHATSAPP_COLORS = new Set(['#25D366', '#20BD5A', 'var(--pwe-azul-waldorf)', 'var(--pwe-verde-floresta)']);
const HEX_REGEX = /#[0-9a-fA-F]{3,8}/g;
const MOJIBAKE_REGEX = /Ã§|Ãµ|Ã£|Ã¡|Ã©|Ã³|Ã­|Ãº|Ã´|Ã¢|Ãª|Ã¼|Ã±/g;
const PWE_VAR_REGEX = /var\(--pwe-[^)]+\)/g;

// ============================================
// UTILS
// ============================================
function readFile(p) { return fs.readFileSync(p, 'utf8'); }
function fileExists(p) { return fs.existsSync(p); }

function checkBOM(filepath) {
  const buffer = fs.readFileSync(filepath);
  return !(buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF);
}

function checkJSONParse(filepath) {
  try {
    JSON.parse(readFile(filepath));
    return true;
  } catch {
    return false;
  }
}

function checkUTF8(filepath) {
  const content = readFile(filepath);
  return !content.includes('\uFFFD') && !MOJIBAKE_REGEX.test(content);
}

function checkSchema(json) {
  return !!(json.version && json.title && json.type && Array.isArray(json.content));
}

// ============================================
// RECURSIVE VALIDATION
// ============================================
function validateElementorStructure(content, checks, depth = 0) {
  const maxDepth = 6;
  if (depth > maxDepth) {
    checks.push({ name: 'dom-depth', level: 'warning', passed: false, message: `Profundidade ${depth} > ${maxDepth}` });
  }

  for (const item of content) {
    // content_width check
    if (item.settings?.content_width !== undefined) {
      const cw = item.settings.content_width;
      if (typeof cw !== 'string' || !['full', 'boxed'].includes(cw)) {
        checks.push({
          name: 'content-width',
          level: 'critical',
          passed: false,
          message: `Container ${item.id}: content_width inválido (${JSON.stringify(cw)})`
        });
      } else {
        checks.push({ name: 'content-width', level: 'critical', passed: true });
      }
    }

    // _css_classes em container check
    if (item.elType === 'container' && item.settings?._css_classes) {
      checks.push({
        name: 'container-css-classes',
        level: 'critical',
        passed: false,
        message: `Container ${item.id}: _css_classes definido (ignorado pelo Elementor Free)`
      });
    } else if (item.elType === 'container') {
      checks.push({ name: 'container-css-classes', level: 'critical', passed: true });
    }

    // Widget type check
    if (item.elType === 'widget' && item.widgetType) {
      if (!ALLOWED_WIDGETS.has(item.widgetType)) {
        checks.push({
          name: 'widgets-free',
          level: 'critical',
          passed: false,
          message: `Widget ${item.id}: ${item.widgetType} não existe no Elementor Free`
        });
      } else {
        checks.push({ name: 'widgets-free', level: 'critical', passed: true });
      }
    }

    // Color hardcode check in settings
    if (item.settings) {
      for (const prop of COLOR_PROPS) {
        const value = item.settings[prop];
        if (value && typeof value === 'string') {
          if (HEX_REGEX.test(value) && !WHATSAPP_COLORS.has(value) && !PWE_VAR_REGEX.test(value)) {
            checks.push({
              name: 'ds-colors',
              level: 'critical',
              passed: false,
              message: `${item.id}.${prop}: cor hardcoded "${value}" (use var(--pwe-*))`
            });
          } else {
            checks.push({ name: 'ds-colors', level: 'critical', passed: true });
          }
        }
      }
    }

    // Recurse into elements
    if (Array.isArray(item.elements)) {
      validateElementorStructure(item.elements, checks, depth + 1);
    }
  }
}

// ============================================
// CSS VALIDATION
// ============================================
function validateCSS(cssPath, checks) {
  if (!fileExists(cssPath)) return;

  const content = readFile(cssPath);
  const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;

  if (sizeKB > 5) {
    checks.push({ name: 'css-size', level: 'warning', passed: false, message: `${sizeKB.toFixed(1)}KB > 5KB` });
  } else {
    checks.push({ name: 'css-size', level: 'warning', passed: true, message: `${sizeKB.toFixed(1)}KB` });
  }

  // Check !important usage (warning unless explicitly allowed)
  const importantMatches = content.match(/!important/g) || [];
  if (importantMatches.length > 3) {
    checks.push({
      name: 'css-important-excess',
      level: 'warning',
      passed: false,
      message: `Uso excessivo de !important (${importantMatches.length} ocorrências)`
    });
  }

  // Hardcode color check in CSS
  const cssHexMatches = content.match(HEX_REGEX) || [];
  const hardcoded = cssHexMatches.filter(c => !WHATSAPP_COLORS.has(c) && !PWE_VAR_REGEX.test(c));
  if (hardcoded.length > 0) {
    checks.push({
      name: 'ds-colors',
      level: 'critical',
      passed: false,
      message: `CSS: cores hardcoded ${[...new Set(hardcoded)].join(', ')}`
    });
  }
}

// ============================================
// JS VALIDATION
// ============================================
function validateJS(jsPath, checks) {
  if (!fileExists(jsPath)) return;

  const content = readFile(jsPath);

  // IIFE check
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('(function') && !trimmed.startsWith('(() =>') && !trimmed.startsWith('(async function')) {
    checks.push({ name: 'js-isolation', level: 'critical', passed: false, message: 'JS não isolado (IIFE/module esperado)' });
  } else {
    checks.push({ name: 'js-isolation', level: 'critical', passed: true });
  }

  // External dependencies
  if (/require\(|import\s+|import\(|jQuery|\$\s*\(/.test(content)) {
    checks.push({ name: 'js-dependencies', level: 'critical', passed: false, message: 'Dependência externa detectada (require/import/jQuery/$)' });
  } else {
    checks.push({ name: 'js-dependencies', level: 'critical', passed: true });
  }
}

// ============================================
// MAIN
// ============================================
function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Uso: node validate-component.mjs <caminho-do-componente>');
    process.exit(1);
  }

  const componentPath = path.resolve(args[0]);
  const jsonPath = path.join(componentPath, 'component.json');
  const cssPath = path.join(componentPath, 'component.css');
  const jsPath = path.join(componentPath, 'component.js');

  if (!fileExists(jsonPath)) {
    console.error(`ERRO: component.json não encontrado em ${componentPath}`);
    process.exit(1);
  }

  const checks = [];

  // 1. BOM
  checks.push({ name: 'bom', level: 'critical', passed: checkBOM(jsonPath) });

  // 2. JSON Parse
  checks.push({ name: 'json-parse', level: 'critical', passed: checkJSONParse(jsonPath) });

  // 3. UTF-8
  checks.push({ name: 'utf8', level: 'critical', passed: checkUTF8(jsonPath) });

  // Parse JSON for further checks
  const json = JSON.parse(readFile(jsonPath));

  // 4. Schema
  checks.push({ name: 'schema', level: 'critical', passed: checkSchema(json) });

  // 5. Elementor Structure (recursive)
  if (Array.isArray(json.content)) {
    validateElementorStructure(json.content, checks);
  }

  // 6. CSS
  validateCSS(cssPath, checks);

  // 7. JS
  validateJS(jsPath, checks);

  // Summary
  const criticalFailed = checks.filter(c => c.level === 'critical' && !c.passed);
  const warnings = checks.filter(c => c.level === 'warning' && !c.passed);

  const output = {
    status: criticalFailed.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'WARN' : 'PASS'),
    checks,
    summary: {
      critical_passed: checks.filter(c => c.level === 'critical' && c.passed).length,
      critical_failed: criticalFailed.length,
      warnings: warnings.length
    }
  };

  console.log(JSON.stringify(output, null, 2));

  if (criticalFailed.length > 0) process.exit(1);
  if (warnings.length > 0) process.exit(2);
  process.exit(0);
}

main();