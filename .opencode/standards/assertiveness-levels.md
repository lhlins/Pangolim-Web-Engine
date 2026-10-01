# Níveis de Assertividade do pwe-elementor-architect

> Define o rigor das validações e requisitos baseado no contexto do componente.
> Níveis determinados automaticamente pelo `pwe-plan-component` baseado em:
> - objetivo == "conversão" → high
> - componente_crítico == true → high  
> - tempo == "urgente" → low
> - caso contrário → balanced

---

## Nível High (Rigoroso)

### Quando usar
- Componentes de conversão direta (CTA, Hero principal, formulários de captura)
- Componentes críticos para acessibilidade legal (sites governamentais, saúde, financeiro)
- Quando qualidade é prioridade absoluta sobre velocidade

### Validações Obrigatórias (Critical)
- ✅ Todos os checks críticos existentes do `pwe-validate-component`
- ✅ **Flex Layout Check**: validação matemática de gap + porcentagem
- ✅ **Accessibilidade Completa**: 
  - `aria-label` em todos os botões e ícones interativos
  - Contraste mínimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)
  - Navegação por teclado lógica (tab order)
- ✅ **Performance Estrutural**: 
  - Profundidade DOM ≤ 4 (mais restritivo que warning padrão)
  - Máximo 10 widgets por container
- ✅ **Responsividade Rigorosa**: 
  - Todos breakpoints (mobile/tablet/desktop) definidos com valores específicos
  - Não permitir valores "inherit" ou vazios em breakpoints
- ✅ **DS Compliance Absoluta**:
  - 100% de cores usando variáveis `--pwe-*` (nenhum hardcode, nem mesmo WhatsApp)
  - 100% de tipografia usando variáveis de fonte `--pwe-*`
  - Espaçamentos usando apenas variáveis de spacing `--pwe-*`

### Requisitos Técnicos
- **CSS Complementar**: Obrigatório quando houver uso de gap ou layouts customizados
- **JavaScript Permitido**: Apenas quando não há solução CSS pura (ex: interações complexas)
  - Deve ser IIFE puro (nenhuma dependência externa)
  - Máximo 20 linhas
- **Acessibilidade**: Conformidade WCAG AA obrigatória

### Saída Esperada
- Exit code 0 apenas se TODAS as validações acima passarem
- Qualquer falha crítica bloqueia entrega imediatamente
- Warnings não afetam exit code mas são registrados para melhoria

---

## Nível Balanced (Padrão)

### Quando usar
- Componentes informativos padrão (sobre nós, serviços, blog)
- A maioria dos componentes do site
- Quando há equilíbrio entre qualidade e velocidade

### Validações Obrigatórias (Critical)
- ✅ Todos os checks críticos existentes do `pwe-validate-component` (BOM, JSON, schema, etc.)
- ⚠️ **Flex Layout Check**: Apenas warning (não bloqueia)
- ✅ **Accessibilidade Básica**:
  - `aria-label` em botões primários (CTAs, formulários)
  - Ícones decorativos devem ter `aria-hidden="true"`
- ⚠️ **Performance Estrutural**: 
  - Profundidade DOM ≤ 6 (mantém warning existente)
  - Máximo 15 widgets por container (warning se exceder)
- ⚠️ **Responsividade Flexível**: 
  - Breakpoints definidos (mobile/tablet/desktop) podem ser "inherit" se fizer sentido
  - Pelo menos um breakpoint específico deve estar definido
- ⚠️ **DS Compliance Flexível**:
  - Cores: 80%+ usando variáveis `--pwe-*` (permite alguns hardcodes funcionais como WhatsApp)
  - Tipografia: 80%+ usando variáveis de fonte
  - Espaçamentos: 70%+ usando variáveis de spacing

### Requisitos Técnicos
- **CSS Complementar**: Opcional, mas recomendado para layouts não-triviais
- **JavaScript Permitido**: Limitado a efeitos hover/focus simples e animações básicas
  - Deve ser IIFE puro
  - Máximo 30 linhas
- **Acessibilidade**: Conformidade WCAG A obrigatória, AA recomendada

### Saída Esperada
- Exit code 0 se todos os checks críticos passarem (mesmo com warnings de flex/accessibilidade/performance)
- Exit code 2 se apenas warnings (entrega permitida com ressalvas)
- Exit code 1 se qualquer check crítico falhar

---

## Nível Low (Mínimo)

### Quando usar
- Protótipos rápidos, testes A/B
- Componentes temporários com vida útil < 2 semanas
- Quando velocidade é absoluta prioridade (landing pages de campanha relâmpago)

### Validações Obrigatórias (Critical)
- ✅ Apenas os checks críticos fundamentais do `pwe-validate-component`:
  - BOM Check
  - JSON Parse
  - UTF-8 Well-formed
  - Schema Elementor (versão, title, type, content[])
  - content_width String (deve ser "full" ou "boxed")
  - _css_classes em Containers (deve ser undefined)
  - Widgets Elementor Free (apenas tipos permitidos)
- ❌ **Flex Layout Check**: Desativado (nem warning)
- ❌ **Accessibilidade Check**: Desativado (nem warning)
- ❌ **Performance Check**: Desativado (nem warning)
- ❌ **Responsividade Check**: Desativado (nem warning)
- ❌ **DS Compliance Check**: Apenas verifica se NÃO há hardcodes óbvios (ex: #FF0000 em background_color) - warning apenas

### Requisitos Técnicos
- **CSS Complementar**: Permitido apenas para ajustes mínimos (margins, paddings básicos)
- **JavaScript Permitido**: Nenhum (apenas CSS e HTML via Elementor)
- **Acessibilidade**: Não verificada (responsabilidade do designer humano)

### Saída Esperada
- Exit code 0 se os 7 checks críticos fundamentais passarem
- Exit code 1 se qualquer um desses 7 falhar
- Warnings de DS compliance são registrados mas não afetam exit code

---

## Implementação no pwe-plan-component

Lógica de determinação automática do nível:

```javascript
function determineAssertivenessLevel(componentData) {
  // 1. Objetivo de conversão direta
  if (componentData.objective === "conversion") {
    return "high";
  }
  
  // 2. Componente marcado como crítico
  if (componentData.critical === true) {
    return "high";
  }
  
  // 3. Prazo urgente
  if (componentData.timeline === "urgent") {
    return "low";
  }
  
  // 4. Caso padrão
  return "balanced";
}
```

Este nível deve ser salvo no `component.json` como `assertiveness_level` para uso pelo `pwe-validate-component`.

---

## Integração com pwe-validate-component

O script de validação deve:
1. Ler o `assertiveness_level` do `component.json` (padrão: "balanced" se não existir)
2. Aplicar apenas as checks críticas correspondentes ao nível
3. Manter todos os checks warnings para relatório (independentemente do nível)
4. Ajustar mensagens de erro para indicar qual nível estava sendo aplicado

Exemplo de saída JSON atualizada:
```json
{
  "status": "FAIL",
  "assertiveness_level_applied": "high",
  "checks": [
    {"name": "content-width", "level": "critical", "passed": false, 
     "message": "Container hero-123: content_width inválido (objeto) [nível high]"}
  ],
  "summary": {
    "critical_passed": 7,
    "critical_failed": 1,
    "warnings": 2
  }
}
```