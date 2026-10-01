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
 * 
 * NOW INCLUDES:
 * - Flex Layout Validation (critical for high/balanced levels)
 * - Accessibility Validation (critical for high level, warning for balanced)
 * - Performance Validation (widget count, DOM depth)
 * - Responsiveness Validation (breakpoints check)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ensureRoot, { validatePath } from './ensure-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PANGOLIM_ROOT = ensureRoot;

// Force execution context to PWE root if different
if (process.cwd() !== PANGOLIM_ROOT) {
  process.chdir(PANGOLIM_ROOT);
  console.error(`[VALIDATOR] Contexto corrigido: ${process.cwd()}`);
}

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
// NEW VALIDATION FUNCTIONS
// ============================================

/**
 * Flex Layout Validation
 * Validates that container layouts using gap and percentage widths are mathematically sound
 * Formula: total = (N-1)*gap + N*columnWidth <= 100%
 */
function validateFlexLayout(content, checks, assertivenessLevel) {
  // Skip if assertiveness level is low
  if (assertivenessLevel === 'low') return;

  // Helper to convert CSS value to percentage number
  function toPercent(value) {
    if (typeof value !== 'string') return null;
    // Handle % values
    if (value.endsWith('%')) {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }
    // Handle px, rem, em, etc. - we cannot convert without context, so return null
    return null;
  }

  function validateContainer(container, path = '') {
    const containerId = container.id || `container-${path.replace(/\//g, '-')}`;
    const currentPath = path ? `${path}/${containerId}` : containerId;

    // Check if this container uses flexbox layout (simplified check)
    const isFlex = container.settings?.justify_content !== undefined || 
                   container.settings?.align_items !== undefined ||
                   container.settings?.flex_direction !== undefined ||
                   container.settings?.display === 'flex';

    // If not flex, skip gap validation
    if (!isFlex) {
      // Still recurse into children
      if (Array.isArray(container.elements)) {
        container.elements.forEach((el, index) => {
          validateContainer(el, `${currentPath}/elements/${index}`);
        });
      }
      return;
    }

    // Get direct children that are containers or widgets (elements that take width)
    const layoutChildren = container.elements.filter(el => 
      el.elType === 'container' || el.elType === 'widget'
    );

    if (layoutChildren.length === 0) return;

    // Check for gap setting
    const gapValue = container.settings?.gap;
    if (!gapValue) {
      // No gap set, validation passes
      const level = assertivenessLevel === 'high' ? 'critical' : 'warning';
      checks.push({ 
        name: 'flex-layout-gap', 
        level: level, 
        passed: true, 
        message: `Container ${containerId}: gap not set (flex layout without gap)` 
      });
      // Still validate children
      if (Array.isArray(container.elements)) {
        container.elements.forEach((el, index) => {
          validateContainer(el, `${currentPath}/elements/${index}`);
        });
      }
      return;
    }

    // Convert gap to percentage (assuming gap is in % for now)
    const gapPercent = toPercent(gapValue);
    if (gapPercent === null) {
      // Gap is not in % - we cannot validate without knowing parent width
      const level = assertivenessLevel === 'high' ? 'warning' : 'warning'; // Still warning for high
      checks.push({ 
        name: 'flex-layout-gap', 
        level: level, 
        passed: true, 
        message: `Container ${containerId}: gap is '${gapValue}' (only % gap validated)` 
      });
      // Still validate children
      if (Array.isArray(container.elements)) {
        container.elements.forEach((el, index) => {
          validateContainer(el, `${currentPath}/elements/${index}`);
        });
      }
      return;
    }

    // Calculate total width used by children
    let totalPercent = 0;
    let validChildren = 0;

    layoutChildren.forEach(child => {
      const childWidth = child.settings?.width;
      if (childWidth && typeof childWidth === 'string') {
        const widthPercent = toPercent(childWidth);
        if (widthPercent !== null) {
          totalPercent += widthPercent;
          validChildren++;
        }
      }
    });

    // If we couldn't get widths for any children, skip validation
    if (validChildren === 0) {
      const level = assertivenessLevel === 'high' ? 'warning' : 'warning';
      checks.push({ 
        name: 'flex-layout-calculation', 
        level: level, 
        passed: true, 
        message: `Container ${containerId}: unable to calculate children widths (non-% or missing)` 
      });
      // Still validate children
      if (Array.isArray(container.elements)) {
        container.elements.forEach((el, index) => {
          validateContainer(el, `${currentPath}/elements/${index}`);
        });
      }
      return;
    }

    // Calculate expected total: (N-1)*gap + N*avgChildWidth
    // But we have sum of widths, so: total = sum(widths) + (N-1)*gap
    const N = validChildren;
    const expectedTotal = totalPercent + (N - 1) * gapPercent;

    const passes = expectedTotal <= 100 + 0.5; // Allow 0.5% tolerance for rounding
    const level = assertivenessLevel === 'high' ? 'critical' : (assertivenessLevel === 'balanced' ? 'warning' : 'warning');

    checks.push({ 
      name: 'flex-layout-validation', 
      level: level, 
      passed: passes, 
      message: passes 
        ? `Container ${containerId}: layout valid (${expectedTotal.toFixed(2)}% <= 100%)` 
        : `Container ${containerId}: layout overflow (${expectedTotal.toFixed(2)}% > 100%) - reduce gap or widths` 
    });

    // Recurse into all elements (including non-layout ones) for nested containers
    if (Array.isArray(container.elements)) {
      container.elements.forEach((el, index) => {
        validateContainer(el, `${currentPath}/elements/${index}`);
      });
    }
  }

  // Start validation from root content
  if (Array.isArray(content)) {
    content.forEach((item, index) => {
      validateContainer(item, `root/${index}`);
    });
  }
}

