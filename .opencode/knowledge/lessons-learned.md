# Base de Conhecimento: Aprendizados e Prevenção de Erros (Pangolim Web Engine)

## 1. Erro Crítico: Página Branca (0 bytes) em Child Themes do WordPress
- **Sintoma:** O site retorna HTTP 200 OK mas com corpo de resposta vazio (0 bytes). O editor do Elementor entra em Safe Mode.
- **Causa Raiz 1 (Templates):** A presença de um arquivo index.php vazio ou básico no child theme faz com que o WordPress o utilize na hierarquia de templates, ignorando os templates do tema pai e gerando output vazio.
  - **Correção:** Nunca criar arquivos de template (index.php, page.php, etc.) no child theme a menos que seja necessário customizá-los explicitamente. Deixe o Hello Elementor gerenciar os templates.
- **Causa Raiz 2 (Encoding / BOM):** Arquivos salvos em UTF-8 com BOM (Byte Order Mark EF BB BF) inserem 3 bytes invisíveis antes dos headers HTTP, corrompendo o buffer de saída do PHP.
  - **Correção:** Sempre salvar arquivos PHP, CSS e JSON em **UTF-8 sem BOM**.

## 2. Padrão de JSON para Importação no Elementor
- O formato JSON aceito pelo importador de templates do Elementor requer a estrutura de página/container com chaves limpas, IDs hexadecimais de 7 caracteres e propriedades de flexbox corretas (flex_direction, flex_gap, etc.).
- O arquivo deve estar codificado estritamente em UTF-8 sem BOM.

## 3. Especificidade CSS (Cascading) vs Elementor Global Styles
- **Sintoma:** Estilos do tema filho (ex: cor de link ou heading) não se aplicam, sendo ignorados em favor das cores do Elementor Kit ou Reset.css do tema pai.
- **Causa:** O Elementor aplica cores globais (--e-global-color-*) com seletores de alta especificidade ou propriedades inline. O Reset do Hello Elementor aplica cores hardcoded para tags a.
- **Correção:** Usar seletores compostos (ex: .main-navigation a, .elementor-widget-heading .elementor-heading-title) e, se necessário, a flag !important para garantir a sobreposição das variáveis do Design System (--ppa-*).

## 4. Estilização de Containers no Elementor Free (Bugs de DOM e _css_classes)
- **Sintoma:** Classes CSS atribuídas via _css_classes em containers no JSON do Elementor não aparecem no HTML renderizado, deixando cards empilhados, sem borda ou sem efeito hover.
- **Causa Raiz:** O Elementor Free ignora a propriedade _css_classes para elementos do tipo container (só aplica em widget). Além disso, o Elementor injeta múltiplos wrappers .e-con-inner intermediários entre contêineres pai e filho, tornando seletores posicionais como > .e-child propensos a falhas de profundidade.
- **Correção Definitiva:**
  1. Inspecionar o HTML renderizado do site para obter os valores reais de data-id que o Elementor atribuiu aos containers.
  2. Mapear seletores CSS por `data-id` ou classe gerada `.elementor-element-{id}`. Não assumir wrappers `.e-con-inner`: containers Flexbox do Elementor Free podem renderizar containers-filhos como irmãos diretos.

## 5. Grid de Cards: JSON e CSS devem mirar o mesmo nível DOM
- **Sintoma:** Cards importados ficam em coluna única mesmo com `flex_direction: row` e `flex_wrap: wrap` no container pai.
- **Causa Raiz:** O JSON `categories-section.json` definiu `width: 100%` como valor desktop dos quatro cards; `width_tablet: 50%` não vale no desktop. CSS tentou compensar, mas selecionou `.e-con_inner` inexistente e esperava dois níveis extras de container. Logo não aplicou `display:flex`, `gap` nem `flex-basis` ao pai/células reais.
- **Árvore relevante:** `.elementor-element-f9b4d67` (grid) contém diretamente `.elementor-element-1ac5e78`, `.elementor-element-7acbe34`, `.elementor-element-d014a90`, `.elementor-element-367a0f6` (células); cada célula contém um container de card. Não há garantia de `.e-con-inner` nesta cadeia.
- **Regra:** Para todo grid, definir largura desktop no JSON (`width`) e CSS por IDs gerados do template. Estilizar pai grid e células externas; estilizar card no container interno. Não usar `:has()` para localizar nível de layout.
- **Validação obrigatória:** Após importar, obter HTML renderizado e confirmar: seletor retorna 1 grid, 4 células, `display:flex`, `flex-wrap:wrap` e `flex-basis` calculado no breakpoint desktop.

## 6. Implementação da Section "Nossas Categorias" — Arquitetura Estável para Elementor Free

### Contexto
Implementação da 3ª section ("Nossas Categorias") do site Papel Arte no Hello Elementor Child Theme, replicando a referência em React/Tailwind (Home.tsx:83-132) com 4 cards temáticos: Waldorf, Papelaria, Serviços Gráficos, Empresas e Escolas.

### Abordagens Tentadas (Evolução)

| Tentativa | Estratégia | Resultado |
|---|---|---|
| 1 | JSON Elementor nativo + CSS por IDs/data-id | **FALHOU**: IDs regenerados no import; CSS `:has()` + `.e-con-inner` não casou com DOM real |
| 2 | JSON nativo + CSS por IDs renderizados pós-import | **FALHOU**: IDs mudam a cada import; não portável |
| 3 | **HTML Widget Único + CSS por classes `.pa-*`** | **SUCESSO**: Importável, estável, sem dependência de IDs/Elementor internos |

### Solução Final (Vencedora)

