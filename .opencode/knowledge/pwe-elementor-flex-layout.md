# Limitacoes de Flex Layout no Elementor Free

Este documento documenta armadilhas conhecidas do flex layout no Elementor
Free e as solucoes validadas. Deve ser consultado durante build-elementor-structure,
generate-elementor-json e generate-css.

---

## 1. Overflow por flex_gap com colunas percentuais

### Problema

Quando um container flex com `flex_direction: row` e `flex_wrap: wrap` tem
`flex_gap` definido e filhos com `width: 50%`, o layout quebra:

```
50% + 50% + gap(30px) = 100% + 30px > 100% → wrap → colunas empilhadas
```

O Elementor Free aplica `gap` via `row-gap` e `column-gap` no CSS, mas NAO
reduz automaticamente a largura dos filhos para compensar.

### Formula de verificacao

```
total = (N - 1) * G + N * W
```

- N = numero de colunas
- G = gap (px ou unidade)
- W = largura de cada coluna (%)

Se `total > 100%`, o layout quebra.

### Solucoes

**Opcao A: Remover gap, usar padding interno (recomendada)**
- Containers filhos: `width: 50%`, sem gap
- Padding interno nos filhos para espaçamento
- Overflow hidden no container pai para conter bordas internas

**Opcao B: Usar calc() com gap**
- Containers filhos: `width: calc(50% - gap/2)`
- Funciona mas exige CSS complementar (Elementor Free nao gera calc())

**Opcao C: Reduzir gap para valor compativel**
- Se gap = 20px e 2 colunas: `width: calc(50% - 10px)`
- Validar que `total <= 100%`

---

## 2. flex-basis nao gerado pelo Elementor

### Problema

O Elementor Free pode nao gerar `flex-basis` ou `width` no CSS para
containers filhos, mesmo quando `width: 50%` esta definido no JSON.

Resultado: colunas sem largura explicita, comportamento imprevisivel em
diferentes viewports.

### Solucao

Adicionar via CSS complementar usando seletores estruturais:
```css
/* Container pai com gap */
.elementor-section > .e-con-inner > .e-con:nth-child(2) {
  flex-basis: calc(50% - var(--gap) / 2);
}

/* Container pai sem gap */
.elementor-section > .e-con-inner > .e-con {
  flex-basis: 50%;
}
```

Importante: usar `!important` quando necessário para sobrescrever o CSS
inline do Elementor.

---

## 3. Renormalizacao do importer

### Problema

Ao importar JSON via Elementor (interface ou CLI), o importer pode
renormalizar propriedades como `flex_gap`, removendo ajustes manuais
que foram aplicados diretamente no `_elementor_data` via WP-CLI.

### Causa

O importer reaplica suas proprias regras de validacao sobre os dados,
interpretando `flex_gap` como valor do Elementor e recalculando layout.

### Solucao

1. Importar JSON apenas uma vez (para popular a estrutura base)
2. Aplicar ajustes no `_elementor_data` via `$wpdb` executando SQL via `wp eval-file` (conforme documentado em `pwe-ddev-workflows.md`).
   > **Aviso:** Evite usar `update_post_meta()` ou `wp post meta update`, pois a sanitização com `addslashes()` pode corromper sequências de escape Unicode (`\uXXXX`) em JSONs complexos. Atualização direta via `$wpdb` com `wp eval-file` é necessária nesses casos.
3. NUNCA re-importar JSON apos ajustes manuais no banco

---

## 4. Classe e-con-Array por content_width incorreto

### Problema

Quando `content_width` e definido como objeto (`{"unit":"px","size":1280}`)
em vez de string enum (`"full"` ou `"boxed"`), o renderer PHP do Elementor
executa `'e-con-' . $content_width`. O PHP converte o array para string "Array",
gerando a classe `e-con-Array` no HTML.

### Efeito

A classe `e-con-Array` nao corresponde a nenhuma regra CSS do Elementor.
O container perde completamente o layout flex → todos os filhos empilham
verticalmente em uma unica coluna.

### Diagnostico

Procurar por `e-con-Array` no HTML renderizado:
```html
<div class="e-con e-con-full e-con-Array">
```

Se encontrado, o JSON contem `content_width` como objeto. Corrigir para string.

### Correcao

No JSON do Elementor, substituir:
```json
"content_width": {"unit": "px", "size": 1280}
```
Por:
```json
"content_width": "full"
```

Controlar largura maxima via CSS complementar:
```css
.meio-diferenciais {
  max-width: 1280px;
  margin-inline: auto;
}
```

### Prevencao

Na skill build-elementor-structure, NUNCA definir content_width como objeto.
Na skill generate-elementor-json, validar que todo content_width e string
("full" ou "boxed").

---

## 5. Checklist obrigatorio antes de gerar JSON

Ao gerar JSON com containers flex row + wrap:

- [ ] Calcular `total = (N-1)*G + N*W` e confirmar `total <= 100%`
- [ ] Se gap > 0 e colunas 50%: ajustar width para `calc(50% - gap/2)`
- [ ] Verificar se flex-basis sera gerado; se nao, documentar necessidade
      de CSS complementar
- [ ] Se colunas 50% com gap fixo (ex: 30px): considerar remover gap e
      usar padding interno
- [ ] Documentar no blueprint a estrategia de gap escolhida
- [ ] NENHUM container com content_width como objeto — sempre string "full" ou "boxed"

---

## Referencia cruzada

- `.opencode/knowledge/pwe-elementor-limitations.md` — limitacoes por widget
- `.opencode/skills/generate-css/SKILL.md` — Container Selector Strategy
- `.opencode/skills/build-elementor-structure/SKILL.md` — etapa 9 (validacao gap)

