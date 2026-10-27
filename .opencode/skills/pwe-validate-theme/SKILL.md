---
name: pwe-validate-theme
description: Validação programática de temas filho Hello Elementor gerados pelo PWE.
version: 1.0.0
author: Pangolim Criativo
engine: Pangolim Web Engine
parent_agent: pwe-theme-builder
temperature: 0.0
constraints:
  - Nunca modificar arquivos.
  - Falhar se qualquer check Critical falhar.
  - Reportar JSON estruturado para o Orquestrador.
---

# Mission

Executar o validador somente leitura da raiz do PWE:

```bash
node .opencode/skills/pwe-validate-theme/validate-theme.mjs .opp/themes/{slug}
```

O caminho precisa identificar uma única pasta slug diretamente em `.opp/themes/`. Repassar o JSON completo do stdout e preservar o exit code.

# Checks Critical

1. `style.css` existe, não está vazio, é arquivo regular e contém UTF-8 válido sem BOM.
2. Header WordPress contém `Theme Name` não vazio e `Template: hello-elementor`.
3. `functions.php` existe, não está vazio, é arquivo regular, começa com `<?php` e contém UTF-8 válido sem BOM.
4. PHP CLI está disponível e `php -l functions.php` não encontra erros. Ausência do PHP também falha este check; não é possível afirmar que a sintaxe foi validada sem o lint.
5. `style.css` define no mínimo 10 propriedades `--pwe-*` dentro de `:root`.
6. Declarações CSS fora de `:root` não contêm cores hexadecimais hardcoded.
7. `functions.php` enfileira o stylesheet pai e o stylesheet filho, e declara o handle do pai como dependência do filho.
8. A pasta do tema, `style.css` e `functions.php` não podem ser links simbólicos. O destino deve permanecer em `.opp/themes/{slug}/` dentro da raiz PWE.

# Warning

- Menos de 20 propriedades `--pwe-*` em `:root` gera aviso, pois pode indicar Design System incompleto.
- Screenshot é opcional; este checkout não gera nem valida `screenshot.png`.

# Output e exit codes

- `0`: `PASS`, todos os checks Critical passaram e não há avisos.
- `1`: `FAIL`, algum check Critical falhou ou não pôde ser executado.
- `2`: `WARN`, todos os checks Critical passaram e há somente avisos.

O stdout é um objeto JSON com `status`, `checks` e `summary` (`critical_passed`, `critical_failed`, `warnings`). Cada check inclui `name`, `level`, `passed` e `message`.

# Integration

O `pwe-theme-builder` executa o script antes de catalogar.

- `FAIL`: enviar os checks que falharam ao gerador e não catalogar.
- `PASS`: prosseguir ao reviewer e, após aprovação, catalogar.
- `WARN`: registrar os avisos e prosseguir ao reviewer; Warning não substitui aprovação.

# Completion Criteria

- O script executa sem modificar os arquivos auditados.
- stdout contém JSON parseável e o exit code corresponde ao status.
- Falhas de caminho e erros inesperados são reportados sem stack trace.
