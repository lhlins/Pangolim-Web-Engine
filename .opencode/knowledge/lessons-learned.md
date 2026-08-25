# Base de Conhecimento: Aprendizados e Prevenção de Erros (Pangolim Web Engine)

## 1. Erro Crítico: Página Branca (0 bytes) em Child Themes do WordPress
- **Sintoma:** O site retorna HTTP 200 OK mas com corpo de resposta vazio (0 bytes). O editor do Elementor entra em Safe Mode.
- **Causa Raiz 1 (Templates):** A presença de um arquivo `index.php` vazio ou básico no child theme faz com que o WordPress o utilize na hierarquia de templates, ignorando os templates do tema pai e gerando output vazio.
  - **Correção:** Nunca criar arquivos de template (`index.php`, `page.php`, etc.) no child theme a menos que seja necessário customizá-los explicitamente. Deixe o Hello Elementor gerenciar os templates.
- **Causa Raiz 2 (Encoding / BOM):** Arquivos salvos em UTF-8 com BOM (Byte Order Mark `EF BB B F`) inserem 3 bytes invisíveis antes dos headers HTTP, corrompendo o buffer de saída do PHP.
  - **Correção:** Sempre salvar arquivos PHP, CSS e JSON em **UTF-8 sem BOM**.

## 2. Padrão de JSON para Importação no Elementor
- O formato JSON aceito pelo importador de templates do Elementor requer a estrutura de página/container com chaves limpas, IDs hexadecimais de 7 caracteres e propriedades de flexbox corretas (`flex_direction`, `flex_gap`, etc.).
- O arquivo deve estar codificado estritamente em UTF-8 sem BOM.