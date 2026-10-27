---
name: pwe-analyze-site-structure

description: >
  Extrai e estrutura a hierarquia DOM de um site: containers, wrappers, semantic tags,
  componentes visuais identificaveis, grid/flex layout, hierarquia de headings,
  landmarks ARIA, e mapeamento para vocabulário Elementor Free (section, container, widget).

version: 1.0.0
author: Pangolim Criativo
engine: Pangolim Web Engine
parent_agent: pwe-site-analyst
temperature: 0.0
capabilities:
  - dom-parsing
  - html-analysis
  - semantic-analysis
  - layout-detection
constraints:
  - Nunca gerar JSON Elementor
  - Nunca decidir arquitetura de componente
  - Sempre mapear achados para terminologia Elementor Free
---

# Mission

Inspecionar HTML disponível via `webfetch` ou fornecido pelo usuário e resumir a estrutura aparente para o vocabulário do Elementor Free. Não há parser DOM executável nesta skill; paths e seletores são aproximações inferidas do texto recebido.

---

# Inputs

- URL consultada com a ferramenta `webfetch` (se disponível) OU HTML bruto fornecido pelo usuário
- Modo: "full" (pagina inteira) | "section" (seletor CSS/XPath especifico)

---

# Process

## 1. Obter e inspecionar evidências

- Para URL, usar `webfetch` quando disponível e registrar exatamente o que retornou.
- Não afirmar status HTTP, timeout, redirects, Content-Type ou fetch de HTML bruto se a ferramenta não exibir esses dados.
- Para HTML fornecido, analisar somente o trecho recebido.
- Inspecionar `<head>` apenas se estiver presente no conteúdo.
- Se a resposta for resumida, incompleta ou não contiver HTML, declarar análise parcial e não inventar árvore DOM.

## 2. Identificar Containers Principais

Percorrer DOM e classificar cada no container-like:

| Tipo Elementor | Seletores/Heuristicas |
|----------------|----------------------|
| Section (section, .elementor-section) | section, [role="region"], main > div[class*="section"], div[class*="container"] |
| Container (flex) | div[style*="display: flex"], div[class*="flex"], .container, .wrapper, .row |
| Grid Container | div[style*="display: grid"], div[class*="grid"] |
| Wrapper/Inner | div[class*="inner"], div[class*="content"], div[class*="wrap"] |

Para cada container detectado, registrar:
- Seletor CSS unico (path from body)
- Tipo inferido (section/container/grid/wrapper)
- `display` declarado inline ou identificado em CSS fornecido; nunca chamar de computed
- `flex-direction` / `grid-template-columns` somente quando houver declaração explícita no conteúdo
- gap (se detectado)
- width/max-width constraints
- Padding/margin significativos

## 3. Mapear Widgets/Componentes Visuais

Identificar elementos que correspondem a widgets Elementor Free:

| Widget Elementor | Heuristicas de Deteccao |
|------------------|-------------------------|
| Heading | h1-h6, [class*="heading"], [class*="title"] |
| Text Editor | p, div[class*="text"], div[class*="content"], article |
| Image | img, picture, [class*="image"], [class*="img"] |
| Button | button, a[class*="btn"], a[class*="button"], input[type="submit"] |
| Icon | i[class*="icon"], svg[class*="icon"], [class*="fa-"], [class*="material-icons"] |
| Divider | hr, [class*="divider"], [class*="separator"], [class*="line"] |
| Spacer | div[class*="spacer"], div[style*="height:"](vazio) |
| Icon Box | [class*="icon-box"], [class*="feature-box"] (icon + heading + text) |
| Image Box | [class*="image-box"] (image + heading + text) |
| Testimonial | [class*="testimonial"], [class*="review"], [class*="quote"] |
| Counter | [class*="counter"], [class*="count"], [data-count] |
| Progress | [class*="progress"], [role="progressbar"] |
| Tabs | [role="tablist"], [class*="tabs"] |
| Accordion | [class*="accordion"], [class*="collapse"], details/summary |
| Video | video, iframe[src*="youtube"], iframe[src*="vimeo"] |
| Form | form, [class*="form"], input, textarea, select |
| Gallery | [class*="gallery"], [class*="grid"] > img (multiplos) |
| Carousel/Slider | [class*="slider"], [class*="carousel"], [class*="swiper"], [data-flickity] |

Para cada widget detectado:
- Seletor CSS unico
- Tipo widget inferido
- Conteudo textual (para heading/text: innerText ate 200 chars)
- Atributos relevantes (src, href, alt, role, aria-*)
- Classes CSS (para mapear estilos depois)

## 4. Hierarquia de Headings (Outline)

Extrair outline h1-h6:
- Verificar se ha h1 unico
- Sequencia logica (h1 > h2 > h3...)
- Registrar secoes implicitas

## 5. Landmarks ARIA & Semantic HTML

