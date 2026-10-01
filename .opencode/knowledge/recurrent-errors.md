# Erros Recorrentes no Pangolim Web Engine

> Base de conhecimento de erros recorrentes que devem disparar automaticamente o Improvement Engineer para geração de patches de melhoria.
> Cada erro inclui: causa, correção, prevenção e exemplo de fix.

---

## Erro #001: content_width como objeto

**Contexto:** Aparece em validação do `pwe-validate-component` (check content-width)

**Causa:** 
- Skill `pwe-build-elementor-structure` define `content_width` como objeto `{"unit": "px", "size": 1280}` ao invés de string "full" ou "boxed"
- Ocorre quando o blueprint inclui largura fixa em pixels para containers

**Correção:** 
- Sempre usar string "full" ou "boxed" para `content_width` no Elementor Free
- Se precisar de largura fixa, usar o widget interno com largura definida ou CSS complementar

**Prevenção:** 
- Validar em `pwe-generate-elementor-json` antes de salvar o JSON
- Adicionar check explícito na skill `pwe-build-elementor-structure`

**Fix (exemplo):**
```diff
- "content_width": {"unit": "px", "size": 1280}
+ "content_width": "full"
```

**Trigger para Improvement Engineer:** 
- Quando 3 ou mais componentes falharem no check `content-width` com mesmo padrão (objeto com unit/size) em uma semana

---

## Erro #002: _css_classes em containers

**Contexto:** Aparece em validação do `pwe-validate-component` (check container-css-classes)

**Causa:**
- Skill `pwe-build-elementor-structure` ou `pwe-generate-elementor-json` define `_css_classes` em containers
- O Elementor Free ignora essa propriedade em containers (funciona apenas em widgets)

**Correção:**
- Remover `_css_classes` de todos os containers
- Para estilizar containers, usar classes em widgets internos ou CSS complementar com seletores de container

**Prevenção:**
- Adicionar validação na skill `pwe-build-elementor-structure` para remover `_css_classes` de containers
- Educar times de arquitetura sobre essa limitação do Elementor Free

**Fix (exemplo):**
```diff
- "_css_classes": "my-custom-class"
+ /* Remover esta linha completamente */
```

**Trigger para Improvement Engineer:** 
- Quando o erro aparecer em mais de 20% dos componentes validados em uma semana

---

## Erro #003: Uso de Hex Hardcoded em Cores

**Contexto:** Aparece em validação do `pwe-validate-component` (check ds-colors)

**Causa:**
- Uso de cores hexadecimais diretas (ex: #FF5733) no JSON ou CSS complementar
- Não utilização de variáveis do Design System (`--pwe-*`)

**Correção:**
- Substituir hex hardcoded por variáveis do Design System existentes
- Se a cor não existir no DS, solicitar adição ao DS antes de usar

**Prevenção:**
- Melhorar a check de DS compliance para detectar e sugerir variáveis automaticamente
- Criar guideline de uso de cores no DS

**Fix (exemplo):**
```diff
- "color": "#FF5733"
+ "color": "var(--pwe-primary-color)"
```

**Trigger para Improvement Engineer:** 
- Quando o mesmo hex hardcoded aparecer em 3 ou mais componentes diferentes

---

## Erro #004: Falta de aria-label em botões

**Contexto:** Aparece em validação de acessibilidade (check aria-label)

**Causa:**
- Botões do Elementor (widget button) sem `aria-label` ou `aria-labelledby` definidos
- Necessário para leitores de tela entenderem a função do botão quando o texto não é suficiente

**Correção:**
- Adicionar `aria-label` descritivo em todos os botões que não têm texto visível claro
- Para botões com texto, garantir que o texto seja suficiente ou adicionar `aria-label` se necessário

**Prevenção:**
- Adicionar check de acessibilidade obrigatório no nível `high` e `balanced` do assertiveness
- Criar componente botão padrão com aria-label já incluso

**Fix (exemplo):**
```diff
- <!-- Botão sem aria-label -->
+ <!-- Botão com aria-label descritivo -->
+ <button aria-label="Enviar formulário de contato">Enviar</button>
```

**Trigger para Improvement Engineer:** 
- Quando o erro aparecer em mais de 50% dos botões validados em uma semana

---

## Erro #005: Overflow de Flexbox por Gap + Percentagem

**Contexto:** Aparece em validação de flex layout (check flex-layout-validation)

**Causa:**
- Uso de `gap` em porcentagem combinado com larguras de filhos em porcentagem que somam mais de 100%
- Fórmula: total = (N-1)*gap% + N*childWidth% > 100%

**Correção:**
- Reduzir o gap ou as larguras dos filhos para que o total caiba em 100%
- Considerar usar `flex-wrap: wrap` se o design permitir quebra de linha

**Prevenção:**
- Educar arquitetos sobre o cálculo de layout flexbox
- Adicionar exemplos de layouts válidos na base de conhecimento de padrões

**Fix (exemplo):**
```diff
- gap: 5%; width: 30% (3 items) → (2*5% + 3*30%) = 100% ✅
+ gap: 3%; width: 30% (3 items) → (2*3% + 3*30%) = 96% ✅
```

**Trigger para Improvement Engineer:** 
- Quando o mesmo padrão de overflow aparecer em 2 ou mais componentes diferentes

---

## Como usar esta base

1. **Orquestrador (`pwe-orchestrator`):**
   - Após cada validação, verificar se o erro padrão corresponde a algum deste documento
   - Se sim, incrementar contador para aquele erro
   - Quando o contador atingir o threshold, disparar automaticamente o `pwe-improvement-engineer`

2. **Improvement Engineer (`pwe-improvement-engineer`):**
   - Receber o tipo de erro e contexto (quais componentes, quão frequente)
   - Gerar proposta de melhoria (patch de skill, atualização de guideline, etc.)
   - Seguir o fluxo normal de proposta → revisão → aprovação → aplicação

3. **Arquitetura (`pwe-plan-component`):**
   - Consultar esta base durante o planejamento para evitar erros conhecidos
   - Sugerir boas práticas baseadas nos fixes documentados

---

## Integração com o Improvement Engineer

O fluxo ideal é:

1. Componente falha na validação com erro X
2. `pwe-validate-component` retorna JSON com o erro e código (ex: Erro #001)
3. `pwe-orchestrator` recebe o output, incrementa contador para Erro #001
4. Se contador >= threshold → `pwe-orchestrator` invoca `pwe-improvement-engineer` com:
   ```json
   {
     "error_id": "Erro #001",
     "error_name": "content_width como objeto",
     "affected_components": ["hero-solucao", "cta-inscreva"],
     "frequency": 3,
     "time_window": "last_7_days"
   }
   ```
5. `pwe-improvement-engineer` analisa e gera proposta de melhoria (ex: atualizar skill `pwe-build-elementor-structure` para forçar string em content_width)
6. Proposta segue o fluxo normal de revisão e aplicação

> **Nota:** Esta integração requer atualização do `pwe-orchestrator`, que está fora do escopo desta skill mas deve ser considerada na próxima iteração.

---