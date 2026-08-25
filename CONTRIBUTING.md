# Guia de Contribuição — Pangolim Web Engine

Bem-vindo(a) à comunidade do Pangolim Web Engine! Estamos empolgados em ter você conosco para evoluir a geração de componentes e temas para WordPress + Elementor Free + Hello Theme.

## 1. Filosofia de Contribuição

O Pangolim Web Engine (PWE) é uma suíte orientada por agentes. Para manter a estabilidade e a qualidade do motor, seguimos princípios rígidos de governança técnica:

- **Arquitetura antes de implementação**: Nunca submeta código sem uma proposta arquitetural prévia.
- **Gatekeeper Obrigatório**: Toda contribuição passa pelo agente `pwe-reviewer` (auditoria técnica automatizada e semântica).
- **Melhoria contínua**: Bugs e falhas de processo são tratados via `pwe-improvement-engineer` (root cause analysis), evitando correções temporárias.

## 2. Como Contribuir

1. **Issues**: Abra uma issue detalhando o problema, sugestão de melhoria ou nova feature (ex: novo widget, nova regra de validação).
2. **Desenvolvimento**: Utilize branches para desenvolver sua contribuição.
3. **Validação**: Antes de submeter, execute o validador do PWE localmente:
   ```bash
   # Exemplo para validar um componente
   node .opencode/skills/pwe-validate-component/validate-component.mjs .opp/components/{seu-componente}/
   ```
4. **Gatekeeping**: Seu código passará pela auditoria do `pwe-reviewer`. Esteja preparado para ajustar o código de acordo com as falhas detectadas (o `pwe-reviewer` é o nosso portão de qualidade).

## 3. Padrões Técnicos

Sua contribuição deve seguir rigorosamente os standards da suíte:
- **Elementor Free Only**: Sem plugins, sem frameworks, sem Elementor Pro.
- **Design Tokens**: Todo estilo (cor, tamanho, espaçamento) deve usar `var(--pwe-*)`. Cores hardcoded são rejeitadas.
- **JS Isolado**: Todo JavaScript deve estar envolto em IIFE, sem dependências globais ou externas.
- **CSS Estrutural**: Seletores devem ser estáveis (classes semânticas ou seletores estruturais); evite `data-id` instáveis.

Consulte `.opencode/standards/pwe-elementor-free-rules.md` para a lista completa de regras proibidas e permitidas.

## 4. Governança de Alterações

- **Bugs/Falhas**: Se identificar algo errado na suíte, reporte via `/pwe-improve`. O agente de engenharia de melhoria fará a investigação (Root Cause Analysis) e gerará o plano de correção.
- **Sugestões de melhoria**: Propostas de mudança na estrutura da suíte (novos agentes, novas skills, alterações no orquestrador) devem passar por uma discussão na issue correspondente antes da implementação.

---

*Licença: GNU General Public License v2 ou superior.*
*Código de Conduta: Ao contribuir, respeite os padrões técnicos do engine.*
