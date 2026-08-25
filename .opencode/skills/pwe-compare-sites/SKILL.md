---
name: pwe-compare-sites

description: >
  Compara dois sites (Site A vs Site B) em nivel estrutural, estilistico,
  de comportamento, acessibilidade e performance. Gera diff estruturado e
  recomenda qual abordagem estrutural adotar para componentes no Elementor Free.

version: 1.0.0
author: Pangolim Criativo
engine: Pangolim Web Engine
parent_agent: pwe-site-analyst
temperature: 0.0
capabilities:
  - site-comparison
  - diff-analysis
  - structural-diff
  - styling-diff
  - recommendation-engine
permissions:
  read: true
  write: false
  edit: false
  bash: false
constraints:
  - Nunca alterar arquivos do projeto
  - Sempre comparar com base nas 4 dimensoes: Estrutura, Tokens, Comportamento, Performance
  - Toda diferenca deve ser evidenciada com dados de ambos os sites
---

# Mission

Receber os dados de analise de dois sites (Site A e Site B), executar diff
estrutural, estilistico e comportamental, e produzir relatorio comparativo detalhado
com recomendacoes claras sobre qual padrao estrutural adotar.

---

# Inputs

- URL A e URL B (ou arquivos de analise JSON pre-existentes de ambos)
- Foco da comparacao (opcional: structure | styles | behavior | all, default: all)

---

# Process

## 1. Carregar Dados

Carregar dados dos dois sites (via nalyze-site-structure e nalyze-site-styles ou JSONs salvos):
- Site A (Referencia 1 / Atual)
- Site B (Referencia 2 / Concorrente / Inspiracao)

## 2. Diff Estrutural (DOM & Layout)

Comparar:
- Hierarquia de secoes e containers
- Numero de niveis DOM (profundidade maxima)
- Uso de display: flex vs grid vs block
- Padroes de colunas (ex: 2 colunas 50/50 vs 3 colunas 33/33/33)
- Uso de espacamentos/gaps
- Landmarks semanticos (header, main, footer, nav)

## 3. Diff Estilistico (Design Tokens)

Comparar lado a lado:
- Paleta de cores (primaria, secundaria, fundo, texto, contrastes)
- Tipografia (font-family, tamanhos clamp, pesos)
- Escala de espacamentos (base 4px/8px vs outros)
- Border radius (cantos arredondados vs quadrados)
- Sombras e elevacao
- Breakpoints responsivos

## 4. Diff Comportamental (JS & Interacoes)

Comparar:
- Presenca de animacoes e transicoes
- Interacoes complexas (carrossel, modal, abas, acordeao)
- Bibliotecas externas utilizadas
- Peso de JS/CSS carregado

## 5. Diff Acessibilidade & Performance

Comparar:
- Core Web Vitals (LCP, CLS, INP estimados)
- WCAG 2.1 AA compliance (contraste, aria, labels)
- Tamanho total da pagina (DOM nodes + assets)

## 6. Recomendacao Elementor Free

Para cada divergencia encontrada, decidir:
- Qual padrao e melhor para o Pangolim Web Engine (considerando Elementor Free + Hello Theme)
- Qual abordagem estrutural adotar no componente resultante
- Justificativa tecnica baseada em performance, manutencao e fidelidade visual

---

# Output

## Relatório de Comparação

`
RELATORIO COMPARATIVO DE SITES — PANGOLIM SITE ANALYST
Site A: [URL A]
Site B: [URL B]
Timestamp: [ISO 8601]

=== RESUMO EXECUTIVO ===
Similaridade geral: [X]%
Principais diferencas: [resumo em 3 linhas]
Recomendacao principal: [qual site usar como baseline e por que]

=== 1. DIFF ESTRUTURAL (DOM & LAYOUT) ===
| Dimensao | Site A ([URL A]) | Site B ([URL B]) | Vencedor / Observacao |
|----------|-------------------|-------------------|------------------------|
| Profundidade DOM | [N niveis] | [N niveis] | [Avaliacao] |
| Layout principal | [Flex / Grid] | [Flex / Grid] | [Avaliacao] |
| Numero de colunas | [N] | [N] | [Avaliacao] |
| Uso de semantica | [Bom / Medio / Ruim] | [Bom / Medio / Ruim] | [Avaliacao] |

Diferencas detalhadas de estrutura:
- [Ponto 1]
- [Ponto 2]

=== 2. DIFF ESTILISTICO (DESIGN TOKENS) ===
| Token | Site A | Site B | Alinhado com DS Pangolim? |
|-------|--------|--------|--------------------------|
| Cor Primaria | [#hex] | [#hex] | [Sim / Nao (Gap)] |
| Tipografia Base | [font] | [font] | [Sim / Nao (Gap)] |
| Escala Espacamento | [base px] | [base px] | [Sim / Nao (Gap)] |
| Border Radius | [valores] | [valores] | [Sim / Nao (Gap)] |

Diferencas detalhadas de estilo:
- [Ponto 1]
- [Ponto 2]

=== 3. DIFF COMPORTAMENTAL (JS & INTERACOES) ===
| Aspecto | Site A | Site B |
|---------|--------|--------|
| Frameworks JS | [lista] | [lista] |
| Animacoes | [descricao] | [descricao] |
| Complexidade | [Baixa/Media/Alta] | [Baixa/Media/Alta] |

=== 4. DIFF ACESSIBILIDADE & PERFORMANCE ===
| Metrica | Site A | Site B | Melhor |
|---------|--------|--------|--------|
| LCP estimado | [ms] | [ms] | [...] |
| CLS estimado | [score] | [score] | [...] |
| Contraste WCAG | [Pass/Fail] | [Pass/Fail] | [...] |

=== 5. RECOMENDACAO PARA O ELEMENTOR FREE ===
Abordagem recomendada: [Site A | Site B | Hibrido]
Justificativa tecnica:
1. [Motivo 1 - ex: estrutura do Site B usa grid complexo que no Elementor Free exige CSS complementar excessivo; Site A usa flex wrap puro que e nativo]
2. [Motivo 2]

Estrutura Elementor sugerida:
- Section principal: [...]
- Containers internos: [...]
- Widgets mapeados: [...]
`

## JSON Bruto (compare-[domainA]-vs-[domainB]-[timestamp].json)

`json
{
  "siteA": "https://...",
  "siteB": "https://...",
  "timestamp": "2026-08-14T...",
  "similarityScore": 78,
  "structuralDiff": {
    "domDepth": {"siteA": 12, "siteB": 15},
    "layoutEngine": {"siteA": "flex", "siteB": "grid"}
  },
  "stylingDiff": {
    "primaryColor": {"siteA": "#2563eb", "siteB": "#1d4ed8"}
  },
  "recommendation": {
    "chosenBaseline": "siteA",
    "reason": "Mais adequado para Elementor Free devido ao uso nativo de Flexbox.",
    "elementorBlueprintSuggestion": {
      "containers": 3,
      "widgets": ["heading", "text", "button"]
    }
  }
}
`

---

# Validation

Antes de finalizar:
- [ ] Dados de ambos os sites carregados e validos
- [ ] Comparacao executada nas 4 dimensoes (estrutura, tokens, comportamento, perf/a11y)
- [ ] Tabela comparativa preenchida sem lacunas
- [ ] Recomendacao final justificada tecnicamente para o contexto Elementor Free

---

# Completion Criteria

Skill concluida quando:
- Relatorio comparativo formatado entregue
- JSON de diff salvo
- Recomendacao tecnica clara emitida
