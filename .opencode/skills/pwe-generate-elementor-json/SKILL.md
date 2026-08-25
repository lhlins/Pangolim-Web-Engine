---
name: pwe-generate-elementor-json

description: >
  Converte a estrutura aprovada do componente em um arquivo JSON compatível
  com o Elementor Free, preservando integralmente a arquitetura definida pelas
  etapas anteriores.

version: 1.0.0

author: Pangolim Criativo

engine: Pangolim Web Engine

parent_agent: pwe-elementor-architect

temperature: 0.0
---

# Mission

Gerar exclusivamente o JSON do componente.

Esta skill nao altera arquitetura.

Esta skill nao cria widgets.

Esta skill nao modifica layouts.

Esta skill apenas converte a estrutura aprovada para o formato JSON do Elementor.

---

# Inputs

Recebe:

* Estrutura Elementor

* Design System

* Arquitetura aprovada

* Padroes obrigatorios: .opencode/standards/pwe-elementor-free-rules.md

---

# Process

1. Criar arvore JSON.

2. Gerar Containers.

3. Gerar Widgets.

4. Aplicar configuracoes.

5. Aplicar classes CSS.

   ATENCAO: _css_classes dentro de settings de containers e silenciosamente
   ignorado pelo Elementor Free no frontend. Apenas widgets renderizam
   _css_classes. Nao definir _css_classes em container settings.

6. Aplicar IDs.

7. Aplicar estilos nativos do Elementor.

8. Referenciar CSS externo quando necessario.

9. Validar integridade.

10. Validar arquivo gerado programaticamente.

    Executar obrigatoriamente APOS a geracao do arquivo:

    a. BOM check: ler os primeiros 3 bytes do arquivo gerado. Confirmar que
       NAO sao 0xEF, 0xBB, 0xBF (UTF-8 BOM). Se for BOM, interromper e
       reportar erro.

    b. JSON parse check: ler o conteudo do arquivo e executar
       JSON.parse(). Se falhar (JSON malformado), interromper e reportar
       erro.

    c. UTF-8 well-formed check: verificar se o texto contem caracteres de
       substituicao (\uFFFD) ou padroes de mojibike conhecidos (como
       "Ã§", "Ãµ", "Ã£", "Ã¡", "Ã©", "Ã³", "Ã­", "Ãº", "Ã´", "Ã¢",
       "Ãª", "Ã¼", "Ã±"). Se detectar mojibike, interromper e reportar
       erro.

    Se qualquer verificacao falhar, o arquivo NAO deve ser entregue. O erro
    deve ser reportado claramente para correcao antes de nova tentativa.

---

# Validation

Validar:

* JSON valido
* Estrutura valida
* IDs unicos
* Classes corretas
* Containers validos
* Widgets validos
* Compatibilidade Elementor Free
* Arquivo salvo como UTF-8 sem BOM
* Flex layout valido (ver Checklist Flex)

---

# Flex Layout Checklist

Antes de entregar o JSON, validar obrigatoriamente:

- [ ] Containers flex row + wrap: total = (N-1)*G + N*W <= 100%
- [ ] Se gap > 0 e colunas 50%: width ajustado para calc(50% - gap/2)
- [ ] NENHUM _css_classes em containers (apenas em widgets)
- [ ] NENHUM container com content_width como objeto — sempre string "full" ou "boxed"
- [ ] Flex-basis: documentar se CSS complementar sera necessario
- [ ] Estrategia de gap documentada no blueprint (gap nativo vs padding interno)

Se qualquer item falhar, interromper a geracao e reportar para correcao
no blueprint (build-elementor-structure).

---

# Validacao de content_width

TODOS os containers devem ter `content_width` como string enum:

```json
"content_width": "full"
```

NUNCA:
```json
"content_width": {"unit": "px", "size": 1280}
```

O Elementor renderiza `'e-con-' . $content_width`. Se for objeto, PHP gera
classe `e-con-Array` → layout flex quebra completamente.

Apos gerar o JSON, fazer varredura programatica e abortar se encontrar
content_width como objeto em qualquer container.

---

# Output

Entregar:
component.json salvo em `.opp/components/{nome-kebab}/component.json`

Onde `{nome-kebab}` é o slug do componente em kebab-case (ex: `hero-bem-vindo`, `cta-section`, `feature-cards`).

A skill deve receber o nome do componente como parâmetro de entrada para determinar o caminho de saída.

---

# Rules

Nunca alterar arquitetura.
Nunca criar novos widgets.
Nunca remover widgets.
Nunca gerar CSS.
Nunca gerar JavaScript.
Nunca utilizar recursos exclusivos do Elementor Pro.
Nunca definir _css_classes em containers — usar seletores estruturais.
Nunca definir content_width como objeto — sempre string "full" ou "boxed".
Ao gerar grid de 2+ colunas com gap, ajustar width para calc(50% - gap/2)
ou remover gap e usar padding interno.
Verificar se flex-basis e gerado; se nao, documentar necessidade de CSS
complementar.

Caso algum recurso nao exista no Elementor Free, interrompa a geracao e
informe o motivo.