**Arquitetura:**
```
elementor-templates/categories-section.json  →  1 container + 1 widget HTML
assets/categories-section.css               →  180 linhas, apenas classes .pa-*
```

**HTML do Widget (autossuficiente):**
```html
<section class="pa-categories-section" aria-labelledby="pa-categories-title">
  <div class="pa-categories-header">
    <div class="pa-categories-badge">Nossas Categorias</div>
    <h2 id="pa-categories-title" class="pa-categories-title">O que você precisa realizar hoje?</h2>
    <p class="pa-categories-intro">Porque grandes projetos...</p>
  </div>
  <div class="pa-categories-grid">
    <article class="pa-category-card pa-category-card--waldorf">...</article>
    <article class="pa-category-card pa-category-card--papelaria">...</article>
    <article class="pa-category-card pa-category-card--servicos">...</article>
    <article class="pa-category-card pa-category-card--empresas">...</article>
  </div>
</section>
```

**CSS Puro (sem dependências Elementor):**
```css
.pa-categories-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1280px;
  margin-inline: auto;
}

.pa-category-card {
  display: flex; flex-direction: column;
  padding: 32px; border-radius: 32px;
  transition: transform 300ms ease, box-shadow 300ms ease;
}

.pa-category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,.2);
}

.pa-category-card--waldorf  { --color: var(--ppa-mint); ... }
.pa-category-card--papelaria { --color: var(--ppa-sky); ... }
.pa-category-card--servicos { --color: var(--ppa-lilac); ... }
.pa-category-card--empresas { --color: var(--ppa-sand); ... }

@media (max-width: 1023px) { .pa-categories-grid { grid-template-columns: repeat(2, minmax(280px, 1fr)); } }
@media (max-width: 767px) { .pa-categories-grid { grid-template-columns: 1fr; } }
```

### Decisões Técnicas Críticas

| Decisão | Justificativa |
|---|---|
| **HTML Widget único** | Elementor Free preserva HTML literal; IDs não regeneram; CSS mira classes próprias `.pa-*` |
| **CSS Grid `minmax(280px, 1fr)`** | Garante largura mínima 280px (equivale `calc(25% - 24px)` do flexbox Soluções) |
| **CSS Grid vs Flexbox** | Grid nativo controla colunas sem `flex-basis`/`flex-shrink` complexos |
| **Variáveis CSS `--pa-category-*` por card** | DRY: fundo, borda, ícone, botão usam mesma variável de cor |
| **CSS Grid nativo (`repeat(4, minmax(280px, 1fr))`)** | Resposta nativa 1/2/4 colunas sem media queries complexas de flex-basis |
| **`minmax(280px, 1fr)`** | Garante largura mínima 280px (= `25% - 24px` gap) impedindo cards estreitos |
| **`flex-grow: 1` na descrição** | Alinha CTA no rodapé mesmo com textos de tamanhos diferentes |

### Tokens de Design System Utilizados

| Token | Uso |
|---|---|
| `--ppa-mint`, `--ppa-sky`, `--ppa-lilac`, `--ppa-sand` | Fundos dos 4 cards |
| `--ppa-green`, `--ppa-blue`, `--ppa-pink`, `--ppa-orange` | Ícones, botões, acentos |
| `--ppa-dark`, `--ppa-earth`, `--ppa-cream`, `--ppa-light-sand` | Textos, fundos, bordas |
| `--ppa-radius-3xl`, `--ppa-radius-xl`, `--ppa-radius-lg` | Bordas card, ícone, botão |
| `--ppa-font-heading` (Agbalumo), `--ppa-font-body` (Montserrat) | Tipografia |

### Resolução Final do Problema "Cards Estreitos"

| Seção | Grid | Largura mínima card |
|---|---|---|
| **Soluções** | Flexbox | `calc(25% - 24px)` ≈ 280px |
| **Categorias (corrigido)** | CSS Grid `minmax(280px, 1fr)` | **280px** (igual) |

**Patch aplicado:**
```css
.pa-categories-grid {
  grid-template-columns: repeat(4, minmax(280px, 1fr));
}
@media (min-width: 768px) and (max-width: 1023px) {
  .pa-categories-grid { grid-template-columns: repeat(2, minmax(280px, 1fr)); }
}
```

### Lições para Suíte PWE

1. **Nunca** use IDs do Elementor (JSON ou renderizados) em CSS de templates importáveis
2. **Nunca** assuma wrappers `.e-con-inner` ou estrutura DOM fixa
3. **Prefira** HTML Widget único + CSS por classes próprias `.pa-*`
4. **CSS Grid nativo** > Flexbox para grids responsivos com largura mínima
5. **Validação obrigatória:** `minmax(280px, 1fr)` garante largura mínima sem media queries extras
6. **Variáveis CSS por componente** (`--pa-category-color`) para DRY em temas de card

---

### Arquivos Entregues

```
wp/wp-content/themes/hello-elementor-child/
├── elementor-templates/
│   └── categories-section.json       # container + 1 widget HTML
├── assets/
│   └── categories-section.css        # 180 linhas, classes .pa-* apenas
└── functions.php                     # enqueue condicional is_front_page()
```

### Instalação
1. WP Admin → Modelos → Importar Modelos → `categories-section.json`
2. Inserir na Home via widget **Modelo** (substitua seção antiga)
3. `Ctrl+F5` para recarregar CSS

---

**Status:** ✅ APROVADO pelo @pwe-reviewer  
**Importável:** Sim (sem dependência de IDs/Elementor state)  
**Responsivo:** 1 col (<768px) → 2 col (768-1023px) → 4 col (≥1024px)  
**Hover:** `translateY(-4px)` + sombra elevada + borda laranja  
**Largura mínima card:** 280px (igual à section Soluções)
EOF