Mapear:
- header, nav, main, aside, footer
- section[aria-labelledby], article
- role="banner", "navigation", "main", "complementary", "contentinfo"
- skip links

## 6. Layout Analysis

Para cada container flex/grid:
- Direcao (row/col/row-reverse/col-reverse)
- Wrap (wrap/nowrap/wrap-reverse)
- Justify-content / align-items / align-content
- Gap (row-gap, column-gap, gap)
- Numero de filhos diretos
- Distribuicao de largura dos filhos (%, px, fr, auto)

## 7. Responsividade (indícios estáticos)

Procurar:
- Media queries no CSS inline/linked (extrair breakpoints)
- Classes responsivas (Tailwind: sm: md: lg: xl: 2xl:, Bootstrap: col-sm- col-md- col-lg-)
- picture/srcset em imagens
- Viewport meta tag

---

# Output

Os dados ilustrativos abaixo são apenas formato. Não reutilizar como achados; substituir por valores com evidência ou marcar `não observado`.

## Relatorio Texto (para agente)

Este é um formato de relatório, não uma garantia de parsing. Preencher somente campos evidenciados no HTML/CSS recebido. Em cada path/seletor, marcar `observado` ou `inferido`; deixar `não observado` quando o conteúdo não sustentar conclusão.

\\\
ESTRUTURA DOM - [URL]
Timestamp: [ISO 8601]

=== CONTAINERS PRINCIPAIS ===
1. [seletor] - Tipo: [section|container|grid|wrapper]
   Display declarado/indício: [valor ou não observado] | Direction: [valor ou não observado] | Wrap: [valor ou não observado]
   Gap: [valor] | Children: [N] | Width: [constraint]
   Padding: [valores] | Margin: [valores]
   Classes: [lista]
   -> Mapeamento Elementor: [Section/Container/Inner Section]

=== WIDGETS/COMPONENTES ===
[seletor] - Widget: [tipo] | Conteudo: "[preview]" | Classes: [classes]

=== OUTLINE HEADINGS ===
h1: "[texto]" (seletor)
  h2: "[texto]" (seletor)
    h3: "[texto]" (seletor)

=== LANDMARKS ===
header: [seletor] | nav: [seletor] | main: [seletor] | footer: [seletor]

=== LAYOUTS FLEX/GRID ===
   [container seletor]: direction=[observada/inferida/não observada] wrap=[observado/inferido/não observado] gap=[X/não observado] children=[contagem do trecho]
  Child 1: width=[%] | Child 2: width=[%] ...

=== RESPONSIVIDADE ===
Breakpoints detectados: [lista px]
Classes responsivas: [Tailwind/Bootstrap/custom]
Viewport meta: [content]
\\\

## JSON Bruto (arquivo \structure-[domain]-[timestamp].json\)

\\\json
{
  "url": "https://...",
  "timestamp": "2026-08-14T...",
  "containers": [
    {
      "selector": "body > main > div:nth-child(1)",
      "type": "section",
      "display": "flex",
      "direction": "column",
      "gap": "32px",
      "childrenCount": 3,
      "classes": ["hero", "section"],
      "styles": {"padding": "80px 24px", "maxWidth": "1200px"},
      "elementorMapping": "Section"
    }
  ],
  "widgets": [
    {"selector": "h1.hero__title", "type": "heading", "content": "Titulo Principal", "classes": ["hero__title"]}
  ],
  "headingsOutline": [
    {"level": 1, "text": "Titulo Principal", "selector": "h1.hero__title"},
    {"level": 2, "text": "Subtitulo", "selector": "h2.section__subtitle"}
  ],
  "landmarks": {"header": "header.site-header", "main": "main", "footer": "footer.site-footer"},
  "layouts": [
    {"container": "div.hero__grid", "display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "24px", "children": 2}
  ],
  "responsive": {
    "breakpoints": [640, 768, 1024, 1280],
    "framework": "tailwind",
    "viewportMeta": "width=device-width, initial-scale=1"
  }
}
\\\

---

## Limites de interpretação

- Não há execução de JavaScript nem renderização de navegador.
- Não calcular estilos computados nem afirmar layout responsivo efetivo.
- Classes como `md:grid` são indícios de convenção, não prova de que a classe esteja definida ou carregada.
- Rotular cada path/seletor como inferido quando não puder ser localizado literalmente no HTML.

# Validation

Antes de finalizar:
- [ ] Fonte e limites do conteúdo analisado declarados
- [ ] Pelo menos 1 container principal identificado
- [ ] Widgets mapeados para tipos Elementor Free validos
- [ ] Seletores CSS unicos para cada no reportado
- [ ] Mapeamento Elementor explicito para cada container/widget

---

# Completion Criteria

Skill concluida quando:
- Relatorio texto entregue ao agente
- JSON salvo somente quando a gravação realmente ocorreu; caso contrário declarar que não foi salvo
- Paths/selectors distinguem evidência literal de inferência
