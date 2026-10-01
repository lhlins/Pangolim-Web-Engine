# Padrões de Componentes Elementor Free

> Base de conhecimento reutilizável para arquitetura de componentes.
> Cada padrão documenta: objetivo, variantes, widgets necessários, variáveis DS exigidas, triggers de escolha.

---

## Hero

### Objetivo
Componente principal de conversão - primeira vista do usuário. Gerar interesse e incentivar scroll/CLT.

### Variantes (3)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **Hero Text-Only** | Apenas título + CTA. Leitura rápida. | Mensagem única, foco em texto, landing pages simples |
| **Hero Image-Left** | Imagem à esquerda, texto à direita. Visual balanceado. | Quando precisar ilustrar conceito mas manter destaque ao texto |
| **Hero Image-Right** | Imagem à direita, texto à esquerda. Espelhado. | Quando layout de leitura LTR favorece imagem à direita ou necessidade visual |

### Widgets Elementor Free (obrigatórios)
| Variante | Widgets |
|----------|---------|
| Text-Only | heading, text-editor, button |
| Image-Left | heading, text-editor, image, button |
| Image-Right | heading, text-editor, image, button |

### Variáveis DS exigidas
- `--pwe-primary-color` (CTA button)
- `--pwe-font-heading` (título)
- `--pwe-section-bg` (fundo da hero, opcional)
- `--pwe-gradient-start` / `--pwe-gradient-end` (para Hero com gradient, opcional)

### Triggers de escolha
> Se:
> - Texto > 80 palavras **OU** imagem principal > 600px → Hero Image-Left/Right
> - Texto ≤ 80 palavras, objetivo conversão direta → Hero Text-Only

### Estudios (exemplo)
- `.opp/components/hero-bem-vindo/` (Hero Image-Left)
- `.opp/components/hero-solucao/` (Hero Text-Only)

---

## CTA (Call-to-Action)

### Objetivo
Converter → gerar clique no botão principal. Foco em ação única.

### Variantes (3)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **CTA Single** | Título + descrição curta + 1 botão centralizado. Foco direto. | Objetivo único, sem distrações |
| **CTA Split** | Dois botões lado a lado (primário + secundário). Comparação/Escolha. | Quando oferecer 2 ações iguais de importância |
| **CTA Sticky** | Flutuante no final da página, visível sempre. Maximiza conversão. | Páginas longas, funis de vendas |

### Widgets Elementor Free (obrigatórios)
| Variante | Widgets |
|----------|---------|
| Single | heading, text-editor, button |
| Split | heading, text-editor, button (x2), divider (opcional) |
| Sticky | heading, text-editor, button (inside column) |

### Variáveis DS exigidas
- `--pwe-primary-color` (botões)
- `--pwe-secondary-color` (botão secundário, CTA Split)
- `--pwe-font-heading` (título)
- `--pwe-btn-bg` / `--pwe-btn-text` (estilos de botão, opcional)

### Triggers de escolha
> Se:
> - Preciso mostrar 2 ações → CTA Split
> - Página longa, preciso relembrar CTA → CTA Sticky
> - Ação única, direta → CTA Single

### Estudios (exemplo)
- `.opp/components/cta-inscreva/` (CTA Single)
- `.opp/components/cta-orcamento/` (CTA Split)

---

## Feature Cards

### Objetivo
Mostrar benefícios/feature em cards individuais. Good para páginas de produto/serviço.

### Variantes (2)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **Feature Simple** | Ícone + título + descrição curta. 1 card por vez ou grade. | Lista rápida de benefícios |
| **Feature Advanced** | Ícone + título + descrição + bullet points + CTA "Saiba mais". | Feature que precisam de explicação mais detalhada |

### Widgets Elementor Free (obrigatórios)
| Variante | Widgets |
|----------|---------|
| Simple | icon, heading, text-editor |
| Advanced | icon, heading, text-editor, button |

### Variáveis DS exigidas
- `--pwe-icon-color` (ícones)
- `--pwe-font-heading` (títulos dos cards)
- `--pwe-accent-color` (destaca no advanced, opcional)

### Triggers de escolha
> Se:
> - Lista ≤ 5 itens → Feature Simple (grade)
> - Lista > 5 itens **OU** precisa de CTA por item → Feature Advanced

### Estudios (exemplo)
- `.opp/components/feature-beneficios/` (Feature Simple)
- `.opp/components/feature-planos/` (Feature Advanced)

