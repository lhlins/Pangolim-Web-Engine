# Pangolim Web Engine

Suíte de geração de componentes reutilizáveis para **WordPress + Elementor Free + tema Hello**. Produz JSON, CSS e JS importáveis, além de ferramentas de análise de sites de referência e auditoria técnica.

---

## Finalidade

Esta suíte atende o fluxo técnico de produção de componentes para sites WordPress baseados em Elementor Free:

- **Gerar componentes** — arquitetura → wireframe → JSON Elementor → CSS → JS
- **Analisar sites de referência** — extrair estrutura DOM, tokens de design, comportamento JS
- **Auditar entregas** — gatekeeper obrigatório antes de publicar
- **Melhorar continuamente** — análise de causa raiz e patches estruturais

**Restrição fundamental:** Apenas Elementor Free + tema Hello. Sem Elementor Pro, sem addons, sem frameworks CSS/JS.

---

## Estrutura

```
Pangolim-Web-Engine/
├── .opencode/
│   ├── agents/                              # 5 agentes (prefixo pwe-*)
│   │   ├── pwe-orchestrator.md              # Orquestrador + roteamento
│   │   ├── pwe-elementor-architect.md       # Arquiteto de componentes
│   │   ├── pwe-site-analyst.md              # Analista de sites referência
│   │   ├── pwe-reviewer.md                  # Gatekeeper (auditoria)
│   │   └── pwe-improvement-engineer.md      # Melhoria contínua
│   ├── skills/                              # 18 skills (prefixo pwe-*)
│   │   ├── pwe-generate-elementor-json/     # JSON Elementor
│   │   ├── pwe-generate-css/                # CSS com tokens --pwe-*
│   │   ├── pwe-generate-js/                 # JavaScript isolado
│   │   ├── pwe-plan-component/              # Arquitetura do componente
│   │   ├── pwe-build-elementor-structure/   # Estrutura JSON base
│   │   ├── pwe-read-design-system/          # Leitura do DS
│   │   ├── pwe-validate-component/          # Validação programática
│   │   ├── pwe-apply-patch/                 # Aplicação de patches de melhoria
│   │   ├── pwe-catalog-component/           # Catalogação na biblioteca
│   │   ├── pwe-analyze-site-structure/      # Análise de DOM
│   │   ├── pwe-analyze-site-styles/         # Análise de CSS
│   │   ├── pwe-compare-sites/               # Comparação de sites
│   │   ├── pwe-extract-design-tokens/       # Extração de tokens
│   │   ├── pwe-sync-tokens-to-ds/           # Sincronização com DS
│   │   ├── pwe-analyze-problem/             # Análise de erro
│   │   ├── pwe-find-root-cause/             # Causa raiz
│   │   ├── pwe-propose-improvement/         # Proposta estrutural
│   │   └── pwe-generate-improvement-patch/  # Patch gerado
│   ├── standards/
│   │   └── pwe-elementor-free-rules.md      # Regras técnicas obrigatórias
│   ├── knowledge/
│   │   ├── pwe-elementor-flex-layout.md     # Padrões flex do Elementor
│   │   ├── pwe-elementor-limitations.md     # Limitações conhecidas
│   │   └── pwe-ddev-workflows.md            # Workflows DDEV
│   └── opencode.json                        # Config local (skills + agents)
└── README.md
```

---

## Agentes — Papéis e Responsabilidades

### `pwe-orchestrator` — Orquestrador
**Tipo:** Primary orchestrator  
**Acionado por:** Comandos `/pwe-*`

Interpreta a solicitação do usuário, seleciona o agente especializado, **lista o pipeline completo** (agentes + skills + entradas + saídas + iterações esperadas) e **aguarda aprovação explícita** antes de delegar. Após entrega, valida e consolida resultado.

**Regra crítica:** Nunca delega sem aprovação prévia do pipeline listado pelo usuário.

### `pwe-elementor-architect` — Arquiteto de componentes
**Tipo:** Architect  
**Saída:** `.opp/components/{nome-kebab}/` (JSON + CSS + JS + docs)

