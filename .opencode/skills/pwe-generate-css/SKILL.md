---
name: pwe-generate-css

description: >
  Gera o CSS complementar necessário para componentes desenvolvidos com
  WordPress, Elementor Free e tema Hello, utilizando o Design System informado,
  priorizando recursos nativos do Elementor, performance, manutenção e baixo
  acoplamento.

version: 1.0.0
author: Pangolim Criativo
engine: Pangolim Web Engine
parent_agent: pwe-elementor-architect
temperature: 0.0

capabilities:
- css
- responsive-design
- design-system
- performance
- accessibility

permissions:
  read: true
  write: false
  edit: false
  bash: false

constraints:

- Nunca alterar a arquitetura definida.
- Nunca criar novos elementos HTML.
- Nunca criar widgets Elementor.
- Nunca gerar JavaScript.
- Nunca utilizar Elementor Pro.
- Nunca utilizar bibliotecas externas.
---

# Mission

Gerar somente o CSS complementar necessário para a implementação do componente para elementor free.
Esta skill transforma uma especificação visual e estrutural aprovada em código CSS organizado.
Seu objetivo é complementar o Elementor Free, não substituí-lo.

---

# Scope

Responsabilidades:

- Criar estilos complementares.
- Criar estados visuais.
- Criar animações baseadas em CSS.
- Criar responsividade.
- Utilizar tokens do Design System.
- Organizar classes CSS.
- Garantir manutenção futura.

---

# Non Scope

Não é responsabilidade desta skill:

- Definir layout.
- Escolher componentes.
- Criar estrutura Elementor Free.
- Criar estrutura Elementor Pro.
- Alterar Design System.
- Criar HTML.
- Criar JavaScript.
- Decidir experiência do usuário.

---

# Inputs

Recebe:

- Design System resumido.
- Arquitetura aprovada.
- Estrutura Elementor.
- Classes definidas no Blueprint.
- Lista de estilos necessários.
- Padrões obrigatórios: .opencode/standards/pwe-elementor-free-rules.md
- Inventário de limitações de widgets Elementor Free: .opencode/knowledge/elementor-limitations.md

---

# Process

Executar nesta ordem:

## 1. Verificar necessidade de CSS

Antes de gerar qualquer código, analisar:
- O Elementor Free já possui o recurso necessário?
- O estilo pode ser configurado diretamente no widget?
- O Design System já possui a regra?
- Consultar o inventário de limitações (.opencode/knowledge/elementor-limitations.md) para cada widget no componente. Se o widget não renderizar a propriedade desejada, gerar CSS completo para suprir a lacuna.
Se a resposta for sim, não gerar CSS redundante.

---

## 2. Identificar estilos necessários

Classificar:

- Estrutura.
- Aparência.
- Estados.
- Animações.
- Responsividade.

---

## 3. Aplicar Design System

Utilizar:

- Variáveis CSS existentes.
- Cores definidas no Design System.
- Escalas tipográficas Definidas no Design System.
- Espaçamentos Design System.
- Border radius Design System.
- Sombras Design System.

Nunca criar valores arbitrários quando existir uma definição no Design System.

---

## 4. Gerar CSS

Seguir:

- Mobile First.
- Baixa especificidade.
- Classes semânticas.
- Código organizado.

---

# CSS Architecture

Utilizar esta organização:

```css
/* =================================
   Component Name
================================= */

/* Variables */

/* Base */

/* Elements */

/* Modifiers */

/* States */

/* Responsive */
```

## Marcadores de Assertividade e Gaps (Obrigatório)

Quando for necessário gerar CSS complementar devido a limitações do Elementor Free (conforme `.opencode/knowledge/elementor-limitations.md`), incluir marcadores explícitos:

```css
/* ⚠️ COMPLEMENTAR: Elementor Free não suporta background_color em text-editor */
.ppa-hero__subtitle {
  background-color: var(--pwe-creme-areia);
}

/* ⚠️ REQUIRES MANUAL OVERRIDE: ajuste de flex-basis em colunas do container */
.ppa-cards__title + .e-con > .e-con {
  flex-basis: calc(33.333% - var(--pwe-gap, 16px)) !important;
}
```

Regras de marcação:
- Sempre declarar por que o CSS complementar foi necessário.
- Identificar a limitação nativa do widget ou container.
- Garantir transparência sobre o motivo de regras com `!important`.

---

# Naming Convention

Utilizar a convenção definida pelo projeto.

Caso não exista:

```css
.pwe-component

.pwe-component__element

.pwe-component--modifier
```

Exemplo:

```css
.pwe-hero

.pwe-hero__title

.pwe-hero--dark
```

---

# Container Selector Strategy

No Elementor Free, containers (e-con, e-con-boxed, e-con-full) NAO renderizam
_css_classes no frontend. Apenas widgets suportam classes personalizadas.

Isso torna inviavel usar seletores baseados em data-id para containers, pois
os IDs sao regenerados automaticamente pelo Elementor a cada importacao de
template.

## Regras para seletores de containers

Evitar (instavel / nao funciona):
- `[data-id^="card-"]` — IDs mudam a cada importacao
- `[data-id="5d902f2e"]` — valor concreto e temporario
- Classes CSS em containers — _css_classes e ignorado pelo Elementor Free

Preferir (estavel):

1. Classes de widgets como ancora + seletor estrutural:
   .ppa-cards__title + .e-con              /* irmao adjacente ao titulo */
   .ppa-cards__title + .e-con > .e-con     /* cards dentro do grid */

2. Atributos estaveis do container:
   .e-con[data-settings*="gradient"]       /* secao com fundo gradiente */
   .e-con[data-settings*="classic"]        /* secao com fundo solido */

