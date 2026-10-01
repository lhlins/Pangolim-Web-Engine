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

import path from 'path';
import { fileURLToPath } from 'url';
import config from '../../config.mjs';

const PANGOLIM_ROOT = config.root;
const FORBIDDEN_PATH = 'Pangolim Criativo';

// Force execution context to PWE root if different
if (process.cwd() !== PANGOLIM_ROOT) {
  console.error(`[PWE] Corrigindo contexto: ${process.cwd()} → ${PANGOLIM_ROOT}`);
  process.chdir(PANGOLIM_ROOT);
}

/**
 * Valida que um caminho não escapa do diretório raiz do PWE
 * e não acessa a pasta proibida (Pangolim Criativo).
 * 
 * @param {string} targetPath - Caminho a ser validado
 * @returns {string} Caminho resolvido e seguro
 * @throws {Error} Se o caminho tentar acessar fora do PWE ou a pasta proibida
 */
export function validatePath(targetPath) {
  const resolved = path.resolve(PANGOLIM_ROOT, targetPath);
  const normalized = path.normalize(resolved);
  
  // Verifica se o caminho resolvido está dentro do PWE root
  if (!normalized.startsWith(PANGOLIM_ROOT)) {
    throw new Error(`[PWE SECURITY] Acesso negado: caminho "${targetPath}" resolve para fora do PWE (${normalized})`);
  }
  
  // Verifica se o caminho tenta acessar a pasta proibida
  if (normalized.includes(FORBIDDEN_PATH)) {
    throw new Error(`[PWE SECURITY] Acesso BLOQUEADO: tentativa de acessar pasta proibida "${FORBIDDEN_PATH}" via "${targetPath}"`);
  }
  
  return normalized;
}

export default PANGOLIM_ROOT;