Transforma conteúdo em componente Elementor Free reutilizável. Workflow: Selecionar DS → Ler DS → Solicitar conteúdo → Planejar → Wireframe → **Aprovação** → Gerar JSON → Gerar CSS → Gerar JS → Validação Programática → Auditoria (Reviewer) → Catalogar.

### `pwe-site-analyst` — Analista de sites
**Tipo:** Architect  
**Saída:** `.opp/analysis/` (relatórios + JSON bruto)

Faz fetch de URLs, extrai DOM/CSS/JS, identifica bibliotecas, extrai tokens de design compatíveis com `--pwe-*`, compara dois sites lado a lado, audita acessibilidade (WCAG 2.1 AA) e performance (Core Web Vitals).

### `pwe-reviewer` — Gatekeeper
**Tipo:** Reviewer (poder de bloqueio)

Audita JSON/CSS/JS/Docs contra `pwe-elementor-free-rules.md` e o Design System. Emite relatório com status: **APROVADO** | **APROVADO COM RESSALVAS** | **REPROVADO**. Bloqueia entrega se houver item Critical.

### `pwe-improvement-engineer` — Engenheiro de melhoria
**Tipo:** Improvement

Analisa erros detectados, identifica causa raiz (pergunta "por quê?" até a origem), localiza agente e skill responsáveis e propõe melhorias estruturais. Nunca modifica arquivos automaticamente — sempre aguarda aprovação.

### `pwe-theme-builder` — Construtor de temas filho
**Tipo:** Architect  
**Saída:** `.opp/themes/{slug}/` (`style.css` + `functions.php` + `screenshot.png`)

Cria temas filho a partir do Hello Elementor configurados com tokens CSS custom properties do Design System fornecido (arquivo ou extração de site de referência). Workflow: Receber DS → Ler/Extrair DS → Planejar tema → Aprovação → Gerar `style.css` → Gerar `functions.php` → Validação Programática → Catalogar.

---

## Pipeline Obrigatório

Para qualquer tarefa, o `pwe-orchestrator` segue este fluxo:

1. **Listar pipeline completo** — agentes + skills + entradas + saídas + iterações máx. 3
2. **Apresentar ao usuário** — esperar aprovação explícita ("Aprovado", "Sim", "Pode iniciar")
3. **Delegar** ao primeiro agente
4. **Receber entrega** do agente gerador
5. **Acionar `pwe-reviewer`** — gatekeeper obrigatório
6. **Loop de revisão** (máx. 3 iterações): APROVADO → entregar / REPROVADO → devolver ao gerador
7. **Iteração 3 sem aprovação** → entregar com status "ENTREGUE COM RESSALVAS" + relatório de desvios

---

## Comandos Globais (`pwe-*`)

Todos os comandos operam no CWD do projeto. O caminho pode ser passado como argumento.

| Comando | Uso | Descrição |
|---------|-----|-----------|
| `/pwe-component` | `/pwe-component [pasta-projeto] "Hero com CTA" [--ref URL] [--ds design-system.md]` | Cria componente via `pwe-orchestrator` → `pwe-elementor-architect` → `pwe-reviewer` |
| `/pwe-theme` | `/pwe-theme [pasta-projeto] "meu-tema-filho" [--ds design-system.md \| --url URL]` | Cria tema filho Hello Elementor via `pwe-orchestrator` → `pwe-theme-builder` → `pwe-reviewer` |
| `/pwe-analyze` | `/pwe-analyze [pasta-projeto] --url https://site.com [--compare https://outro.com] [--tokens]` | Analisa site(s) via `pwe-site-analyst` |
| `/pwe-review` | `/pwe-review [pasta-projeto] [caminho-componente]` | Audita componente existente via `pwe-reviewer` |
| `/pwe-improve` | `/pwe-improve [pasta-projeto] "descrição do erro"` | Aciona `pwe-improvement-engineer` para root cause + proposta |

---

## Como Usar

### Fluxo Padrão — Criar Componente