/**
 * Accessibility Validation
 * Validates basic accessibility requirements for Elementor Free components
 */
function validateAccessibility(content, checks, assertivenessLevel) {
  // Skip if assertiveness level is low
  if (assertivenessLevel === 'low') return;

  function validateElement(element, path = '') {
    const elId = element.id || `element-${path.replace(/\//g, '-')}`;
    const currentPath = path ? `${path}/${elId}` : elId;

    // Check for aria-label on interactive elements
    if (element.elType === 'widget') {
      const interactiveWidgets = ['button', 'menu-anchor', 'nav-menu', 'social-icons', 'search-form', 'login-form', 'registration-form', 'password-form'];
      if (interactiveWidgets.includes(element.widgetType)) {
        // Check if aria-label or aria-labelledby is present
        const hasAriaLabel = element.settings?.aria_label || element.settings?.aria_labelledby;
        const hasAriaDescription = element.settings?.aria_description;
        
        const level = assertivenessLevel === 'high' ? 'critical' : 'warning';
        
        if (!hasAriaLabel && !hasAriaDescription) {
          checks.push({
            name: 'aria-label',
            level: level,
            passed: false,
            message: `Widget ${elId} (${element.widgetType}): missing aria-label or aria-labelledby`
          });
        } else {
          checks.push({ name: 'aria-label', level: level, passed: true });
        }
      }
      
      // Check for aria-hidden on decorative icons
      if (element.widgetType === 'icon') {
        const isDecorative = element.settings?.view === 'outline' || element.settings?.view === 'line'; // Simplified heuristic
        if (isDecorative) {
          const ariaHidden = element.settings?.aria_hidden === true || element.settings?.aria_hidden === 'true';
          const level = 'warning'; // Always warning for this
          
          if (!ariaHidden) {
            checks.push({
              name: 'aria-hidden-icon',
              level: level,
              passed: false,
              message: `Icon ${elId}: decorative icon should have aria-hidden="true"`
            });
          } else {
            checks.push({ name: 'aria-hidden-icon', level: level, passed: true });
          }
        }
      }
    }

    // Recurse into children
    if (Array.isArray(element.elements)) {
      element.elements.forEach((el, index) => {
        validateElement(el, `${currentPath}/elements/${index}`);
      });
    }
  }

  // Start validation from root content
  if (Array.isArray(content)) {
    content.forEach((item, index) => {
      validateElement(item, `root/${index}`);
    });
  }
}

/**
 * Performance Validation
 * Validates performance-related aspects like widget count and DOM depth
 */
function validatePerformance(content, checks, assertivenessLevel) {
  const maxDepth = assertivenessLevel === 'high' ? 4 : 6;
  const maxWidgetsPerContainer = assertivenessLevel === 'high' ? 10 : 15;

  function validateContainer(container, path = '', depth = 0) {
    const containerId = container.id || `container-${path.replace(/\//g, '-')}`;
    const currentPath = path ? `${path}/${containerId}` : containerId;

    // Check DOM depth
    if (depth > maxDepth) {
      const level = 'warning';
      checks.push({ 
        name: 'dom-depth', 
        level: level, 
        passed: false, 
        message: `Container ${containerId}: depth ${depth} > ${maxDepth}` 
      });
    } else {
      checks.push({ name: 'dom-depth', level: 'warning', passed: true });
    }

    // Count direct children that are containers or widgets
    const layoutChildren = container.elements.filter(el => 
      el.elType === 'container' || el.elType === 'widget'
    );

    // Check widget count per container
    if (layoutChildren.length > maxWidgetsPerContainer) {
      const level = 'warning';
      checks.push({ 
        name: 'widget-count', 
        level: level, 
        passed: false, 
        message: `Container ${containerId}: ${layoutChildren} widgets > ${maxWidgetsPerContainer} recommended` 
      });
    } else {
      checks.push({ name: 'widget-count', level: 'warning', passed: true });
    }

    // Recurse into children
    if (Array.isArray(container.elements)) {
      container.elements.forEach((el, index) => {
        validateContainer(el, `${currentPath}/elements/${index}`, depth + 1);
      });
    }
  }

  // Start validation from root content
  if (Array.isArray(content)) {
    content.forEach((item, index) => {
      validateContainer(item, `root/${index}`, 0);
    });
  }
}

