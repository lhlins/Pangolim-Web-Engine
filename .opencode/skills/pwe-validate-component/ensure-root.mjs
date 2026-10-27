/**
 * ensure-root.mjs - Garante que o diretório de trabalho é o PWE root
 * 
 * Use no início de qualquer script que manipule filesystem:
 * 
 *   import './ensure-root.mjs';
 * 
 * Este arquivo NÃO deve ser modificado por nenhuma outra suite.
 * Faz parte do isolamento absoluto entre PWE e PAG.
 */

import fs from 'fs';
import path from 'path';
import config from '../../config.mjs';

const PANGOLIM_ROOT = fs.realpathSync(config.root);

// Force execution context to PWE root if different
if (process.cwd() !== PANGOLIM_ROOT) {
  console.error(`[PWE] Corrigindo contexto: ${process.cwd()} → ${PANGOLIM_ROOT}`);
  process.chdir(PANGOLIM_ROOT);
}

/**
 * Valida que um caminho existente permanece dentro do diretório raiz do PWE,
 * inclusive após resolver links simbólicos.
 * 
 * @param {string} targetPath - Caminho a ser validado
 * @returns {string} Caminho resolvido e seguro
 * @throws {Error} Se o caminho tentar acessar fora do PWE ou a pasta proibida
 */
export function validatePath(targetPath) {
  if (typeof targetPath !== 'string' || targetPath.trim() === '') {
    throw new Error('[PWE SECURITY] Informe um caminho de componente válido.');
  }

  const resolved = path.resolve(PANGOLIM_ROOT, targetPath);
  const relativePath = path.relative(PANGOLIM_ROOT, resolved);
  const escapesRoot = relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath);

  if (escapesRoot) {
    throw new Error(`[PWE SECURITY] Acesso negado: caminho "${targetPath}" resolve para fora da raiz do PWE.`);
  }
  
  let realPath;
  try {
    realPath = fs.realpathSync(resolved);
  } catch {
    throw new Error(`[PWE] Caminho não encontrado: "${targetPath}".`);
  }

  const realRelativePath = path.relative(PANGOLIM_ROOT, realPath);
  const realPathEscapesRoot = realRelativePath === '..' ||
    realRelativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(realRelativePath);

  if (realPathEscapesRoot) {
    throw new Error(`[PWE SECURITY] Acesso negado: "${targetPath}" aponta para fora da raiz do PWE.`);
  }

  return realPath;
}

export default PANGOLIM_ROOT;