```bash
# 1. Entrar na pasta do projeto WordPress
cd "\\wsl.localhost\Ubuntu\home\luislins\projects\ppa-site"

# 2. Abrir opencode nessa pasta
opencode

# 3. Invocar comando
/pwe-component "Card de produto com carousel" --ref https://exemplo.com --ds ./design-system.md
```

**O que acontece:**
1. `pwe-orchestrator` lista o pipeline e espera aprovação
2. `pwe-elementor-architect` lê o DS, planeja o componente, gera wireframe, espera aprovação da arquitetura
3. Gera JSON, CSS, JS em `.opp/components/card-de-produto-com-carousel/`
4. `pwe-reviewer` audita contra `pwe-elementor-free-rules.md`
5. Se aprovado → entrega. Se reprovado → loop de correção (máx. 3x)

### Análise de Site de Referência

```bash
/pwe-analyze --url https://referencia.com --tokens
# Gera relatório + JSON em .opp/analysis/site-analysis-referencia-com-[timestamp].json
```

### Modo Comparação

```bash
/pwe-analyze --url https://site-a.com --compare https://site-b.com
# Gera DIFF estruturado lado a lado
```

---

## Estrutura de Saída

Componentes são salvos em `.opp/components/{nome-kebab}/`:

```
.opp/
├── components/
│   └── card-de-produto/
│       ├── component.json         # JSON Elementor Free
│       ├── component.css          # CSS com tokens --pwe-*
│       ├── component.js           # JavaScript isolado (IIFE)
│       ├── README.md              # Guia de instalação
│       └── ficha-tecnica.md       # Spec técnica
├── themes/
│   └── meu-tema-filho/
│       ├── style.css              # Header WP + Tokens CSS
│       ├── functions.php          # Enqueue + Theme Supports
│       └── screenshot.png         # Placeholder
├── analysis/
│   ├── site-analysis-com-20260101.json
│   └── site-compare-a-b-20260101.json
└── patches/                       # Patches de melhoria
```

---

## Princípios Não-Negociáveis

1. **Elementor Free only** — sem Pro, sem addons
2. **Tema Hello** — compatibilidade obrigatória
3. **Tokens `--pwe-*`** — todas as cores, espaçamentos e tipografia via variáveis CSS
4. **Native first** — CSS > JS, recursos nativos Elementor > custom
5. **Architecture before implementation** — nunca gerar código sem aprovação da arquitetura
6. **Validate programmatically** — todo JSON passa por BOM check, JSON parse e UTF-8 well-formed check
7. **Document everything** — specs, guias de instalação, versionamento
8. **Never guess** — se faltar informação, perguntar ao usuário

---

## Token System

Prefixo padrão para todos os tokens de design do Web Engine:

```css
--pwe-color-primary: #1a1a2e;
--pwe-color-secondary: #f5a623;
--pwe-space-xs: 0.5rem;
--pwe-space-md: 1.5rem;
--pwe-font-heading: 'Inter', sans-serif;
--pwe-radius-lg: 0.75rem;
--pwe-shadow-card: 0 4px 12px rgba(0,0,0,0.08);
```

**Nunca use valores hardcoded** em CSS. Se o DS do projeto não define um token, use os defaults do Web Engine ou proponha novo token ao DS.

---

## Standards & Knowledge

### `pwe-elementor-free-rules.md`
Fonte única de verdade técnica. Define:
- Widgets permitidos (apenas Elementor Free)
- Schema JSON válido
- Content width como string ("full" | "boxed")
- Proibição de `_css_classes` em containers
- Variáveis CSS obrigatórias (`--pwe-*`)

### `pwe-elementor-flex-layout.md`
Padrões de Flex Container + Flex Item. Checklist obrigatório:
- Containers flex row + wrap: total = (N-1)*G + N*W <= 100%
- Gap documentado (nativo ou padding interno)
- Sem `_css_classes` em containers

### `pwe-elementor-limitations.md`
Limitações conhecidas do Elementor Free:
- Sem CSS Grid (usar flex-wrap + gap)
- Sem Pro widgets (slides, posts, forms avançados)
- Sem Custom CSS por widget (apenas global)
- Sem Dynamic Tags (exceto built-in básicos)

