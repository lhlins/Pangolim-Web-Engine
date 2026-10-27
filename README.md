# Pangolim Web Engine

Suíte de agentes e skills para planejar, gerar e revisar componentes de **WordPress + Elementor Free + tema Hello**. O checkout atual salva artefatos dentro de `.opp/` neste repositório.

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
│   ├── agents/                              # 6 agentes (prefixo pwe-*)
│   │   ├── pwe-orchestrator.md              # Orquestrador + roteamento
│   │   ├── pwe-elementor-architect.md       # Arquiteto de componentes
│   │   ├── pwe-site-analyst.md              # Analista de sites referência
│   │   ├── pwe-reviewer.md                  # Gatekeeper (auditoria)
│   │   ├── pwe-improvement-engineer.md      # Melhoria contínua
│   │   └── pwe-theme-builder.md             # Construtor de temas filho
│   ├── commands/                            # pwe-component, pwe-theme, pwe-analyze, pwe-review, pwe-improve
│   ├── skills/                              # 21 skills (prefixo pwe-*)
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
│   │   ├── pwe-generate-improvement-patch/  # Patch gerado
│   │   ├── pwe-plan-theme/                  # Arquitetura de tema
│   │   ├── pwe-generate-child-theme/        # Arquivos do tema filho
│   │   └── pwe-validate-theme/              # Validador executável de tema
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
**Saída:** `.opp/components/{nome-kebab}/` neste repositório (JSON + CSS + JS + docs)

Transforma conteúdo em componente Elementor Free reutilizável. Workflow: Selecionar DS → Ler DS → Solicitar conteúdo → Planejar → Wireframe → **Aprovação** → Gerar JSON → Gerar CSS → Gerar JS → Validação Programática → Auditoria (Reviewer) → Catalogar.

### `pwe-site-analyst` — Analista de sites
**Tipo:** Architect  
**Saída:** `.opp/analysis/` neste repositório (relatórios + JSON bruto)

Analisa evidências acessíveis de sites de referência, estrutura e estilos, identifica padrões e propõe tokens `--pwe-*`. Acessibilidade e performance só podem ser relatadas como medidas quando houver ferramentas de medição disponíveis; caso contrário, são inferências declaradas.

### `pwe-reviewer` — Gatekeeper
**Tipo:** Reviewer (poder de bloqueio)

Audita JSON/CSS/JS/Docs contra `pwe-elementor-free-rules.md` e o Design System. Emite relatório com status: **APROVADO** | **APROVADO COM RESSALVAS** | **REPROVADO**. A entrega final exige **APROVADO** sem pendências; ressalvas e falhas críticas bloqueiam a instalação.

### `pwe-improvement-engineer` — Engenheiro de melhoria
**Tipo:** Improvement

Analisa erros detectados, identifica causa raiz (pergunta "por quê?" até a origem), localiza agente e skill responsáveis e propõe melhorias estruturais. Nunca modifica arquivos automaticamente — sempre aguarda aprovação.

### `pwe-theme-builder` — Construtor de temas filho
**Tipo:** Architect  
**Saída:** `.opp/themes/{slug}/` neste repositório (`style.css` + `functions.php`). Screenshot é opcional e não é gerado pelo checkout.

Cria temas filho a partir do Hello Elementor configurados com tokens CSS custom properties do Design System fornecido (arquivo ou extração de site de referência). Workflow: Receber DS → Ler/Extrair DS → Planejar tema → Aprovação → Gerar `style.css` → Gerar `functions.php` → Validação Programática → Catalogar.

---

## Pipeline Obrigatório

Para qualquer tarefa, o `pwe-orchestrator` segue este fluxo:

1. **Listar pipeline completo** — agentes + skills + entradas + saídas + até 3 iterações por bloco e checkpoints humanos
2. **Apresentar ao usuário** — esperar aprovação explícita ("Aprovado", "Sim", "Pode iniciar")
3. **Delegar** ao primeiro agente
4. **Receber entrega** do agente gerador
5. **Acionar `pwe-reviewer`** — gatekeeper obrigatório
6. **Loop de revisão** em blocos de até 3 tentativas: corrigir e revalidar conforme o veredito do reviewer
7. **Somente `APROVADO`** encerra com entrega; qualquer Warning ou Critical pendente volta para correção
8. **Sem aprovação após 3 tentativas**: pausar como `BLOQUEADO — AGUARDANDO SUPERVISÃO HUMANA` e apresentar pendências
9. Só iniciar mais 3 tentativas após autorização explícita do usuário. Repetir o checkpoint a cada bloco até a correção ser aprovada ou o usuário encerrar.

