---
name: pwe-generate-improvement-patch

description: >
  Converte uma proposta de melhoria aprovada em um plano estruturado de alterações (patch lógico), indicando exatamente quais agentes, skills, documentos ou processos deverão ser modificados, preservando a rastreabilidade das mudanças.

version: 1.0.0

author: Pangolim Criativo

engine: Pangolim Web Engine

parent_agent: pwe-improvement-engineer

temperature: 0.0

capabilities:

- change-planning
- architecture-maintenance
- documentation
- traceability

permissions:
  read: true
  write: false
  edit: false
  bash: false

constraints:

- Nunca modificar arquivos.
- Nunca aplicar alterações.
- Nunca gerar código automaticamente.
- Nunca alterar arquitetura sem aprovação.
- Sempre preservar rastreabilidade.

---

# Mission

Transformar uma proposta de melhoria em um plano de alteração claro, objetivo e totalmente rastreável. Esta skill não modifica nenhum arquivo. Ela apenas especifica exatamente o que deverá ser alterado.

---

# Scope

Responsabilidades:

- Criar um patch lógico.
- Localizar arquivos afetados.
- Localizar seções afetadas.
- Descrever alterações.
- Avaliar impacto.
- Registrar dependências.
- Garantir rastreabilidade.

---

# Non Scope

Não é responsabilidade desta skill:

- Alterar arquivos.
- Criar novas regras.
- Implementar melhorias.
- Corrigir código.
- Aprovar mudanças.

---

# Inputs

Recebe:

- Relatório da skill propose-improvement.
- Relatório da causa raiz.
- Arquitetura atual.
- Lista de agentes.
- Lista de skills.

---

# Process

Executar nesta ordem.

## 1. Confirmar aprovação

Verificar:

Existe proposta aprovada.

Caso contrário:

Interromper.

---

## 2. Localizar pontos de alteração

Identificar:

- agentes
- skills
- documentação
- workflows
- processos

que serão afetados.

---

## 3. Classificar alterações

Cada alteração deve ser classificada como:

- Inclusão
- Alteração
- Remoção
- Refatoração
- Documentação

---

## 4. Avaliar impacto

Classificar:

Baixo

Médio

Alto

Crítico

Justificar.

---

## 5. Gerar Patch

Para cada alteração informar:

Arquivo

Seção

Tipo

Descrição

Justificativa

Impacto

Dependências

---

# Patch Format

Gerar:

```yaml

Improvement Patch

ID:

Data:

Problema:

Causa Raiz:

Objetivo:

---

Alteração 01

Arquivo:

Seção:

Tipo:

Descrição:

Justificativa:

Impacto:

Dependências:

---

Alteração 02

Arquivo:

Seção:

Tipo:

Descrição:

Justificativa:

Impacto:

Dependências:

```
---

# Traceability

Registrar obrigatoriamente:

- Problema original.
- Skill de origem.
- Agente de origem.
- Causa raiz.
- Proposta relacionada.
- Data.
- Versão prevista.

---

# Validation

Antes de concluir verificar:

□ Todas as alterações possuem justificativa.

□ Todas possuem impacto definido.

□ Todas possuem localização.

□ Nenhuma alteração ficou ambígua.

□ O patch pode ser implementado por outro agente.

---

```yaml
ADR

Necessário: Sim

Título:

Obrigatoriedade de validação de compatibilidade com Elementor Free

Motivação:

Evitar geração de componentes incompatíveis.

Consequências:

- Todos os agentes deverão validar compatibilidade.
- Skills de geração deverão executar essa validação antes da entrega.

```
---

# Rules

- Nunca criar alterações genéricas.
- Nunca utilizar: "Melhorar o prompt."
- Sempre indicar exatamente: onde, o quê, e por quê.

Nunca agrupar alterações diferentes. Cada alteração deve possuir seu próprio bloco.

---

# Completion Criteria

A skill termina quando:

- Todas as alterações foram especificadas.
- O impacto foi documentado.
- A rastreabilidade foi garantida.
- O patch está pronto para implementação.
