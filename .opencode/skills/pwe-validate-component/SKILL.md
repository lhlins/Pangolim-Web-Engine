---
name: pwe-validate-component

description: |
  Validação programática obrigatória de componentes Elementor Free.
  Executa checks automatizados: BOM, JSON syntax, UTF-8, schema Elementor,
  content_width string, _css_classes em containers, DS compliance,
  responsividade, acessibilidade, performance.

version: 1.0.0

author: Pangolim Criativo

engine: Pangolim Web Engine

parent_agent: pwe-elementor-architect

temperature: 0.0

permissions:
  read: true
  write: false
  edit: false
  bash: true

constraints:
  - Nunca modificar arquivos.
  - Nunca criar componentes.
  - Sempre falhar (exit code != 0) se qualquer check Critical falhar.
  - Reportar output estruturado para consumo pelo Orquestrador.

---

# Mission

Executar validação técnica automatizada e determinística de componentes antes de qualquer entrega.
Substitui validação manual por gates programáticos.

---

# Scope

Checks obrigatórios (Critical — bloqueiam entrega):

1. **BOM Check**: Arquivo não contém UTF-8 BOM (0xEF,0xBB,0xBF)
2. **JSON Parse**: JSON válido (JSON.parse() sem erro)
3. **UTF-8 Well-formed**: Sem caracteres de substituição (�) ou mojibake
4. **Schema Elementor**: Estrutura básica válida (version, title, type, content[])
5. **content_width String**: Todos containers têm content_width "full" ou "boxed" (nunca objeto)
6. **_css_classes em Containers**: Zero containers com _css_classes definido
7. **Widgets Elementor Free**: Apenas widgetTypes permitidos no Elementor Free
8. **DS Color Compliance**: Cores no JSON/CSS usam variáveis --pwe-* (sem hardcode)

Checks de aviso (Warning — registram mas não bloqueiam):

9. **CSS Size**: CSS complementar > 5KB
10. **CSS Important Excess**: Mais de 3 ocorrências de `!important` no CSS
11. **DOM Depth**: Profundidade máxima de containers > 6
12. **Animation Weight**: Animações além de transform/opacity

---

# Inputs

Recebe:
- Caminho da pasta do componente: `.opp/components/{nome-kebab}/`
- Arquivos esperados:
  - component.json (obrigatório)
  - component.css (opcional)
  - component.js (opcional)

---

# Process

## 1. Validar component.json

```bash
# BOM check
head -c 3 component.json | xxd | grep -q "ef bb bf" && FAIL "BOM detectado"

# JSON parse
node -e "JSON.parse(require('fs').readFileSync('component.json'))" || FAIL "JSON inválido"

# UTF-8 check
node -e "const t=require('fs').readFileSync('component.json','utf8'); if(t.includes('\uFFFD')||/Ã§|Ãµ|Ã£|Ã¡|Ã©|Ã³|Ã­|Ãº|Ã´|Ã¢|Ãª|Ã¼|Ã±/.test(t)) process.exit(1)" || FAIL "Mojibake detectado"

# Schema básico
node -e "const j=JSON.parse(require('fs').readFileSync('component.json')); if(!j.version||!j.title||!j.type||!Array.isArray(j.content)) process.exit(1)"
```

## 2. Validar Estrutura Elementor (recursivo em content[])

```javascript
// Para cada container no content:
- content_width === "full" || content_width === "boxed" (string)
- settings._css_classes === undefined
- Se widget: widgetType ∈ allowedWidgets
```

## 3. Validar DS Compliance

```javascript
// Extrair todas as cores do JSON (background_color, text_color, border_color, etc.)
// Verificar se usam var(--pwe-*) ou são cores funcionais permitidas (WhatsApp)
// Falhar se encontrar hex literal não autorizado
```

## 4. Validar CSS (se existir)

```bash
# Tamanho
wc -c component.css | awk '{if($1>5120) print "WARNING: CSS > 5KB"}'

# Hardcode check
grep -E "#[0-9a-fA-F]{3,8}" component.css | grep -v "var(--pwe-" && WARNING "Possível hardcode de cor"
```

## 5. Validar JS (se existir)

```bash
# IIFE check
head -c 20 component.js | grep -q "^(function" || FAIL "JS não isolado (IIFE)"

# Dependencies check
grep -E "require\(|import |jQuery|\$" component.js && FAIL "Dependência externa detectada"
```

---

# Output

Exit codes:
- 0 = Sucesso (todos Critical passam)
- 1 = Falha Critical (bloqueia entrega)
- 2 = Apenas Warnings (entrega permitida com ressalvas)

Stdout JSON estruturado:
```json
{
  "status": "PASS|FAIL|WARN",
  "checks": [
    {"name": "bom", "level": "critical", "passed": true},
    {"name": "json-parse", "level": "critical", "passed": true},
    {"name": "utf8", "level": "critical", "passed": true},
    {"name": "schema", "level": "critical", "passed": true},
    {"name": "content-width", "level": "critical", "passed": true},
    {"name": "container-css-classes", "level": "critical", "passed": true},
    {"name": "widgets-free", "level": "critical", "passed": true},
    {"name": "ds-colors", "level": "critical", "passed": true},
    {"name": "css-size", "level": "warning", "passed": true, "message": "3.2KB"},
    {"name": "dom-depth", "level": "warning", "passed": true, "message": "depth: 4"},
    {"name": "animation-weight", "level": "warning", "passed": true}
  ],
  "summary": {
    "critical_passed": 8,
    "critical_failed": 0,
    "warnings": 0
  }
}
```

---

# Integration

Invocada pelo Orquestrador ANTES de chamar o Reviewer.
Se exit code 1 → Orquestrador devolve ao Architect com output JSON.
Se exit code 0 ou 2 → Prossegue para Reviewer.

---

# Allowed Widgets (Elementor Free)

heading, text-editor, image, video, button, divider, spacer, icon, google-maps, icon-box, image-box, star-rating, social-icons, progress-bar, soundcloud, shortcode, html, menu-anchor, sidebar, alert, accordion, tabs, toggle, counter, progress, pie-chart, chart, testimonial, team-member, portfolio, posts, archive-posts, search-form, login-form, registration-form, password-form, navigation-menu, nav-menu, page-title, site-logo, site-title, site-tagline, breadcrumbs, post-title, post-excerpt, post-content, post-date, post-author, post-comments, post-navigation, post-tags, post-categories, post-featured-image, loop-grid, loop-carousel, loop-slider, template, container, flexbox, grid

---

# Validation

Antes de considerar skill pronta:
- [ ] Script roda standalone (node validate-component.mjs <path>)
- [ ] Exit codes corretos
- [ ] Output JSON parseável
- [ ] Detecta todos os casos de teste conhecidos (BOM, objeto content_width, _css_classes container, hex hardcoded)

---

# Completion Criteria

Skill concluída quando:
- Script `validate-component.mjs` existe em `.opencode/skills/validate-component/`
- Documentação de uso no SKILL.md
- Testado com componentes existentes em `.opp/components/`
