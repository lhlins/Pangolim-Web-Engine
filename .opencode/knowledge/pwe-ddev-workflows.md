# Workflows ddev para Pangolim Web Engine

Este documento documenta operacoes comuns no ambiente ddev e armadilhas
conhecidas. Deve ser consultado durante qualquer operacao que envolva
WordPress, PHP-FPM ou containers ddev.

---

## 1. Limpar OPcache apos correcao de PHP

### Problema

O OPcache do PHP-FPM dentro de containers ddev persiste apos correcoes
de arquivos PHP no host (WSL). O container continua servindo a versao
antiga mesmo com o arquivo corrigido no disco.

### Sintomas

- `php -l` no host retorna "No syntax errors"
- `ddev logs` mostra parse errors repetidos
- Paginas retornam shell HTML vazio sem nenhum widget
- `file_get_contents()` do container le o arquivo correto, mas o PHP
  continua servindo a versao com erro

### Solucao

```bash
ddev restart
```

Isso reinicia o PHP-FPM e limpa o OPcache. Nao basta corrigir o arquivo —
o restart e obrigatorio.

### Verificacao

```bash
ddev logs --tail=20
```

Confirmar que nao ha mais parse errors. Se houver, verificar se o arquivo
foi sincronizado corretamente para o container.

---

## 2. Gravar _elementor_data sem roundtrip do WordPress

### Problema

WordPress aplica `addslashes()` ao salvar `post_meta` via `update_post_meta()`
e `stripslashes_deep()` ao ler via `get_post_meta()`. Para JSON complexo com
unicode escapes (`\uXXXX`), o roundtrip corrompe os dados.

### Sintomas

- `json_decode(get_post_meta(...))` retorna NULL
- `file_get_contents()` do arquivo JSON le dados validos
- Apos `update_post_meta()` + `get_post_meta()`, JSON e invalido

### Solucao: gravar via $wpdb

Usar `wp eval-file` com script PHP que grava direto via `$wpdb`:

```php
<?php
$json_file = '/var/www/html/wp-content/uploads/path/to/component.json';
$data = file_get_contents($json_file);
$post_id = 10;

if (json_decode($data) === null) {
    echo "JSON invalido\n";
    exit(1);
}

global $wpdb;
$result = $wpdb->query($wpdb->prepare(
    "UPDATE {$wpdb->postmeta} SET meta_value = %s
     WHERE post_id = %d AND meta_key = '_elementor_data'",
    $data, $post_id
));

if ($result !== false) {
    echo "Sucesso: _elementor_data atualizado para post $post_id\n";
} else {
    echo "Erro: falha ao atualizar\n";
}
```

Executar:
```bash
ddev wp eval-file wp-content/uploads/path/to/script.php
```

### Verificacao

```php
<?php
$post_id = 10;
$data = get_post_meta($post_id, '_elementor_data', true);
$decoded = json_decode($data);
if ($decoded !== null) {
    echo "OK: JSON valido, " . count($decoded) . " elementos\n";
} else {
    echo "ERRO: JSON invalido\n";
}
```

Executar:
```bash
ddev wp eval-file wp-content/uploads/path/to/verify.php
```

---

## 3. Verificar _elementor_edit_mode

### Problema

Apos manipulacao de `_elementor_data`, o post meta `_elementor_edit_mode`
pode ficar como `"builder"` em vez de `"elementor"`, impedindo o Elementor
de renderizar o conteudo.

### Verificacao

```bash
ddev wp post meta get 10 _elementor_edit_mode
```

### Correcao

```bash
ddev wp post meta update 10 _elementor_edit_mode elementor
```

### Apos correcao, sempre limpar cache do Elementor

```bash
ddev wp elementor flush_css
```

---

## 4. Verificar renderizacao de pagina

### Metodo 1: curl no container

```bash
ddev exec curl -s http://localhost/ | wc -c
```

Se o tamanho for muito pequeno (< 50KB para uma pagina complexa), algo
esta errado com o render.

### Metodo 2: verificar HTML especifico

```bash
ddev exec curl -s http://localhost/ | Select-String -Pattern "e-con"
```

Se nao houver nenhuma classe `e-con`, o Elementor nao esta renderizando.

### Metodo 3: verificar classes incorretas

```bash
ddev exec curl -s http://localhost/ | Select-String -Pattern "e-con-Array"
```

Se encontrar `e-con-Array`, ha containers com `content_width` como objeto.

---

## 5. WP-CLI via stdin

### Problema

`wp post meta update --format=raw` pode retornar "Parameter errors" ao
tentar ler JSON via stdin em alguns contextos.

### Solucao

Usar `wp eval-file` com script PHP customizado que le o JSON de arquivo
e grava via `$wpdb`. Ver secao 2 deste documento.

---

## 6. Sincronizacao host-container

### Regra

Arquivos PHP corrigidos no host (WSL) nao sao refletidos imediatamente
no container devido ao OPcache. Sempre executar `ddev restart` apos:
- Corrigir erros de parse em PHP
- Alterar functions.php
- Alterar arquivos de plugin customizado

Arquivos de upload (JSON, CSS, imagens) sao compartilhados via bind mount
e nao precisam de restart.

---

## Referencia cruzada

- `.opencode/knowledge/pwe-elementor-limitations.md` — limitacoes por widget
  e armadilhas do WordPress (addslashes, OPcache, edit_mode)
- `.opencode/skills/pwe-generate-elementor-json/SKILL.md` — geracao de JSON
- `.opencode/skills/pwe-build-elementor-structure/SKILL.md` — blueprint

