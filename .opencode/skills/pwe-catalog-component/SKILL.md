---
name: pwe-catalog-component

description: |
  Gera e mantém o catálogo de componentes (_catalog.md) e a ficha técnica
  (technical-spec.md) de cada componente no diretório .opp/components/.
  Atualiza automaticamente após aprovação do Review Loop.

version: 1.0.0

author: Pangolim Criativo

engine: Pangolim Web Engine

parent_agent: pwe-elementor-architect

temperature: 0.0

permissions:
  read: true
  write: true
  edit: true
  bash: false

constraints:
  - Nunca alterar arquitetura.
  - Nunca criar componentes.
  - Nunca gerar CSS ou JavaScript.
  - Apenas documenta e cataloga o que já foi aprovado.

---

# Mission

Manter o catálogo centralizado de componentes (.opp/components/_catalog.md)
e as fichas técnicas individuais (.opp/components/{nome}/technical-spec.md)
sempre atualizados, refletindo o estado real de cada componente no engine.

---

# Scope

Responsabilidades:
- Gerar/atualizar .opp/components/_catalog.md
- Gerar/atualizar .opp/components/{nome}/technical-spec.md
- Extrair metadados do component.json, audit report, architecture.md
- Registrar versão, status de auditoria, data, descrição
- Manter roadmap de componentes futuros

---

# Non Scope

Não é responsabilidade desta skill:
- Criar ou modificar componentes
- Gerar JSON, CSS, JS
- Realizar QA
- Decidir arquitetura

---

# Inputs

Recebe:
- Pasta do componente: .opp/components/{nome-kebab}/
- Arquivos obrigatórios esperados:
  - component.json
  - architecture.md (opcional)
  - wireframe.md (opcional)
  - qa-report.md (após review)
  - component.css (opcional)
  - component.js (opcional)
- Design System atual (para referenciar versão)

---

# Process

## 1. Atualizar Catálogo Principal (_catalog.md)

Ler .opp/components/_catalog.md (ou criar se não existir).

Para cada pasta em .opp/components/ (exceto _catalog.md):
- Extrair metadados do component.json:
  - title / versão
  - type (section, widget, etc)
- Ler audit-report.md se existir → status de auditoria
- Ler architecture.md se existir → descrição resumida
- Atualizar linha na tabela do catálogo

Se componente novo → adicionar linha.
Se componente removido → marcar como deprecated (não remover histórico).

## 2. Gerar Ficha Técnica (technical-spec.md)

Para cada componente, criar/atualizar .opp/components/{nome}/technical-spec.md com:

```markdown
# Ficha Técnica: {Nome do Componente}

**Versão:** {versão do component.json}
**Status Auditoria:** {Aprovado | Aprovado com ressalvas | Reprovado | Pendente | Entregue com ressalvas}
**Última atualização:** {ISO 8601}
**Design System:** {versão do DS usado}
**Engine:** Pangolim Web Engine

---

## 1. Metadados

| Campo | Valor |
|-------|-------|
| Nome | {title do JSON} |
| Tipo | {type do JSON} |
| Versão | {versão} |
| Pasta | .opp/components/{nome-kebab}/ |
| Autor | Pangolim Criativo |

---

## 2. Estrutura (resumo do component.json)

- Containers principais: {lista}
- Widgets utilizados: {lista de widgetType únicos}
- Classes CSS definidas: {lista de _css_classes únicas em widgets}

---

## 3. Design System

- Cores utilizadas: {tokens --pwe-* encontrados no JSON/CSS}
- Tipografia: {fontes/headers definidos}
- Espaçamentos: {valores/paddings principais}
- Breakpoints: {responsividade configurada}

---

## 4. Arquivos do Componente

| Arquivo | Status | Observação |
|---------|--------|------------|
| component.json | ✅ Presente | JSON Elementor válido |
| component.css | {✅/❌} | CSS complementar |
| component.js | {✅/❌} | JS complementar (IIFE) |
| architecture.md | {✅/❌} | Documentação arquitetura |
| wireframe.md | {✅/❌} | Wireframe textual |
| audit-report.md | {✅/❌} | Relatório de Auditoria (Reviewer) |

---

## 5. Relatório de Auditoria (se existir)

{Resumo do audit-report.md: status, itens critical, warnings, recomendações}

---

## 6. Histórico de Versões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| {v} | {date} | {author} | {descrição} |

---

## 7. Checklist de Entrega

- [ ] JSON válido (parse + sem BOM)
- [ ] content_width string em todos containers
- [ ] Sem _css_classes em containers
- [ ] Apenas widgets Elementor Free
- [ ] Variáveis --pwe-* no CSS
- [ ] Responsivo (mobile/tablet/desktop)
- [ ] Acessível (focus, contraste, reduced-motion)
- [ ] Documentado (architecture + wireframe + spec)
- [ ] Catalogado aqui
```

---

# Output

Três arquivos atualizados:
1. `.opp/components/_catalog.md` — índice geral para humanos
2. `.opp/components/components-registry.json` — registro machine-readable para agentes
3. `.opp/components/{nome-kebab}/technical-spec.md` — ficha individual

---

# components-registry.json Schema

```json
{
  "lastUpdate": "ISO8601",
  "components": [
    {
      "name": "string",
      "slug": "string",
      "version": "string",
      "type": "string",
      "statusAudit": "string",
      "path": "string",
      "tokens": ["--pwe-*"],
      "widgets": ["widgetType"],
      "complexity": "low|medium|high"
    }
  ]
}
```

---

# Rules

- Executar APÓS aprovação final do Review Loop (status APROVADO ou iteração 3 com ressalvas)
- Não executar durante desenvolvimento, apenas na etapa final de catalogação
- Sempre preservar histórico de versões na ficha técnica
- Marcar componentes deprecated se pasta removida (não apagar do catálogo)

---

# Validation

Antes de finalizar:
- [ ] _catalog.md reflete todos os componentes em .opp/components/
- [ ] Cada technical-spec.md tem dados consistentes com component.json
- [ ] Status de auditoria condiz com audit-report.md (se existir)
- [ ] Versão do Design System referenciada

---

# Completion Criteria

Skill concluída quando:
- _catalog.md atualizado
- technical-spec.md gerado/atualizado para o componente processado
- Dados consistentes entre catálogo e fichas
