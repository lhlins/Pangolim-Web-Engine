---
name: pwe-sync-tokens-to-ds
description: Compara tokens extraídos com um Design System fornecido e propõe mudanças sem editar a fonte.
version: 1.0.0
author: Pangolim Criativo
engine: Pangolim Web Engine
parent_agent: pwe-site-analyst
temperature: 0.0
constraints:
  - Nunca atualizar nem substituir o Design System.
  - Não presumir uma localização padrão de Design System.
  - Sem tokens ou DS acessíveis, pedir o conteúdo necessário ou declarar a análise incompleta.
  - Relatar apenas diferenças demonstráveis a partir das duas fontes recebidas.
---

# Mission

Comparar o relatório/JSON de tokens observado com um Design System que o usuário forneça ou indique por caminho dentro do checkout PWE. O repositório não contém um DS canônico neste momento; não procurar um arquivo presumido como `docs/design-system.tokens.json`.

# Inputs

- Conteúdo ou caminho de um relatório/JSON de tokens disponível em `.opp/analysis/`.
- Conteúdo do Design System fornecido pelo usuário, ou arquivo informado que esteja dentro da raiz PWE.
- Se algum dos dois inputs estiver ausente, não inventar valores nem status `MATCH`, `UPDATE` ou `NEW`.

# Process

1. Confirmar que ambos os conteúdos necessários estão disponíveis e identificar formato/origem.
2. Comparar nomes e valores de tokens: igualdade (`MATCH`), nome existente com valor diferente (`CONFLICT`) ou token ausente no DS (`PROPOSAL`).
3. Distinguir tokens observados no CSS de tokens inferidos/normalizados.
4. Registrar limitações e campos que não puderam ser comparados.
5. Produzir uma proposta em `.opp/analysis/tokens-diff-report-[timestamp].md` quando a gravação estiver disponível; caso contrário, retornar o relatório na resposta e declarar que não foi salvo.
6. Aguardar aprovação humana antes de qualquer pessoa alterar o Design System. Esta skill nunca aplica propostas.

# Output

Relatório com fontes usadas, tabela `token | valor observado | valor no DS | status | evidência`, itens não comparáveis e propostas. Não prometer JSON ou diff de máquina sem realmente criar esses arquivos.

# Completion Criteria

- As duas fontes e suas origens foram identificadas.
- Cada comparação tem evidência, ou foi marcada como não comparável.
- Nenhum arquivo do Design System foi alterado.
- A proposta foi salva ou a impossibilidade de salvá-la foi declarada.
