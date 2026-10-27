#!/usr/bin/env node
/**
 * Validates a generated Hello Elementor child theme without modifying it.
 * Usage: node .opencode/skills/pwe-validate-theme/validate-theme.mjs .opp/themes/<slug>
 * Exit codes: 0 = PASS, 1 = critical failure, 2 = warnings only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { TextDecoder } from 'node:util';
import config from '../../config.mjs';

const ROOT = fs.realpathSync(config.root);
const THEMES_ROOT = path.join(ROOT, '.opp', 'themes');
const checks = [];

function addCheck(name, level, passed, message) {
  checks.push({ name, level, passed, message });
}

function isInside(parent, target) {
  const relative = path.relative(parent, target);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

function resolveThemeDirectory(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new Error('Informe o caminho da pasta do tema.');
  }

  const resolved = path.resolve(ROOT, input);
  const relative = path.relative(THEMES_ROOT, resolved);
  if (!relative || !isInside(THEMES_ROOT, resolved) || relative.includes(path.sep) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(relative)) {
    throw new Error('O caminho precisa apontar para uma única pasta slug dentro de .opp/themes/.');
  }

  for (const directory of [path.join(ROOT, '.opp'), THEMES_ROOT, resolved]) {
    let stat;
    try {
      stat = fs.lstatSync(directory);
    } catch {
      throw new Error(`Diretório não encontrado: ${path.relative(ROOT, directory)}.`);
    }
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error(`Diretório inválido ou link simbólico não permitido: ${path.relative(ROOT, directory)}.`);
    }
  }

  const realDirectory = fs.realpathSync(resolved);
  const realThemesRoot = fs.realpathSync(THEMES_ROOT);
  if (!isInside(ROOT, realDirectory) || !isInside(realThemesRoot, realDirectory) || path.dirname(realDirectory) !== realThemesRoot) {
    throw new Error('A pasta do tema resolve para fora de .opp/themes/.');
  }

  return realDirectory;
}

function readThemeFile(themeDirectory, filename) {
  const filepath = path.join(themeDirectory, filename);
  let stat;
  try {
    stat = fs.lstatSync(filepath);
  } catch {
    return { exists: false, text: '', buffer: null, error: `${filename} não encontrado.` };
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    return { exists: false, text: '', buffer: null, error: `${filename} precisa ser um arquivo regular, sem link simbólico.` };
  }

  const buffer = fs.readFileSync(filepath);
  try {
    return { exists: true, text: new TextDecoder('utf-8', { fatal: true }).decode(buffer), buffer, error: null };
  } catch {
    return { exists: true, text: '', buffer, error: `${filename} não contém UTF-8 válido.` };
  }
}

function extractRootBlocks(css) {
  const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const tokenNames = new Set();
  const rootPattern = /:root\s*\{([^{}]*)\}/gi;
  let rootCount = 0;
  const outsideRoot = cleanCss.replace(rootPattern, (_whole, body) => {
    rootCount += 1;
    for (const match of body.matchAll(/(--pwe-[a-z0-9_-]+)\s*:/gi)) tokenNames.add(match[1]);
    return ' '.repeat(_whole.length);
  });
  return { rootCount, tokenNames, outsideRoot };
}

function containsHardcodedColorOutsideRoot(css) {
  const { outsideRoot } = extractRootBlocks(css);
  const hexColor = /#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})(?![0-9a-f])/i;
  const declarations = outsideRoot.matchAll(/(?:^|[;{}])\s*([\w-]+\s*:\s*[^;{}]*)/g);
  for (const declaration of declarations) {
    const value = declaration[1].slice(declaration[1].indexOf(':') + 1);
    if (hexColor.test(value)) return true;
  }
  return false;
}

function checkPhpSyntax(filepath) {
  const result = spawnSync('php', ['-l', filepath], {
    encoding: 'utf8',
    timeout: 15000,
    windowsHide: true,
  });
  if (result.error?.code === 'ENOENT') return { passed: false, message: 'PHP CLI não está instalado; não foi possível confirmar a sintaxe.' };
  if (result.error) return { passed: false, message: `Não foi possível executar php -l: ${result.error.message}` };
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  return result.status === 0
    ? { passed: true, message: output || 'Sintaxe PHP válida.' }
    : { passed: false, message: output || `php -l terminou com código ${result.status}.` };
}

function checkEnqueue(php) {
  const calls = [...php.matchAll(/wp_enqueue_style\s*\(([\s\S]*?)\);/g)].map((match) => match[1]);
  const parentCall = calls.find((call) => /get_template_directory_uri\s*\(\s*\)/.test(call));
  const childCall = calls.find((call) => /get_stylesheet_directory_uri\s*\(\s*\)/.test(call));
  if (!parentCall || !childCall) {
    return { passed: false, message: 'É necessário enfileirar o style.css do tema pai e do tema filho.' };
  }

  const parentHandle = parentCall.match(/^\s*['"]([^'"]+)['"]\s*,/);
  if (!parentHandle) return { passed: false, message: 'Não foi possível identificar o handle do stylesheet pai.' };
  const escapedHandle = parentHandle[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const dependency = new RegExp(`(?:array\\s*\\(\\s*['"]${escapedHandle}['"]\\s*\\)|\\[\\s*['"]${escapedHandle}['"]\\s*\\])`);
  if (!dependency.test(childCall)) {
    return { passed: false, message: 'O stylesheet filho precisa declarar o handle do stylesheet pai como dependência.' };
  }
  return { passed: true, message: 'Os stylesheets pai e filho estão enfileirados com dependência pai → filho.' };
}

function emit(status, exitCode, error) {
  const critical = checks.filter((check) => check.level === 'critical');
  const warnings = checks.filter((check) => check.level === 'warning');
  const payload = {
    status,
    ...(error ? { error } : {}),
    checks,
    summary: {
      critical_passed: critical.filter((check) => check.passed).length,
      critical_failed: critical.filter((check) => !check.passed).length,
      warnings: warnings.filter((check) => !check.passed).length,
    },
  };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exitCode = exitCode;
}

function main() {
  let themeDirectory;
  try {
    themeDirectory = resolveThemeDirectory(process.argv[2]);
  } catch (error) {
    addCheck('theme-path', 'critical', false, error.message);
    emit('FAIL', 1);
    return;
  }

  const style = readThemeFile(themeDirectory, 'style.css');
  const functions = readThemeFile(themeDirectory, 'functions.php');
  addCheck('style-css-exists', 'critical', style.exists && style.buffer.length > 0, style.error || 'style.css existe e não está vazio.');
  addCheck('functions-php-exists', 'critical', functions.exists && functions.buffer.length > 0, functions.error || 'functions.php existe e não está vazio.');

  if (style.exists && !style.error) {
    const nameMatch = style.text.match(/^\s*\*?\s*Theme Name:\s*(\S.*)$/im);
    const templateMatch = style.text.match(/^\s*\*?\s*Template:\s*hello-elementor\s*$/im);
    addCheck('wordpress-theme-header', 'critical', Boolean(nameMatch && templateMatch),
      nameMatch && templateMatch ? 'Theme Name e Template: hello-elementor estão presentes.' : 'Header precisa conter Theme Name não vazio e Template: hello-elementor.');

    const { rootCount, tokenNames } = extractRootBlocks(style.text);
    addCheck('pwe-token-presence', 'critical', rootCount > 0 && tokenNames.size >= 10,
      `Encontrados ${tokenNames.size} tokens --pwe-* em :root; mínimo exigido: 10.`);
    addCheck('hardcoded-colors', 'critical', !containsHardcodedColorOutsideRoot(style.text),
      containsHardcodedColorOutsideRoot(style.text) ? 'Há cor hexadecimal fora do bloco :root de tokens.' : 'Nenhuma cor hexadecimal foi encontrada fora de :root.');
    addCheck('token-count', 'warning', tokenNames.size >= 20,
      `Encontrados ${tokenNames.size} tokens --pwe-*; 20 ou mais é recomendado.`);
  }

  for (const [filename, file] of [['style.css', style], ['functions.php', functions]]) {
    if (file.exists) {
      const noBom = !(file.buffer[0] === 0xef && file.buffer[1] === 0xbb && file.buffer[2] === 0xbf);
      addCheck(`utf8-${filename}`, 'critical', !file.error && noBom,
        file.error || (noBom ? `${filename} é UTF-8 sem BOM.` : `${filename} contém UTF-8 BOM.`));
    }
  }

  if (functions.exists && !functions.error) {
    const hasPhpTag = /^\s*<\?php\b/.test(functions.text);
    addCheck('php-open-tag', 'critical', hasPhpTag, hasPhpTag ? 'functions.php começa com a tag PHP.' : 'functions.php precisa começar com <?php.');
    const enqueue = checkEnqueue(functions.text);
    addCheck('parent-child-enqueue', 'critical', enqueue.passed, enqueue.message);
    const phpLint = checkPhpSyntax(path.join(themeDirectory, 'functions.php'));
    addCheck('php-syntax', 'critical', phpLint.passed, phpLint.message);
  }

  const criticalFailed = checks.some((check) => check.level === 'critical' && !check.passed);
  const warningsFailed = checks.some((check) => check.level === 'warning' && !check.passed);
  if (criticalFailed) emit('FAIL', 1);
  else if (warningsFailed) emit('WARN', 2);
  else emit('PASS', 0);
}

try {
  main();
} catch (error) {
  addCheck('unexpected-error', 'critical', false, error.message || 'Falha inesperada durante a validação.');
  emit('FAIL', 1);
}
