---
name: pwe-apply-patch

description: >
  Aplica patches de melhoria aprovados no Pangolim Web Engine.
  Lê o YAML de patch gerado pela skill pwe-generate-improvement-patch,
  valida os alvos contra allowlist de caminhos, cria backups antes de
  cada escrita, aplica as alterações e gera um relatório de diff.

version: 1.0.0

author: Pangolim Criativo

engine: Pangolim Web Engine

parent_agent: pwe-orchestrator

temperature: 0.0

permissions:
  read: true
  write: true
  edit: true
  bash: false

constraints:
  - Nunca modificar arquivos fora da allowlist de caminhos.
  - Nunca modificar agentes do core (orchestrator, reviewer, improvement-engineer).
  - Nunca modificar a própria skill (pwe-apply-patch).
  - Nunca modificar scripts de validação (validate-component.mjs).
  - Nunca modificar opencode.json.
  - Sempre criar backup antes de cada escrita.
  - Sempre gerar relatório de diff após aplicação.
  - Interromper imediatamente se qualquer escrita falhar.
  - Reverter todos os backups se falha ocorrer no meio da aplicação.
---

# Mission

Aplicar de forma segura e rastreável um patch de melhoria aprovado pelo usuário.
Esta skill é o único ponto de escrita no pipeline de melhoria contínua.

---

# Inputs

Recebe:

- Patch YAML aprovado (gerado por pwe-generate-improvement-patch)
- Aprovação explícita do usuário
- Arquivos alvo do patch

---

# Path Allowlist

## Permitidos (seguros para auto-modificação)

- `.opencode/standards/*` — regras e padrões
- `.opencode/skills/pwe-*/SKILL.md` — skills (exceto pwe-apply-patch)
- `.opencode/knowledge/*` — base de conhecimento
- `.opencode/agents/pwe-elementor-architect.md` — arquiteto
- `.opencode/agents/pwe-site-analyst.md` — analista de sites
- `.opp/components/**/*` — artefatos de componentes
- `.opp/docs/**/*` — documentação

## Proibidos (infraestrutura core — destabiliza a suíte)

- `.opencode/agents/pwe-orchestrator.md` — camada de coordenação
- `.opencode/agents/pwe-improvement-engineer.md` — agente que dispara a mudança
- `.opencode/agents/pwe-reviewer.md` — gatekeeper (modificar o portão durante auditoria)
- `.opencode/skills/pwe-apply-patch/SKILL.md` — esta skill
- `.opencode/skills/pwe-validate-component/validate-component.mjs` — scripts de validação
- `.opencode/opencode.json` — registry

---

# Process

## 1. Validar o Patch

Verificar:

- O patch foi aprovado pelo usuário.
- Todas as alterações possuem justificativa.
- Todos os arquivos alvo estão na allowlist.
- Nenhum arquivo proibido foi listado.

Se qualquer validação falhar: interromper e reportar.

## 2. Criar Backups

Para cada arquivo alvo:

- Ler o conteúdo atual.
- Salvar em `.opp/backups/{timestamp}/{nome-do-arquivo}`.
- Registrar o backup no relatório.

## 3. Aplicar Alterações

Para cada alteração no patch, na ordem listada:

- Ler o arquivo atual.
- Aplicar a alteração (inclusão, alteração, remoção).
- Salvar o arquivo.
- Verificar que o arquivo resultante é válido (parseável se JSON, legível se MD).
- Se falha: reverter TODOS os backups e interromper.

## 4. Gerar Relatório de Diff

Para cada arquivo modificado:

- Registrar: arquivo, tipo de alteração, estado antes (hash/resumo), estado depois (hash/resumo).
- Formato: lista estruturada legível.

---

# Output

Gerar relatório:

```
APLICAÇÃO DE PATCH — PWE APPLY PATCH

Patch ID: [id do patch]
Data: [ISO 8601]
Status: [SUCESSO | PARCIAL | FALHA]

---
Arquivos processados:

1. [caminho]
   Tipo: [Inclusão | Alteração | Remoção]
   Backup: [caminho do backup]
   Status: [Aplicado | Erro]

2. ...

---
Resumo:
- Total de alterações: [N]
- Aplicadas com sucesso: [N]
- Falhas: [N]
- Backups criados: [N]

---
Backups salvos em: .opp/backups/{timestamp}/
```

---

# Rollback

Se qualquer escrita falhar durante a aplicação:

1. Interromper imediatamente.
2. Restaurar todos os arquivos já modificados a partir dos backups.
3. Deletar os backups criados nesta sessão.
4. Reportar falha completa com detalhes do erro.

---

# Validation

Antes de finalizar:

- [ ] Todos os arquivos alvo estão na allowlist
- [ ] Backups criados para todos os arquivos
- [ ] Todas as alterações aplicadas com sucesso
- [ ] Relatório de diff gerado
- [ ] Nenhum arquivo proibido foi modificado

---

# Completion Criteria

Skill concluída quando:

- Todas as alterações do patch foram aplicadas.
- Backups foram criados.
- Relatório de diff foi gerado.
- Status final (SUCESSO/PARCIAL/FALHA) foi definido.