3. Posicao estrutural relativa ao post-id:
   .elementor-10 > .e-con:nth-child(2)     /* 2a secao filha do post 10 */

4. Pseudoclasses estruturais para diferenciar itens:
   :first-child
   :nth-child(n)
   :last-child

## Exemplo

Dado este HTML renderizado pelo Elementor:
```html
<div class="e-con-inner">
  <div class="ppa-cards__title elementor-widget-heading">...</div>
  <div class="e-con e-child">          <!-- grid: irmao do titulo -->
    <div class="e-con e-child">Card 1</div>
    <div class="e-con e-child">Card 2</div>
    <div class="e-con e-child">Card 3</div>
  </div>
</div>
```

Usar:
```css
.ppa-cards__title + .e-con {           /* grid */
  display: flex; gap: 24px;
}
.ppa-cards__title + .e-con > .e-con {  /* cards */
  flex: 1 1 270px;
}
.ppa-cards__title + .e-con > .e-con:first-child::before {
  background: blue;
}
```

---

## Flex-basis complement

O Elementor Free pode nao gerar flex-basis para containers filhos de um
flex row. Quando o componente precisa de colunas com largura fixa (ex:
50% + 50%), adicionar CSS complementar:

```css
/* Container pai (usar seletor estrutural, NUNCA classe de container) */
.e-con[data-settings*="flex_direction_row"] > .e-con {
  flex-basis: calc(50% - var(--pwe-gap, 0px) / 2);
}
```

Se o blueprint especificou gap via flex_gap, usar o valor do gap no calc.
Se o blueprint removeu gap e usa padding interno, usar flex-basis: 50%.

Consultar .opencode/knowledge/elementor-flex-layout.md para detalhes.

Importante: quando necessario usar `!important` para sobrescrever CSS
inline do Elementor, registrar no relatorio da skill como excecao
justificada (o Elementor Free nao entrega flex-basis, entao o CSS
complementar e a unica forma).

---

## CSS por data-id morre apos importacao

### Problema

Seletores CSS baseados em `data-id` (ex: `.elementor-element-dif0020`)
funcionam no template original mas MORREM apos importacao em outra pagina.
O Elementor REGENERA todos os IDs ao importar um template.

### Solucao: JS injection + classes semanticas

Quando o componente precisa de classes CSS semanticas em containers
(ex: `.dif-header`, `.dif-cards`, `.dif-divider`, `.dif-features`), usar
o padrao JS injection:

1. **CSS**: definir estilos usando classes semanticas (`.dif-header`, etc.)
2. **JS**: injetar essas classes no DOM via JavaScript, usando widgets
   como ancora para encontrar containers:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Encontrar widget ancora (elementor-widget-divider e estavel)
  const divider = document.querySelector('.elementor-widget-divider');
  if (!divider) return;

  const section = divider.closest('.elementor-section, .e-con');
  if (!section) return;

  // injetar classes semanticas nos containers
  section.classList.add('dif-header');
  // ... injetar outras classes conforme necessidade
});
```

### Por que funciona

- Widgets como `.elementor-widget-divider` sao estaveis (nao mudam apos import)
- `closest()` navega a hierarquia DOM de forma estavel
- Classes semanticas no CSS sao independentes de IDs regenerados

### Regra

NUNCA usar seletores baseados em `data-id` no CSS complementar.
Sempre usar widget-ancora + `closest()` / `querySelector()` no JS.
Sempre injetar classes semanticas que o CSS possa usar.

Consultar .opencode/knowledge/elementor-limitations.md secao
"_css_classes em containers" e .opencode/skills/build-elementor-structure/SKILL.md.

---

Obrigatório:

- Mobile First.
- Evitar excesso de breakpoints.
- Utilizar apenas breakpoints necessários.
- Não duplicar propriedades sem necessidade.

Prioridade:

```text
Mobile

↓

Tablet

↓

Desktop
```

---

# Animation Rules

Animações devem:

- Ser leves.
- Utilizar CSS quando possível.
- Evitar causar impacto negativo em performance.

Preferir:

- transform
- opacity

Evitar:

- alterações frequentes de layout
- animações pesadas
- propriedades que causam reflow

Sempre considerar:

```css
@media (prefers-reduced-motion: reduce)
```

---

# Accessibility Rules

Garantir:

- Estados :hover.
- Estados :focus-visible.
- Contraste adequado.
- Legibilidade.
- Respeito à redução de movimento.

---

# Performance Rules

Evitar:

- !important.
- Seletores profundos.
- CSS duplicado.
- Regras globais.
- Overrides desnecessários.

Priorizar:

- Classes específicas.
- Reutilização.
- Código enxuto.

---

# Output

Entregar:

## Arquivo

`component.css` salvo em `.opp/components/{nome-kebab}/component.css`

Onde `{nome-kebab}` é o slug do componente em kebab-case.

## Relatório

Informar:

- Quantidade aproximada de regras criadas.
- Motivo de cada bloco.
- Recursos nativos do Elementor utilizados.
- Recursos que exigiram CSS personalizado.

---

# Validation

Antes de finalizar, validar:

□ Compatível com Elementor Free.

□ Compatível com Hello Theme.

□ Não depende de plugins.

□ Não altera Design System.

□ Não possui CSS desnecessário.

□ Responsivo.

□ Acessível.

□ Performático.

□ Organizado.

---

# Completion Criteria

A skill está concluída quando:

- O CSS complementar foi gerado.
- Nenhuma decisão arquitetural foi alterada.
- O arquivo está pronto para integração ao projeto.
