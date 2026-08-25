---
name: pwe-generate-child-theme

description: >
  Gera os arquivos do tema filho Hello Elementor: style.css com tokens CSS
  custom properties, functions.php com enqueue e theme supports, e screenshot
  placeholder. Preserva integralmente a arquitetura definida pela skill pwe-plan-theme.

version: 1.0.0

author: Pangolim Criativo

engine: Pangolim Web Engine

parent_agent: pwe-theme-builder

temperature: 0.0
---

# Mission

Gerar exclusivamente os arquivos do tema filho.
Esta skill não altera arquitetura.
Esta skill não modifica o tema pai.

# Inputs

Recebe:

- Arquitetura aprovada (da pwe-plan-theme)
- Design System
- Nome do tema filho
- Padrões obrigatórios: .opencode/standards/pwe-elementor-free-rules.md

# Process

## 1. Gerar style.css

O arquivo style.css DEVE conter:

a) **Header obrigatório do WordPress** (comentário no topo):
```css
/*
Theme Name: {nome-tema-filho}
Theme URI: https://pangolim.com.br
Author: Pangolim Criativo
Author URI: https://pangolim.com.br
Description: Tema filho do Hello Elementor configurado pelo Pangolim Web Engine
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: {slug-tema}
Template: hello-elementor
Tags: elementor, child-theme, wordpress
*/
```

b) **CSS Custom Properties no :root** com TODOS os tokens do DS:
```css
:root {
  /* Cores */
  --pwe-color-primary: {valor};
  --pwe-color-secondary: {valor};
  /* ... todos os tokens de cores do DS */

  /* Tipografia */
  --pwe-font-family-heading: {valor};
  --pwe-font-family-body: {valor};
  --pwe-font-size-xs: {valor};
  /* ... todos os tokens de tipografia */

  /* Espaçamentos */
  --pwe-space-xs: {valor};
  /* ... todos os tokens de espaçamento */

  /* Border Radius */
  --pwe-radius-sm: {valor};
  /* ... */

  /* Sombras */
  --pwe-shadow-sm: {valor};
  /* ... */

  /* Breakpoints (como custom properties para uso em media queries via JS se necessário) */
  --pwe-breakpoint-tablet: {valor};
  --pwe-breakpoint-desktop: {valor};
}
```

c) **Reset/override mínimo** para garantir que o Hello respeita os tokens:
```css
/* Sobrescrever fontes do Hello com tokens do DS */
body,
.elementor-widget-heading .elementor-heading-title {
  font-family: var(--pwe-font-family-body);
}

h1, h2, h3, h4, h5, h6,
.elementor-widget-heading .elementor-heading-title {
  font-family: var(--pwe-font-family-heading);
}
```

NUNCA incluir regras que conflitem com o CSS do Elementor.
NUNCA incluir estilos de componentes (isso é trabalho do pwe-elementor-architect).

## 2. Gerar functions.php

O arquivo functions.php DEVE conter:

a) **Enqueue de estilos** (pai + filho):
```php
<?php
/**
 * {Nome do Tema Filho} - functions.php
 * Gerado pelo Pangolim Web Engine
 */

add_action( 'wp_enqueue_scripts', function() {
    // Estilo do tema pai (Hello Elementor)
    wp_enqueue_style(
        'hello-elementor-parent',
        get_template_directory_uri() . '/style.css'
    );

    // Estilo do tema filho
    wp_enqueue_style(
        '{slug-tema}-child',
        get_stylesheet_directory_uri() . '/style.css',
        array( 'hello-elementor-parent' ),
        wp_get_theme()->get( 'Version' )
    );
} );
```

b) **Theme supports** do Hello (ativar conforme necessidade):
```php
// Theme supports herdados do Hello
add_theme_support( 'title-tag' );
add_theme_support( 'post-thumbnails' );
add_theme_support( 'html5', array(
    'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'
) );
add_theme_support( 'customize-selective-refresh-widgets' );
```

NUNCA incluir functions.php com erros de sintaxe.
NUNCA incluir dependências externas.
NUNCA usar curtos demais (manter legível).

## 3. Gerar screenshot placeholder

Criar um arquivo PNG simples (1x1 pixel ou placeholder文字) em `screenshot.png`.
Informar ao usuário que ele deve substituir por um screenshot real (1200x900px recomendado).

# Output

Entregar:

- `.opp/themes/{nome-kebab}/style.css`
- `.opp/themes/{nome-kebab}/functions.php`
- `.opp/themes/{nome-kebab}/screenshot.png` (placeholder)

Onde `{nome-kebab}` é o slug do tema em kebab-case.

# Validation

Antes de finalizar:

- [ ] style.wordpress Header está correto (Theme Name, Template: hello-elementor)
- [ ] Todos os tokens --pwe-* do DS estão no :root
- [ ] functions.php tem <?php na primeira linha
- [ ] functions.php não tem erros de sintaxe
- [ ] Enqueue está correto (pai → filho)
- [ ] Nenhuma cor hardcodada no style.css
- [ ] Arquivos salvos em .opp/themes/{slug}/

# Rules

Nunca alterar o tema pai.
Nunca gerar CSS de componentes.
Nunca gerar JavaScript.
Nunca utilizar Elementor Pro.
Sempre usar tokens --pwe-*.
