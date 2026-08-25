---
name: pwe-validate-theme

description: >
  Validação programática de temas filho Hello Elementor gerados pelo PWE.
  Verifica header do style.css, sintaxe PHP, presença de tokens --pwe-*,
  ausência de cores hardcodadas, e estrutura de enqueue correta.

version: 1.0.0

author: Pangolim Criativo

engine: Pangolim Web Engine

parent_agent: pwe-theme-builder

temperature: 0.0

permissions:
  read: true
  write: false
  edit: false
  bash: true

constraints:
  - Nunca modificar arquivos.
  - Sempre falhar (exit code != 0) se qualquer check Critical falhar.
  - Reportar output estruturado para consumo pelo Orquestrador.
---

# Mission

Executar validação técnica automatizada de temas filho antes de qualquer entrega.

# Checks obrigatórios (Critical — bloqueiam entrega):

1. **style.css existe**: Arquivo não está vazio
2. **Header WordPress**: Contém `Theme Name:`, `Template: hello-elementor`
3. **PHP syntax**: `php -l functions.php` sem erros
4. **Token presence**: Pelo menos 10 custom properties `--pwe-*` definidas no :root
5. **No hardcoded colors**: Nenhum hex (#xxx ou #xxxxxx) fora do bloco de tokens
6. **Enqueue correct**: functions.php contém `wp_enqueue_style` e `get_stylesheet_directory_uri`
7. **UTF-8**: Ambos os arquivos são UTF-8 sem BOM

# Checks de aviso (Warning):

8. **Token count**: Menos de 20 tokens --pwe-* (pode indicar DS incompleto)
9. **Screenshot**: screenshot.png existe e tem tamanho > 0

# Output

Exit codes:
- 0 = PASS (todos Critical passam)
- 1 = FAIL (pelo menos 1 Critical falhou)
- 2 = Apenas Warnings

Stdout JSON:
```json
{
  "status": "PASS|FAIL|WARN",
  "checks": [
    {"name": "style-css-exists", "level": "critical", "passed": true},
    {"name": "header-wordpress", "level": "critical", "passed": true},
    {"name": "php-syntax", "level": "critical", "passed": true},
    {"name": "token-presence", "level": "critical", "passed": true},
    {"name": "no-hardcoded-colors", "level": "critical", "passed": true},
    {"name": "enqueue-correct", "level": "critical", "passed": true},
    {"name": "utf8", "level": "critical", "passed": true},
    {"name": "token-count", "level": "warning", "passed": true},
    {"name": "screenshot", "level": "warning", "passed": true}
  ]
}
```

# Integration

Invocada pelo pwe-theme-builder ANTES de catalogar.
Se exit code 1 → devolver ao Gerador com output JSON.
Se exit code 0 ou 2 → prosseguir para catalogação.

# Completion Criteria

Skill concluída quando:
- Todos os checks foram executados
- Output JSON foi gerado
- Exit code correto foi retornado