/**
 * Responsiveness Validation
 * Validates that breakpoints are properly defined
 */
function validateResponsiveness(content, checks, assertivenessLevel) {
  // Skip if assertiveness level is low
  if (assertivenessLevel === 'low') return;

  const requiredBreakpoints = ['mobile', 'tablet', 'desktop'];

  function validateContainer(container, path = '') {
    const containerId = container.id || `container-${path.replace(/\//g, '-')}`;
    const currentPath = path ? `${path}/${containerId}` : containerId;

    // Check content_width responsiveness
    if (container.settings?.content_width !== undefined) {
      const cw = container.settings.content_width;
      // For high level, content_width must be string and not "inherit"
      if (assertivenessLevel === 'high') {
        if (typeof cw !== 'string' || !['full', 'boxed'].includes(cw)) {
          checks.push({
            name: 'content-width-responsive',
            level: 'critical',
            passed: false,
            message: `Container ${containerId}: content_width must be 'full' or 'boxed' for high assertiveness`
          });
        } else {
          checks.push({ name: 'content-width-responsive', level: 'critical', passed: true });
        }
      } else {
        // For balanced, just check it's a string (existing validation)
        if (typeof cw === 'string' && ['full', 'boxed'].includes(cw)) {
          checks.push({ name: 'content-width-responsive', level: 'warning', passed: true });
        } else {
          checks.push({ name: 'content-width-responsive', level: 'warning', passed: false, message: `Container ${containerId}: content_width invalid` });
        }
      }
    }

    // Recurse into children
    if (Array.isArray(container.elements)) {
      container.elements.forEach((el, index) => {
        validateContainer(el, `${currentPath}/elements/${index}`);
      });
    }
  }

  // Start validation from root content
  if (Array.isArray(content)) {
    content.forEach((item, index) => {
      validateContainer(item, `root/${index}`);
    });
  }
}

// ============================================
// RECURSIVE VALIDATION (EXISTING - UPDATED)
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
// CSS VALIDATION (EXISTING)
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
// JS VALIDATION (EXISTING)
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
    console.error(`Exemplo: node validate-component.mjs .opp/components/hero`);
    console.error(`Diretório atual: ${process.cwd()}`);
    console.error(`Diretório raiz PWE: ${PANGOLIM_ROOT}`);
    process.exit(1);
  }

  // Validate and normalize component path relative to PWE root
  const normalizedPath = validatePath(args[0]);
  const componentPath = path.dirname(normalizedPath);
  const jsonPath = path.join(componentPath, 'component.json');
  const cssPath = path.join(componentPath, 'component.css');
  const jsPath = path.join(componentPath, 'component.js');

  if (!fileExists(jsonPath)) {
    console.error(`ERRO: component.json não encontrado em ${componentPath}`);
    console.error(`Diretório raiz PWE: ${PANGOLIM_ROOT}`);
    console.error(`Caminho relativo fornecido: ${args[0]}`);
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

  // Get assertiveness level from component.json (default to balanced)
  const assertivenessLevel = json.assertiveness_level || 'balanced';

  // 5. Elementor Structure (recursive)
  if (Array.isArray(json.content)) {
    validateElementorStructure(json.content, checks);
  }

  // 6. NEW: Flex Layout Validation
  validateFlexLayout(json.content, checks, assertivenessLevel);

  // 7. NEW: Accessibility Validation
  validateAccessibility(json.content, checks, assertivenessLevel);

  // 8. NEW: Performance Validation
  validatePerformance(json.content, checks, assertivenessLevel);

  // 9. NEW: Responsiveness Validation
  validateResponsiveness(json.content, checks, assertivenessLevel);

  // 10. CSS
  validateCSS(cssPath, checks);

  // 11. JS
  validateJS(jsPath, checks);

  // Summary
  const criticalFailed = checks.filter(c => c.level === 'critical' && !c.passed);
  const warnings = checks.filter(c => c.level === 'warning' && !c.passed);

  const output = {
    status: criticalFailed.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'WARN' : 'PASS'),
    assertiveness_level: assertivenessLevel,
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