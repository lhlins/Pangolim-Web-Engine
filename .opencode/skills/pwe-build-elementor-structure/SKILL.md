---
name: pwe-build-elementor-structure

description: >
  Converte a arquitetura aprovada em uma especificacao tecnica baseada
  exclusivamente nos recursos do Elementor Free. Define containers,
  widgets, hierarquia, configuracoes nativas e pontos de extensao antes da
  geracao do JSON.

version: 1.0.0

author: Pangolim Criativo

engine: Pangolim Web Engine

parent_agent: pwe-elementor-architect

temperature: 0.1
---

# Mission

Transformar a arquitetura aprovada em um Blueprint tecnico para Elementor Free.

Esta skill nao gera JSON.

Seu objetivo e definir exatamente como o componente sera montado utilizando
os widgets e recursos nativos do Elementor Free.

---

# Inputs

Recebe:

* Arquitetura aprovada

* Wireframe

* Design System

* Inventario de limitacoes de widgets Elementor Free
  (.opencode/knowledge/elementor-limitations.md)

* Padroes obrigatorios: .opencode/standards/pwe-elementor-free-rules.md

---

# Process

1. Definir containers.

2. Definir containers internos.

3. Definir direcao dos Flex Containers.

4. Definir widgets.

5. Definir ordem dos widgets.

6. Definir classes CSS.

   ATENCAO: _css_classes em containers (e-con, e-con-boxed) NAO e renderizado
   no frontend pelo Elementor Free. Apenas widgets suportam _css_classes.
   Portanto, ao definir classes CSS, explicitar se cada classe e para widget
   (funciona) ou container (precisa de seletor alternativo - ver Observacoes).

7. Definir IDs quando necessarios.

8. Definir configuracoes nativas.

9. Validar consistencia entre gap e porcentagens em colunas.

    Ao definir containers com flex_direction: row e flex_wrap: wrap,
    verificar se a soma total nao excede 100% da largura do container pai:

      total = (N - 1) * G + N * W

    Onde:
      N = numero de colunas
      G = gap (em pixels ou unidade relativa)
      W = largura de cada coluna (em %)

    Se total > 100%, aplicar uma das correcoes:
      - Reduzir gap
      - Reduzir porcentagem de cada coluna
      - Remover flex_wrap (default no-wrap) se as colunas couberem sem wrap
      - Usar width: calc(50% - gap/2) em vez de 50% fixo

    Consultar .opencode/knowledge/elementor-flex-layout.md para estrategias
    detalhadas de resolucao.

    Registrar a verificacao e o ajuste aplicado no blueprint.

10. Definir content_width como string enum para cada container.

    NUNCA definir content_width como objeto (ex: `{"unit":"px","size":1280}`).
    O Elementor renderiza `'e-con-' . $content_width` — se for objeto, PHP gera
    classe `e-con-Array` → layout flex quebra → filhos empilham.

    Valores validos:
      - `"full"` — container largura total (recomendado para a maioria dos casos)
      - `"boxed"` — container com largura maxima do Elementor

    A largura maxima deve ser controlada via CSS complementar (max-width +
    margin-inline auto), nao via content_width.

    Consultar .opencode/knowledge/elementor-flex-layout.md secao 4.

10. Definir estilos que permanecerao no Elementor.

11. Definir estilos que deverao ir para CSS.

12. Identificar necessidades de JavaScript.

---

# Output

## Estrutura

## Containers

## Widgets

## Classes

## IDs

## Configuracoes Elementor

## CSS necessario

Mapear explicitamente:
- Estilos que o Elementor Free cobre nativamente.
- Lacunas conhecidas de widgets que demandam CSS complementar (ex: background em text-editor).
- Ajustes de `flex-basis` para containers flex row.
- Marcadores de gap a serem incluídos no CSS.

## JS necessario

## Observacoes tecnicas

### _css_classes em containers (Elementor Free)

_css_classes (custom CSS classes) em containers e ignorado pelo Elementor
Free no frontend. A propriedade pode ser definida no JSON, mas nao aparece
no HTML renderizado.

Consequencias:
- Nao e possivel adicionar classes CSS personalizadas em containers.
- Seletores CSS baseados em data-id sao instaveis (regenerados a cada
  importacao de template).
- E necessario usar estrategias de seletores CSS alternativos (ver skill
  generate-css, secao "Container Selector Strategy").

Regra:
- Classes CSS so devem ser definidas em widgets.
- Containers devem ser estilizados via seletores estruturais ou de atributo.

### Limitacoes de widgets Elementor Free

Consultar .opencode/knowledge/elementor-limitations.md para conhecer
propriedades que cada widget nao renderiza. Nao depender destas
propriedades nas configuracoes nativas do blueprint.

### Flex-basis nao gerado pelo Elementor Free

O Elementor Free pode nao gerar flex-basis/width no CSS para containers
filhos de um flex container row, mesmo que o JSON defina width: 50%.

Quando o blueprint definir 2+ colunas lado a lado:
1. Verificar se Elementor gerara flex-basis (nao gera em alguns casos)
2. Se nao gerar, registrar no blueprint a necessidade de CSS complementar
3. Documentar o seletor estrutural que sera usado no CSS

Consultar .opencode/knowledge/elementor-flex-layout.md secao 2.

### Renormalizacao do importer

Ao importar JSON, o Elementor pode renormalizar flex_gap e outras
propriedades de layout. Apos ajustes manuais no _elementor_data (via
WP-CLI), NAO re-importar o JSON — isso sobrescreve os ajustes.

Consultar .opencode/knowledge/elementor-flex-layout.md secao 3.

### content_width: sempre string enum

NUNCA definir content_width como objeto. Sempre string `"full"` ou `"boxed"`.

O Elementor renderiza `'e-con-' . $content_width`. Se for objeto PHP, gera
`e-con-Array` → todos os filhos empilham em coluna unica.

Para controlar largura maxima, usar CSS complementar:
```css
.componente { max-width: 1280px; margin-inline: auto; }
```

Consultar .opencode/knowledge/elementor-flex-layout.md secao 4.

---

# Rules

Sempre utilizar recursos nativos do Elementor Free.
Sempre reduzir quantidade de widgets.
Sempre reduzir profundidade da arvore.
Sempre reduzir containers desnecessarios.
Sempre reutilizar classes.
Nunca gerar JSON.
Nunca gerar CSS.
Nunca gerar JavaScript.
Nunca definir content_width como objeto — sempre string "full" ou "boxed".