---

## Comandos de Projeto (`/pwe-*`)

Os comandos ficam em `.opencode/commands/` e são carregados pelo OpenCode quando iniciado na raiz do Pangolim Web Engine. Os artefatos são gravados neste repositório, sob `.opp/`. O checkout atual não grava diretamente na pasta de um site WordPress externo.

| Comando | Uso | Descrição |
|---------|-----|-----------|
| `/pwe-component` | `/pwe-component "Hero com CTA" [--ref URL] [--ds design-system.md]` | Planeja e gera componente via orquestrador e arquiteto |
| `/pwe-theme` | `/pwe-theme "tema-filho" [--ds design-system.md \| --url URL]` | Planeja e gera arquivos de tema via orquestrador e theme builder |
| `/pwe-analyze` | `/pwe-analyze --url https://site.com [--compare URL] [--tokens]` | Analisa evidências de site(s) via `pwe-site-analyst` |
| `/pwe-review` | `/pwe-review .opp/components/{slug}` | Executa validador e auditoria semântica de componente existente |
| `/pwe-improve` | `/pwe-improve "descrição do erro"` | Aciona análise de causa raiz e proposta de patch; não aplica sem aprovação |

---

## Como Usar

### Fluxo Padrão — Criar Componente

```bash
# 1. Entrar na raiz deste repositório
cd ~/Pangolim-Web-Engine

# 2. Abrir opencode nessa pasta
opencode

# 3. Invocar comando
/pwe-component "Card de produto com carousel" --ref https://exemplo.com --ds ./design-system.md
```

**O que acontece:**
1. `pwe-orchestrator` lista o pipeline e espera aprovação
2. `pwe-elementor-architect` lê o DS, planeja o componente, gera wireframe, espera aprovação da arquitetura
3. Gera JSON, CSS e JS em `.opp/components/card-de-produto-com-carousel/` dentro do repositório PWE
4. `pwe-reviewer` audita contra `pwe-elementor-free-rules.md`
5. Só `APROVADO`, sem Warning ou Critical pendente, encerra com entrega.
6. Sem aprovação após 3 tentativas → pausar, listar pendências e pedir autorização humana para mais um bloco de até 3. Sem autorização, permanece `BLOQUEADO` e não pode ser instalado.

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
│       └── functions.php          # Enqueue + Theme Supports
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

## Instalação e Escopo de Execução

### Pré-requisitos

- **OpenCode CLI** instalado (https://opencode.ai)
- **Node.js 18+** (para os validadores de componente e tema)
- **PHP CLI** (necessário para o check de sintaxe `php -l` do validador de tema)
- **DDEV** (opcional, para testes locais)
- **Acesso a um projeto WordPress** com Elementor Free + tema Hello, quando for instalar os artefatos gerados

### Passo 1 — Obter a Suíte

Clone ou copie este repositório para um local permanente (ex.: `~/Pangolim-Web-Engine/`).

### Passo 2 — Iniciar na raiz do PWE

Abra o OpenCode com o diretório atual na raiz deste repositório:

```bash
cd ~/Pangolim-Web-Engine
opencode
```

Os cinco comandos `/pwe-*`, os seis agentes e as skills são carregados da configuração local. Não copie arquivos para configuração global nem inicie esta versão de dentro da pasta de um site cliente.

### Limite atual

Os comandos salvam resultados em `.opp/` **dentro do checkout do Pangolim Web Engine**. A instalação dos arquivos gerados no WordPress cliente é manual. Para gravar diretamente no site cliente, é necessário implementar e validar um fluxo explícito de destino; passar o caminho do cliente como argumento não habilita isso.

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
- Corrigir e reenviar em blocos de até 3 tentativas. Se ainda houver pendências, aguardar autorização humana antes do próximo bloco; qualquer ressalva pendente bloqueia a entrega/instalação.

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
**Última atualização:** 2026-10-27
**Engine:** Elementor Free + tema Hello
**Autor:** Pangolim Criativo
