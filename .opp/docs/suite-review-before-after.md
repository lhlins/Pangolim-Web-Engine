# Revisão geral da Suite PWE — Antes e Depois

**Data:** 2026-10-27
**Base da revisão:** alterações locais desde o diagnóstico inicial desta conversa.
**Estado geral:** mais coerente e seguro; ainda não comprovado como fluxo de produção ponta a ponta.

## Resumo direto

O checkout deixou de anunciar alguns comportamentos que não implementava e ganhou comandos locais, regras de permissão explícitas e um validador executável de tema. A validação de componente também foi reforçada. Isso melhora a base operacional, mas não prova que geração, revisão semântica, instalação em WordPress e auditoria de tema funcionem juntas em um projeto real.

## Antes e depois

| Área | Antes | Depois | Evidência e limite |
|---|---|---|---|
| Comandos | README anunciava cinco comandos que não tinham arquivos locais. | Existem cinco arquivos em `.opencode/commands/`; OpenCode 1.19.4 resolve os cinco para `pwe-orchestrator` e encaminha `$ARGUMENTS`. | Descoberta confirmada por `opencode debug config`; não exercitei cada comando numa sessão de geração completa. |
| Contagens e instalação | README dizia 5 agentes/18 skills e instruía cópia global e execução na pasta de um site cliente. | README lista 6 agentes/21 skills e orienta abrir o OpenCode na raiz do PWE. Explica que saídas ficam em `.opp/` no próprio checkout e que a cópia para o cliente é manual. | CLI reconheceu 6 agentes, 21 skills e 5 comandos. |
| Permissões | Agentes geradores tinham escrita desabilitada no formato antigo; skills continham blocos booleanos de permissão que não configuravam o acesso real. | Agentes usam permissões OpenCode com escrita limitada a `.opp/components/`, `.opp/themes/` ou `.opp/analysis/`; 14 blocos `permissions:` foram removidos das skills. | Configuração resolvida pelo CLI confirmou as restrições nos agentes conferidos; nenhuma skill ainda declara `permissions:`. |
| Validador de componentes | Validador tinha falhas de caminho/estrutura e documentação desalinhada. | Caminhos são limitados à raiz, estruturas inesperadas geram JSON de falha e a skill aponta para o script executável. | Fixture `test-component-2`: `PASS`. Fixture `test-component`: `FAIL` esperado porque usa `content_width` como objeto, proibido pelo padrão. A falha negativa foi controlada, sem stack trace. A tentativa anterior de symlink no Windows foi negada com `EPERM`; esse caso ainda não está confirmado em execução. |
| Gate de revisão | A terceira tentativa podia liberar o artefato com ressalvas, em conflito com a regra de bloqueio Critical. | O fluxo para a cada bloco de até 3 tentativas e pede autorização humana para continuar. Só `APROVADO`, sem pendências, encerra com entrega. | Regra atualizada no orquestrador, reviewer, catalogação e README; o ciclo completo não foi repetido após essa mudança. |
| Validação de temas | Skill prometia validação, mas não havia script; gerador prometia `screenshot.png` sem mecanismo real. | Há `validate-theme.mjs`, com checagens de caminho, arquivos, header, tokens, cores, enqueue e lint PHP. A promessa de screenshot foi retirada. | `node --check` passou e o caminho inexistente retornou JSON `FAIL` controlado. Não existe PHP CLI nem pasta de tema no ambiente, então o caminho de sucesso com lint PHP não foi testado. |
| Análise de sites | Prometia DOM parseado, CSS computado, JavaScript executado, WCAG 2.1 AA e Core Web Vitals. | Skills e agente agora limitam o relatório ao conteúdo acessível por `webfetch` ou fornecido: observações estáticas, inferências marcadas e métricas como não medidas. | Não foi feita uma análise ao vivo de um site; as afirmações de medição foram removidas dos contratos. |
| Design System e referências | Sincronização apontava para `docs/design-system.tokens.json`, inexistente, e vários documentos citavam nomes de arquivos sem o prefixo real `pwe-`. | A sincronização exige DS informado e não altera a fonte; os caminhos internos foram corrigidos. | Varredura dos Markdown não encontrou referências inexistentes sob `.opencode/`. O repositório não contém um DS canônico. |

## Verificações executadas

- OpenCode **1.19.4** resolveu **6 agentes, 21 skills e 5 comandos**.
- Os cinco comandos usam `pwe-orchestrator` e passam `$ARGUMENTS`.
- `opencode.json` foi parseado; `node --check` passou nos dois validadores e no helper de caminhos.
- Permissões resolvidas do arquiteto, construtor de temas, analista de sites e orquestrador foram inspecionadas.
- Os dois fixtures de componente foram executados: um passou e o outro falhou pelo valor inválido esperado.
- O validador de tema foi executado com caminho inexistente e retornou falha JSON controlada.
- `git diff --check` passou após as alterações.

## O que ainda não está demonstrado

1. Geração real de componente via comando, validação, delegação ao reviewer, correção e nova aprovação após um bloco de tentativas.
2. Validação de tema bem-sucedida com PHP CLI e um tema filho válido.
3. Instalação do tema/componente em WordPress + Elementor Free.
4. Proteção contra symlink em execução num ambiente que permita criar links simbólicos.
5. Análise de página ao vivo com evidência retornada por `webfetch`; as capacidades atuais não medem WCAG nem Web Vitals.

**Conclusão:** a suíte está mais honesta e controlada, mas ainda deve ser tratada como protótipo operacional. A configuração e verificações estáticas passaram; isso não equivale a prontidão de produção.

## Sugestões de melhoria, por prioridade

### P1 — Criar testes automatizados dos validadores

Adicionar fixtures positivos e negativos para JSON malformado, `content_width`, symlink, paths externos, header de tema, enqueue e erros de PHP. Executar symlink em CI Linux e manter o Windows para as verificações compatíveis.

### P1 — Completar uma fatia vertical em ambiente controlado

Com PHP CLI e um WordPress de teste, gerar um componente e um tema, rodar os validadores, revisar, aplicar uma correção e comprovar que o gate exige `APROVADO`. Registrar custo/iterações e provar que o checkpoint humano interrompe a delegação.

### P2 — Escolher entre análise estática e instrumentação de navegador

Se a necessidade for só referência visual, manter o escopo estático. Se for necessário afirmar conformidade WCAG, Core Web Vitals, estilos computados ou funcionamento de interações, adicionar uma ferramenta de navegador/laboratório e testes próprios; não restaurar essas promessas apenas por prompt.

### P2 — Formalizar o Design System de referência

Definir um arquivo canônico, schema, versão e localização dentro do PWE — ou manter DS sempre fornecido pelo usuário. Hoje a skill de sincronização corretamente não presume um arquivo, mas a comparação depende de entrada explícita.

### P3 — Automatizar consistência documental

Adicionar verificação de caminhos Markdown, contagem de agentes/skills/comandos e rejeição de metadados `permissions:` em skills. Isso evita que o README e os prompts voltem a divergir do checkout.

### P3 — Separar status de auditoria de status de liberação

Manter `APROVADO COM RESSALVAS` como veredito do reviewer, mas exigir que o orquestrador resolva ressalvas em ciclos supervisionados antes de catalogar ou liberar o artefato. Essa distinção foi explicitada nesta revisão e precisa ser exercitada no fluxo real.
