# Inventario de Limitacoes de Widgets Elementor Free

Este arquivo lista as propriedades que cada widget nativo do Elementor Free
NAO renderiza no frontend, mesmo quando configuradas no JSON ou na interface.

Use este inventario durante o blueprint (build-elementor-structure) para nao
depender de propriedades que serao ignoradas, e durante a geracao de CSS
(generate-css) para suprir via CSS as propriedades que o widget nao entrega.

---

## text-editor

| Propriedade nao renderizada | Alternativa |
|---|---|
| background_background | CSS no componente (`.ppa-*` class) |
| background_color | CSS no componente |

Observacao: O widget text-editor renderiza apenas o conteudo textual (HTML
do WYSIWYG). Configuracoes visuais do container/widget (background, borda,
sombra) NAO sao aplicadas. Todo estilo visual adicional deve vir do CSS.

---

## heading

| Propriedade nao renderizada | Alternativa |
|---|---|
| background_background | CSS no componente |
| background_color | CSS no componente |

Observacao: Similar ao text-editor. O heading renderiza o texto com a
tipografia configurada, mas ignora configuracoes de fundo.

---

## container (e-con, e-con-boxed, e-con-full)

| Propriedade nao renderizada / comportamento | Alternativa |
|---|---|
| _css_classes (custom CSS classes) | Seletor estrutural ou de atributo estavel |
| background_background (em alguns contextos) | CSS no componente |
| flex-basis / width para containers filhos | CSS complementar com !important e seletor estrutural |
| flex_gap (renormalizado pelo importer) | Ajustar via WP-CLI (wp post meta update) em vez de re-importar JSON |
| content_width como objeto (ex: `{unit:"px",size:1280}`) | Usar sempre string enum: `"full"` ou `"boxed"` (ver secao abaixo) |
| _elementor_edit_mode como "builder" | Definir sempre como `"elementor"` no post meta |

### _css_classes em containers

_css_classes em containers e silenciosamente ignorado pelo Elementor Free no
frontend. Nao e possivel adicionar classes CSS personalizadas em containers.
Usar widgets como ancora para seletores estruturais (ex: .ppa-title + .e-con),
atributos de configuracao (data-settings), ou posicao estrutural (nth-child).

### flex-basis nao gerado

O Elementor Free pode nao gerar flex-basis/width no CSS para containers filhos
de um flex container row, mesmo que o JSON defina width: 50%. Resultado: as
colunas ficam sem largura explicita e o layout fica imprevisivel.

Alternativa: adicionar via CSS complementar com !important:
```css
.e-con > .e-con { flex-basis: calc(50% - var(--gap) / 2); }
```
Usar seletores estruturais (ver generate-css, Container Selector Strategy).

### content_width como objeto gera classe e-con-Array

O Elementor renderiza a classe CSS do container concatenando `'e-con-' . $content_width`.
Se `content_width` for um objeto (ex: `{"unit":"px","size":1280}`), o PHP converte
o array para string "Array" → classe `e-con-Array` no HTML.

Efeito: containers perdem layout flex → todos filhos empilham em uma coluna.

Regra: NUNCA usar content_width como objeto. Usar sempre string enum:
- `"full"` — container largura total
- `"boxed"` — container com largura maxima

A largura maxima deve ser controlada via CSS complementar (max-width + margin-inline auto).

### _elementor_edit_mode deve ser "elementor"

O post meta `_elementor_edit_mode` controla se o Elementor renderiza o conteudo
de uma pagina. Valores validos: `"elementor"` (renderiza) ou ausente.

Se o valor for `"builder"` (ou qualquer outro), o Elementor ignora o conteudo
e renderiza apenas a shell HTML do tema Hello → pagina vazia.

Apos manipular `_elementor_data` via script PHP, verificar sempre:
```php
update_post_meta($post_id, '_elementor_edit_mode', 'elementor');
```

### _elementor_data corrompido por roundtrip do WordPress

WordPress aplica `addslashes()` ao salvar `post_meta` via `update_post_meta()`
e `stripslashes_deep()` ao ler via `get_post_meta()`. Para JSON complexo com
backslash sequences (unicode escapes `\uXXXX`), o roundtrip corrompe os dados.

Evidencia: `json_decode()` retorna NULL apos update_post_meta + get_post_meta,
mesmo com JSON valido originalmente.

Solucao: gravar direto via `$wpdb->query()` com `$wpdb->prepare('%s', $data)`,
bypassando completamente o layer de metadata do WordPress:
```php
global $wpdb;
$wpdb->query($wpdb->prepare(
  "UPDATE {$wpdb->postmeta} SET meta_value = %s WHERE post_id = %d AND meta_key = '_elementor_data'",
  $data, $post_id
));
```

### Renormalizacao do importer

Ao importar JSON via Elementor, o importer pode renormalizar propriedades
como flex_gap, removendo ajustes manuais aplicados via WP-CLI. O Elementor
reinterpreta o flex_gap e pode causar overflow quando combinado com colunas
de width fixo (ex: 50% + 50% + gap > 100%).

Alternativa: apos importar JSON, aplicar ajustes no _elementor_data
diretamente via WP-CLI (`wp post meta update` ou `wp eval-file`) em vez
de re-importar o JSON. Isso preserva as configuracoes sem renormalizacao.

---

## image

| Propriedade nao renderizada | Alternativa |
|---|---|
| Nenhuma conhecida | — |

---

## button

| Propriedade nao renderizada | Alternativa |
|---|---|
| Nenhuma conhecida | — |

---

## icon

| Propriedade nao renderizada | Alternativa |
|---|---|
| Nenhuma conhecida | — |

---

## spacer

| Propriedade nao renderizada | Alternativa |
|---|---|
| Nenhuma conhecida | — |

---

## divider

| Propriedade nao renderizada | Alternativa |
|---|---|
| Nenhuma conhecida | — |

---

## OPcache em ambientes ddev

O OPcache do PHP-FPM dentro de containers ddev persiste apos correcoes
de arquivos PHP no host (WSL). Efeitos:
- `php -l` no host retorna "No syntax errors" (arquivo ja corrigido)
- O container continua servindo a versao antiga via OPcache
- Paginas retornam shell HTML vazio mesmo com codigo PHP correto

Solucao: sempre executar `ddev restart` apos corrigir erros de parse em
arquivos PHP do tema ou plugin. Isso reinicia o PHP-FPM e limpa o OPcache.

Verificar via `ddev logs` — parse errors persistem enquanto OPcache nao
for limpo.

---

## WordPress data persistence

### addslashes / stripslashes roundtrip

WordPress aplica addslashes ao salvar post_meta e stripslashes ao ler.
Para JSON com unicode escapes (\uXXXX), o roundtrip corrompe o JSON.

Alternativas:
1. Gravar via $wpdb->query() com $wpdb->prepare() — bypassa metadata layer
2. Usar file_put_contents() + importacao via WP-CLI
3. Evitar wp_json_encode() + update_post_meta() para JSON complexo

### WP-CLI stdin limitation

`wp post meta update --format=raw` nao aceita JSON via stdin em todos os
contextos. Parameter errors podem ocorrer.

Alternativa: usar `wp eval-file` com script PHP que grava via $wpdb.

---

## Regra geral

Sempre que uma propriedade visual (background, border, box-shadow, etc.)
for necessaria em um widget que nao a renderiza, o CSS do componente
deve fornecer o estilo completo. Nao confiar em configuracoes inline do
Elementor para widgets listados acima como limitados.

Qualquer nova limitacao descoberta deve ser adicionada a este inventario.
