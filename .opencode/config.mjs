/**
 * config.mjs - Configuração central de caminhos para o Pangolim Web Engine
 * 
 * Este arquivo fornece o caminho raiz do PWE para outros módulos.
 * Ele NÃO modifica process.cwd() para evitar efeitos colaterais.
 * 
 * Uso:
 *   import config from './config.mjs';
 *   const root = config.root;
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root do Pangolim Web Engine (diretório onde opencode.json reside)
export const PANGOLIM_WEB_ENGINE_ROOT = path.resolve(__dirname, '..');

// Diretórios dentro do engine
export const DIRECTORIES = {
  opencode: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opencode'),
  skills: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opencode', 'skills'),
  agents: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opencode', 'agents'),
  knowledge: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opencode', 'knowledge'),
  standards: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opencode', 'standards'),
  components: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opp', 'components'),
  docs: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opp', 'docs'),
  backups: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opp', 'backups'),
  analysis: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opp', 'analysis'),
  themes: path.join(PANGOLIM_WEB_ENGINE_ROOT, '.opp', 'themes'),
};

export default {
  root: PANGOLIM_WEB_ENGINE_ROOT,
  directories: DIRECTORIES,
};
