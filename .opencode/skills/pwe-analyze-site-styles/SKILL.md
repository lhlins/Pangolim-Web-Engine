---
name: pwe-analyze-site-styles

description: >
  Extrai e cataloga todos os estilos de um site: cores, tipografia, espacamentos,
  border-radius, sombras, breakpoints, animacoes, transicoes. Converte para tokens
  compativeis com variaveis CSS (--pwe-*) e identifica gaps vs Design System do engine.

version: 1.0.0
author: Pangolim Criativo
engine: Pangolim Web Engine
parent_agent: pwe-site-analyst
temperature: 0.0
capabilities:
  - css-analysis
  - design-token-extraction
  - color-analysis
  - typography-analysis
  - spacing-analysis
  - animation-analysis
permissions:
  read: true
  write: false
  edit: false
  bash: false
constraints:
  - Nunca gerar CSS para componentes
  - Sempre converter valores para nomenclatura --pwe-*
  - Registrar fonte exata (URL + seletor + propriedade) para cada token
---

# Mission

Extrair o Design System implícito de um site: todas as decisoes visuais codificadas
em CSS (inline, linked, computed), estruturar como tokens tipados e mapear para
o vocabulario de variaveis CSS do Pangolim (--pwe-*).

---

# Inputs

- URL do site OU HTML/CSS brutos fornecidos
- Seletores alvo (opcional, default: pagina inteira)
- Design System atual do projeto (para diff/gap analysis)

---

# Process

## 1. Coletar CSS

Fontes (em ordem de prioridade):
1. CSS inline: <style>, style="" attributes
2. CSS linked: <link rel="stylesheet"> (fetch cada um, max 10 arquivos, 500KB cada)
3. CSS-in-JS: procurar por styled-components, emotion, JSS patterns no JS
4. Computed styles (heuristica): para elementos-chave, inferir de classes/frameworks conhecidos

Para cada arquivo CSS:
- Parsear rules (seletores + declaracoes)
- Resolver @import (max 2 niveis)
- Extrair @media queries e breakpoints
- Extrair @keyframes e animation-name
- Extrair custom properties (--*)

## 2. Extrair Cores

