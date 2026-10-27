---
name: pwe-extract-design-tokens

description: >
  Converte declarações CSS observadas no material recebido (variáveis, valores declarados)
  em tokens de design padronizados, compatíveis com as variáveis CSS do Engine (--pwe-*).
  Mapeia gaps entre o site analisado e o Design System atual do projeto.

version: 1.0.0
author: Pangolim Criativo
engine: Pangolim Web Engine
parent_agent: pwe-site-analyst
temperature: 0.0
capabilities:
  - design-token-extraction
  - gap-analysis
  - variable-mapping
constraints:
  - Nunca gerar CSS para componentes
  - Toda conversão deve respeitar a escala base do Pangolim Web Engine
  - Sempre identificar se o token já existe no DS atual ou se é novo, somente quando o DS foi fornecido
  - Associar cada token à declaração CSS observada; não chamar inferências de estilos computados
  - Não declarar match/update/new contra DS sem arquivo ou conteúdo do DS fornecido
---

# Mission

Transformar declarações CSS observadas no conteúdo recebido em um conjunto estruturado de Design Tokens
compatíveis com o sistema do Pangolim Web Engine (--pwe-*).

---

# Inputs

- Dados brutos efetivamente disponíveis da análise de estilos (`pwe-analyze-site-styles`)
- Design System atual do projeto (para referência e gap analysis)

---

# Process

## 1. Normalização de Valores

Para cada declaração de estilo observada no CSS recebido:
- Converter tudo para a unidade padrão do engine (px, rem, ou valores fluidos clamp())
- Normalizar cores para formato estável (hex 8-digit #RRGGBBAA)
- Normalizar sombras e radius para escalas pré-definidas (sm, md, lg...)

## 2. Tokenização (--pwe-*)

Mapear cada valor para o token semântico correspondente:

| Tipo | Categoria | Exemplo Token |
|------|-----------|--------------|
| Cor | Primária | --pwe-color-primary |
| Cor | Neutra | --pwe-color-neutral-900 |
| Espaçamento | Base | --pwe-space-4 |
| Tipografia | Tamanho | --pwe-font-size-base |
| Tipografia | Peso | --pwe-font-weight-semibold |
| Radius | Médio | --pwe-radius-md |
| Sombra | Médio | --pwe-shadow-md |

## 3. Gap Analysis vs DS Atual

Para cada token extraído:
- Já existe no DS? (Match)
- Se não, ele é necessário? (Novo token)
- Se existe, mas o valor difere? (Conflict: manter DS ou atualizar?)

## 4. Estruturação do Output

Gerar JSON de tokens prontos para ingestão e relatórios de discrepâncias.

---

# Output

## Relatório de Tokens

`
TOKENS DE DESIGN EXTRAÍDOS — [URL]
Timestamp: [ISO 8601]

=== CORES ===
[token] | [valor extraído] | [valor DS] | [status: MATCH | UPDATE | NEW]
Ex: --pwe-color-primary | #2563eb | #3b82f6 | UPDATE

=== TIPOGRAFIA ===
[token] | [valor extraído] | [valor DS] | [status]
Ex: --pwe-font-size-base | clamp(...) | 1rem | NEW

=== ESPAÇAMENTOS ===
[token] | [valor extraído] | [valor DS] | [status]
Ex: --pwe-space-4 | 16px | 16px | MATCH

... (tokens radius, shadows, etc.)

=== GAP ANALYSIS (DIFERENÇAS CRÍTICAS) ===
- Token [nome]: O site usa valor [X] que é significativamente diferente do DS [Y]. 
  Recomendação: [manter DS / atualizar DS / criar token específico].
`

## JSON de Tokens (	okens-[domain]-[timestamp].json)

`json
{
  "domain": "...",
  "timestamp": "2026-08-14T...",
  "tokens": {
    "colors": {
      "primary": {"value": "#2563eb", "status": "update", "dsValue": "#3b82f6"},
      "neutral-900": {"value": "#111827", "status": "match"}
    },
    "typography": {
      "fontSizeBase": {"value": "clamp(...)", "status": "new"}
    }
  }
}
`

---

# Validation

Antes de finalizar, validar:
- [ ] Todos os tokens mapeados para a convenção --pwe-*
- [ ] Status de match/update/new só definido quando o Design System foi fornecido; caso contrário, marcar como não comparado
- [ ] Fontes (ex: 16px extraído de .hero__title) registradas
- [ ] Gaps críticos identificados no relatório

---

# Completion Criteria

Skill concluída quando:
- Relatório de tokens gerado
- JSON de tokens salvo
- Mapeamento de status para cada token realizado quando há DS; caso contrário, a ausência de comparação está declarada