---

## Pricing

### Objetivo
Mostrar planos/preços. Converter para assinatura ou contato comercial.

### Variantes (2)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **Pricing Simple** | Tabela preço + título + descrição + CTA "Selecionar". Linha única. | 1-2 planos apenas |
| **Pricing Toggle** | Botão de troca mês/ano + tabela + CTA. Melhor para SaaS. | Mais de 1 plano, modelo assinatura |

### Widgets Elementor Free (obrigatórios)
| Variante | Widgets |
|----------|---------|
| Simple | heading, text-editor, button |
| Toggle | heading, text-editor, button, toggle (widget Elementor Pro **alternativa**: custom code + CSS) |

> **Nota:** O widget `toggle` nativo é Elementor Pro. Para Elementor Free, usar `button` + CSS customizado para efeito toggle, ou usar código JS inline limitado.

### Variáveis DS exigidas
- `--pwe-primary-color` (CTAs)
- `--pwe-secondary-color` (planos ativos vs inativos)
- `--pwe-font-heading` (títulos dos planos)
- `--pwe-price-color` (valores dos preços)

### Triggers de escolha
> Se:
> - 1 plano apenas → Pricing Simple
> - 2+ planos **OU** modelo assinatura → Pricing Toggle

### Estudios (exemplo)
- `.opp/components/pricing-basico/` (Pricing Simple)
- `.opp/components/pricing-pro/` (Pricing Toggle)

---

## Testimonials

### Objetivo
Prova social - validar credibilidade. Converter desconfiados.

### Variantes (2)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **Testimonial Carousel** | Múltiplos depoimentos em carrossel navegável. | Múltiplos depoimentos disponíveis |
| **Testimonial Grid** | Grid de depoimentos visíveis simultaneamente. | Poucos depoimentos (2-4), queremos visibilidade total |

### Widgets Elementor Free (obrigatórios)
| Variante | Widgets |
|----------|---------|
| Carousel | testimonial (widget), button (nav next/prev), image |
| Grid | testimonial, image |

### Variáveis DS exigidas
- `--pwe-testimonial-author` (nome do autor, opcional variável)
- `--pwe-testimonial-company` (cargo/empresa, opcional)
- `--pwe-primary-color` (botões do carrossel, opcional)

### Triggers de escolha
> Se:
> - Mais de 4 depoimentos → Testimonial Carousel
> - 2-4 depoimentos → Testimonial Grid

### Estudios (exemplo)
- `.opp/components/testimonial-cliente/` (Testimonial Carousel)

---

## FAQ

### Objetivo
Perguntas frequentes. Melhorar SEO e reduzir atrito de venda.

### Variante (1)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **FAQ Accordion** | Lista de perguntas expansíveis. Cada uma abre/fecha independentemente. | Padrão ouro para FAQs |

### Widgets Elementor Free (obrigatórios)
- accordion (widget Elementor Free disponível)

### Variáveis DS exigidas
- `--pwe-font-heading` (perguntas)
- `--pwe-text-color` (respostas, opcional)

### Triggers de escolha
> Sempre → FAQ Accordion (única opção Elementor Free)

### Estudios (exemplo)
- `.opp/components/faq-geral/` (FAQ Accordion)

---

## Timeline

### Objetivo
Mostrar progressão temporal ou roadmap. Constrar confiança em processo.

### Variante (1)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **Timeline Vertical** | Série de marcos ao longo de eixo vertical. Ícones por marco. | Roadmap, história da empresa, processo de entrega |

### Widgets Elementor Free (obrigatórios)
- heading (marcos), text-editor (descrições), image (ícones)

### Variáveis DS exigidas
- `--pwe-font-heading` (marcos)
- `--pwe-primary-color` (linhas do tempo, opcional)

### Triggers de escolha
> Se:
> - Roadmap ≤ 8 marcos → Timeline Vertical
> - Roadmap > 8 marcos → Considerar múltiplas sections

### Estudios (exemplo)
- `.opp/components/timeline-roadmap/` (Timeline Vertical)

---

## Stats

### Objetivo
Apresentar números-chave (usuários, projetos, anos). Gerar autoridade instantânea.

### Variante (1)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **Stats Grid** | Números em cards de grade (4 colunas desktop). Cada um: número + rótulo + ícone. | Qualquer página que queira autoridade rápida |

