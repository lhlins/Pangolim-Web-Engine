# Elementor Free Standards — Pangolim Web Engine

Este arquivo define as regras imutáveis para a geração de componentes no Elementor Free. Qualquer violação destas regras é considerada um erro crítico.

## 1. Containers (Flexbox)
- **content_width**: Deve ser sempre string `"full"` ou `"boxed"`. Nunca utilizar objetos como `{"unit": "px", "size": 1280}`.
- **_css_classes**: Proibido definir `_css_classes` em containers (e-con, e-con-boxed). O Elementor Free não renderiza classes em containers no frontend. Use seletores estruturais ou adicione classes apenas em widgets.

## 2. CSS & Estilos
- **Seletores**: Proibido utilizar `data-id` como seletor CSS (é volátil). Utilize classes semânticas (`.ppa-nome-elemento`) ou seletores hierárquicos.
- **Cores**: Sempre utilizar variáveis CSS (`var(--pwe-...)`) definidas no Design System. Nunca hardcode de cores, exceto em testes rápidos (e proibido em produção).
- **Responsividade**: Preferir `clamp()` para tamanhos fluidos. Seguir os breakpoints definidos no `design-system.md`.

## 3. JSON Structure
- **BOM (Byte Order Mark)**: Arquivos JSON gerados não podem conter BOM (UTF-8 with BOM). Apenas UTF-8 puro.
- **Parser**: Todo arquivo JSON deve ser validado via `JSON.parse()` antes da entrega.

## 4. JavaScript
- **Isolamento**: Todo script deve estar envolto em IIFE `(function(){ ... })();` ou ser modular para evitar conflitos globais.
- **Bibliotecas**: Proibido utilizar dependências externas. Vanilla JS apenas.