### `pwe-ddev-workflows.md`
Comandos e workflows para testar componentes localmente via DDEV.

---

## Instalação em Outro Computador

### Pré-requisitos

- **OpenCode CLI** instalado (https://opencode.ai)
- **Node.js 18+** (para o validador `pwe-validate-component/validate-component.mjs`)
- **DDEV** (opcional, para testes locais)
- **Acesso ao projeto WordPress** com Elementor Free + tema Hello

### Passo 1 — Copiar a Suíte

Copie `Pangolim-Web-Engine/` para um local permanente (ex.: `~/Pangolim-Web-Engine/`).

### Passo 2 — Registrar Agents Globalmente

Edite `~/.config/opencode/opencode.json` e adicione:

```json
{
  "agent": {
    "pwe-orchestrator": {
      "description": "Orquestrador do Pangolim Web Engine.",
      "mode": "primary",
      "prompt": "~/.opencode/agents/pwe-orchestrator.md"
    },
    "pwe-elementor-architect": {
      "description": "Arquiteto de componentes Elementor Free.",
      "prompt": "~/.opencode/agents/pwe-elementor-architect.md"
    }
    // ... repetir para os 5 agents
  }
}
```

### Passo 3 — Copiar Comandos Globais

Copie os 4 arquivos `pwe-*.md` para `~/.config/opencode/command/`.

### Passo 4 — Configurar OpenCode Local do Projeto

Dentro do projeto WordPress (ex.: `ppa-site/`), crie `.opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "skill": {
    "pwe-generate-elementor-json": { "path": "~/.opencode/skills/pwe-generate-elementor-json" },
    "pwe-generate-css": { "path": "~/.opencode/skills/pwe-generate-css" }
    // ... repetir para as 18 skills
  }
}
```

Alternativa: configurar `.opencode/skills/` local com symlinks para a suíte global.

### Passo 5 — Validar

```bash
cd ~/projects/ppa-site
opencode

# No Tab, devem aparecer os 5 agents pwe-*
# Testar comando
/pwe-analyze --url https://exemplo.com --tokens
```

---

## Troubleshooting

**Erro: "Elementor widget não suportado"**
- Verificar se o widget é Free-only
- Consultar `pwe-elementor-limitations.md`

**Erro: "JSON inválido"**
- O validador detectou BOM, JSON malformado ou mojibake
- Re-executar geração (skill corrige automaticamente)

**Erro: "Cor hardcoded"**
- Substituir por `var(--pwe-color-*)`
- Se token não existe, adicionar ao Design System primeiro

**`pwe-reviewer` reprova entrega**
- Ler relatório — itens Critical bloqueiam entrega
- Corrigir e reenviar (loop de revisão até 3x)

**Skill não encontrada**
- Verificar se `.opencode/skills/pwe-*/SKILL.md` existe
- Confirmar registro em `.opencode/opencode.json` local

---

## Contribua com o Pangolim Web Engine

Interessado em ajudar a evoluir a suíte? Consulte nosso [Guia de Contribuição](CONTRIBUTING.md) para entender como:

- Reportar problemas ou sugerir melhorias.
- Submeter novos componentes, temas ou regras.
- Seguir os padrões técnicos (Design Tokens, Elementor Free Rules).
- Passar pelo processo de auditoria automatizada (Reviewer Gatekeeper).

---

## Governança Técnica

- **Gatekeeper**: Toda entrega passa pelo `pwe-reviewer`. Contribuições com falhas `Critical` são bloqueadas até correção.
- **Melhoria contínua**: Bugs e falhas de processo são investigados via `pwe-improvement-engineer` (Root Cause Analysis → Proposta → Patch), garantindo correções estruturais e permanentes.

---

## Versão

**Versão da suíte:** 2.0.0  
**Última atualização:** 2026-08-21  
**Engine:** Elementor Free + tema Hello  
**Autor:** Pangolim Criativo