### Widgets Elementor Free (obrigatórios)
- heading (número), text-editor (rótulo), icon (ícone)

### Variáveis DS exigidas
- `--pwe-font-heading` (números)
- `--pwe-icon-color` (ícones)
- `--pwe-primary-color` (accent no card, opcional)

### Triggers de escolha
> Sempre → Stats Grid (única opção viável Elementor Free)

### Estudios (exemplo)
- `.opp/components/stats-metricas/` (Stats Grid)

---

## Contact

### Objetivo
Formulário de contato + informações auxiliares. Converter para lead.

### Variante (1)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **Contact Form + Info** | Formulário lateral/coluna + informações de contato (email, telefone, endereço). | Páginas de contato, "Fale conosco" |

### Widgets Elementor Free (obrigatórios)
- form (widget), heading, text-editor, spacer, separator, social-icons (opcional)

### Variáveis DS exigidas
- `--pwe-primary-color` (botão submit)
- `--pwe-font-heading` (título "Fale conosco")
- `--pwe-text-color` (texto do formulário)

### Triggers de escolha
> Sempre → Contact Form + Info (única estrutura viável)

### Estudios (exemplo)
- `.opp/components/contact-fale/` (Contact Form + Info)

---

## Footer

### Objetivo
Rodapé do site. Informações secundárias, navegação, links úteis.

### Variantes (2)

| Variante | Descrição | Quando usar |
|----------|-----------|-------------|
| **Footer Basic** | Linha única: logo + links rápidos + direitos autorais. | Sites simples, pouca informação |
| **Footer Full-Width** | Múltiplas colunas: sobre, serviços, links, newsletter, redes sociais. | Portais corporativos, sites com muita informação hierárquica |

### Widgets Elementor Free (obrigatórios)
| Variante | Widgets |
|----------|---------|
| Basic | site-logo, navigation-menu, site-tagline |
| Full-Width | site-logo, navigation-menu, site-tagline, social-icons, text-editor |

### Variáveis DS exigidas
- `--pwe-primary-color` (links ativos, botões newsletter)
- `--pwe-font-heading` (títulos de colunas)
- `--pwe-text-color` (texto de rodapé)

### Triggers de escolha
> Se:
> - Necessitar newsletter + redes sociais → Footer Full-Width
> - Apenas links rápidos → Footer Basic

### Estudios (exemplo)
- `.opp/components/footer-basico/` (Footer Basic)
- `.opp/components/footer-completo/` (Footer Full-Width)

---

## Referência Rápida: Tabela Resumo

| Padrão | Variantes | Widgets Mínimos | DS Tokens Críticos | Trigger Principal |
|--------|-----------|-----------------|---------------------|-------------------|
| Hero | 3 | heading, text-editor, button | primary-color, font-heading | Texto > 80 words → Image |
| CTA | 3 | heading, text-editor, button | primary-color, font-heading | 2 ações → Split |
| Feature Cards | 2 | icon, heading, text-editor | icon-color, font-heading | >5 items → Advanced |
| Pricing | 2 | heading, text-editor, button | primary-color, font-heading | >1 plano → Toggle |
| Testimonials | 2 | testimonial, image | — | >4 depoimentos → Carousel |
| FAQ | 1 | accordion | font-heading | Sempre |
| Timeline | 1 | heading, text-editor, image | font-heading | ≤8 marcos |
| Stats | 1 | heading, text-editor, icon | font-heading, icon-color | Sempre |
| Contact | 1 | form, heading | primary-color, font-heading | Sempre |
| Footer | 2 | site-logo, nav | primary-color, font-heading | Newsletter+socials → Full |

---

## Como usar este catálogo

1. **Antes de planejar componente novo:** Buscar padrões similares por `family` e `widgets`.
2. **Durante `pwe-plan-component`:** Selecionar padrão pelo `trigger principal` da tabela resumo.
3. **Pós-catalogação:** Adicionar novo componente ao `_catalog.json` (gerado por `pwe-catalog-component`).
4. **Manutenção:** Atualizar `component-patterns.md` sempre que novo padrão descobrir em produção.

---

> **Nota importante:** Este documento é a "base de conhecimento" proposta na melhoria do `@pwe-elementor-architect`. Ele deve ser mantido como verdade única para escolhas arquitetônicas. Novos padrões só adicionam; nunca removem existentes sem revisão de todo o ecossistema.