Coletar todas as ocorrencias de:
- hex (#rgb, #rrggbb, #rrggbbaa)
- rgb()/rgba()
- hsl()/hsla()
- color() / lab() / lch() / oklab() / oklch()
- named colors
- currentColor
- CSS custom properties (--*)

Para cada cor unica:
- Valor original + formato normalizado (hex 8-digit #RRGGBBAA)
- Onde aparece: lista de (seletor, propriedade, arquivo/linha)
- Classificacao heuristica: primary, secondary, accent, neutral, success, warning, error, background, text, border, link, overlay
- Contraste vs fundo (se fundo detectado): ratio WCAG
- Mapeamento --pwe-color-*: sugerir nome semantico

## 3. Extrair Tipografia

Para cada font-family declarada:
- Familia (stack completo)
- Fonte primaria (primeira da stack)
- Fallbacks
- Font-weight usados (100-900, normal, bold)
- Font-size: valores + unidades (px, rem, em, clamp, vw)
- Line-height
- Letter-spacing
- Text-transform
- Font-display (se @font-face)

Para @font-face:
- Font-family name
- Src (urls, format)
- Font-weight, font-style, unicode-range
- Font-display

Mapear para --pwe-font-*: family, weight, size (clamp), line-height, letter-spacing

## 4. Extrair Espacamentos

Coletar todos os valores de:
- margin, margin-*
- padding, padding-*
- gap, row-gap, column-gap
- space-between (em flex/grid)
- width/height (quando usados como spacing)
- transform: translate (spacing visual)

Normalizar para escala base (ex: 4px ou 8px):
- Identificar unidade base (gcd dos valores em px)
- Gerar escala: --pwe-space-0 a --pwe-space-XX
- Mapear cada valor original -> token mais proximo

## 5. Extrair Border Radius

Coletar:
- border-radius (e -top-left, etc.)
- Valores em px, rem, em, %

Mapear para escala --pwe-radius-*: none, sm, md, lg, xl, 2xl, full

## 6. Extrair Sombras

Coletar box-shadow e text-shadow:
- Offset X, Y
- Blur radius
- Spread radius
- Cor
- Inset/outset
- Multiplas sombras (virgula-separadas)

Mapear para --pwe-shadow-*: none, sm, md, lg, xl, inner, custom

## 7. Extrair Breakpoints

De @media queries:
- min-width, max-width, min-height, max-height
- Orientacao
- Prefers-reduced-motion, prefers-contrast, prefers-color-scheme

Consolidar breakpoints unicos (valores em px)
Comparar com DS padrao (640, 768, 1024, 1280, 1536)
Flaggar breakpoints nao-padrao

## 8. Extrair Animacoes & Transicoes

@keyframes:
- Nome
- Keyframes (%, transform, opacity, etc.)
- Duracao, timing-function, delay, iteration-count, direction, fill-mode, play-state

transition:
- Propriedade (all, transform, opacity, color, etc.)
- Duracao
- Timing-function
- Delay

animation:
- Nome (referencia @keyframes)
- Duracao, easing, delay, count, direction, fill-mode, play-state

Mapear para --pwe-animation-*, --pwe-transition-*
Flaggar animacoes pesadas (layout, paint, composite nao-transform/opacity)

## 9. Identificar Framework/Metodologia

Detectar por classes/seletores:
- Tailwind (utilidades: p-4, text-center, md:flex, etc.)
- Bootstrap (col-, btn-, card-, etc.)
- BEM (.block__element--modifier)
- CSS Modules (hash: .Component_name__hash)
- Styled-components (hash: .sc-bdVaJa)
- Emotion (css-...)
- Custom (classes semanticas proprias)

---

# Output

## Relatorio Texto

`
ESTILOS - [URL]
Timestamp: [ISO 8601]

=== CORES ===
--pwe-color-primary: #2563eb (blue-600) - usado em: .btn-primary (bg), a (color) - 45 ocorrencias
--pwe-color-secondary: #1e40af (blue-800) - usado em: .btn-secondary (bg) - 12 ocorrencias
--pwe-color-neutral-900: #111827 - texto principal - 120 ocorrencias
--pwe-color-background: #ffffff - body bg - 1 ocorrencia
... (todas cores unicas)

=== TIPOGRAFIA ===
--pwe-font-family-base: "Inter", system-ui, sans-serif
--pwe-font-family-heading: "Inter", system-ui, sans-serif
--pwe-font-weight-normal: 400
--pwe-font-weight-medium: 500
--pwe-font-weight-semibold: 600
--pwe-font-weight-bold: 700
--pwe-font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)
--pwe-font-size-sm: clamp(0.875rem, 0.825rem + 0.25vw, 1rem)
--pwe-font-size-base: clamp(1rem, 0.925rem + 0.375vw, 1.125rem)
--pwe-font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem)
--pwe-font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)
--pwe-font-size-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem)
--pwe-font-size-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 3rem)
--pwe-font-size-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 4rem)
--pwe-line-height-tight: 1.25
--pwe-line-height-normal: 1.5
--pwe-line-height-relaxed: 1.75
--pwe-letter-spacing-tight: -0.025em
--pwe-letter-spacing-normal: 0
--pwe-letter-spacing-wide: 0.025em

@font-face detectadas:
- Inter (400, 500, 600, 700) - woff2 - font-display: swap

=== ESPACAMENTOS ===
Base unit: 4px
--pwe-space-0: 0
--pwe-space-1: 4px (0.25rem)
--pwe-space-2: 8px (0.5rem)
--pwe-space-3: 12px (0.75rem)
--pwe-space-4: 16px (1rem)
--pwe-space-5: 20px (1.25rem)
--pwe-space-6: 24px (1.5rem)
--pwe-space-8: 32px (2rem)
--pwe-space-10: 40px (2.5rem)
--pwe-space-12: 48px (3rem)
--pwe-space-16: 64px (4rem)
--pwe-space-20: 80px (5rem)
--pwe-space-24: 96px (6rem)

=== BORDER RADIUS ===
--pwe-radius-none: 0
--pwe-radius-sm: 2px
--pwe-radius-md: 6px
--pwe-radius-lg: 8px
--pwe-radius-xl: 12px
--pwe-radius-2xl: 16px
--pwe-radius-full: 9999px

=== SOMBRAS ===
--pwe-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--pwe-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--pwe-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--pwe-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)

=== BREAKPOINTS ===
Detectados: [640, 768, 1024, 1280, 1536]
Framework: tailwind
Padrao DS: [640, 768, 1024, 1280, 1536] - MATCH
Nao-padrao: []

=== ANIMACOES ===
--pwe-transition-fast: 150ms ease
--pwe-transition-normal: 200ms ease
--pwe-transition-slow: 300ms ease
--pwe-animation-fade-in: fadeIn 200ms ease forwards
--pwe-animation-slide-up: slideUp 300ms ease-out forwards

@keyframes:
- fadeIn: 0% {opacity:0} 100% {opacity:1}
- slideUp: 0% {opacity:0; transform: translateY(10px)} 100% {opacity:1; transform: translateY(0)}

Animacoes pesadas detectadas: 0

=== FRAMEWORK ===
Detectado: Tailwind CSS v3.x
Classes utilitarias: 847 ocorrencias
CSS custom: 23 regras
Metodologia: Utility-first
`

## JSON Bruto (styles-[domain]-[timestamp].json)

`json
{
  "url": "https://...",
  "timestamp": "2026-08-14T...",
  "colors": [
    {"token": "--pwe-color-primary", "value": "#2563eb", "original": "rgb(37, 99, 235)", "occurrences": 45, "category": "primary", "contrast": {"vsWhite": 4.5, "vsBlack": 4.6}, "selectors": [".btn-primary", "a"]}
  ],
  "typography": {
    "families": {"base": ["Inter", "system-ui", "sans-serif"], "heading": ["Inter", "system-ui", "sans-serif"]},
    "weights": {"normal": 400, "medium": 500, "semibold": 600, "bold": 700},
    "sizes": {"xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)", "base": "clamp(1rem, 0.925rem + 0.375vw, 1.125rem)"},
    "lineHeights": {"tight": 1.25, "normal": 1.5, "relaxed": 1.75},
    "letterSpacings": {"tight": "-0.025em", "normal": "0", "wide": "0.025em"},
    "fontFaces": [{"family": "Inter", "weights": [400,500,600,700], "format": "woff2", "display": "swap"}]
  },
  "spacing": {"baseUnit": "4px", "scale": {"0": "0", "1": "4px", "4": "16px", "8": "32px"}},
  "radius": {"none": "0", "sm": "2px", "md": "6px", "lg": "8px", "xl": "12px", "2xl": "16px", "full": "9999px"},
  "shadows": {"sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)", "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)"},
  "breakpoints": [640, 768, 1024, 1280, 1536],
  "animations": {"transitions": {"fast": "150ms ease", "normal": "200ms ease"}, "keyframes": {"fadeIn": "..."}},
  "framework": {"name": "tailwind", "version": "3.x", "utilityClasses": 847, "customRules": 23}
}
`

---

# Validation

Antes de finalizar:
- [ ] CSS coletado de todas as fontes (inline, linked, JS)
- [ ] Pelo menos 1 cor, 1 fonte, 1 espacamento extraidos
- [ ] Todos valores mapeados para nomenclatura --pwe-*
- [ ] Fonte (seletor + propriedade + arquivo) registrada para cada token
- [ ] Breakpoints comparados com DS padrao
- [ ] Framework identificado
- [ ] Animacoes pesadas flaggadas

---

# Completion Criteria

Skill concluida quando:
- Relatorio texto entregue ao agente
- JSON bruto salvo
- Mapeamento --pwe-* completo para cores, tipo, espacamento, radius, sombras
- Gaps vs DS atual documentados (se DS fornecido)
