# Historico de Versoes

Este arquivo registra as releases publicadas do projeto com foco em melhorias, correcoes, evolucao visual e funcionalidades relevantes para comunicacao com clientes.

## 3.3.8

### Icones dos tickets mais modernos e profissionais

- Atualizacao dos icones das abas `Atendendo`, `Aguardando` e `Chat Interno` com visual mais atual, limpo e corporativo.
- Ajuste fino da leitura visual da area de tickets para deixar a navegacao mais elegante e coerente com o restante do painel.

## 3.3.7

### Barra superior mais elegante e tickets sem rolagem horizontal

- Refinos visuais na barra superior com icones menores, melhor alinhamento e espacos mais equilibrados.
- Ajuste fino do seletor de idioma com bandeira mais centralizada e integrada ao mesmo grid visual dos demais icones.
- Correcao da tela de `Tickets` para eliminar a barra de rolagem horizontal inferior.
- Ajustes de largura e overflow no layout principal do atendimento para deixar a experiencia mais limpa e profissional.

## 3.3.6

### Tempo real, identidade visual e regras de plano mais consistentes

- Ajustes de `socket` no painel para fortalecer atualizacao em tempo real de mensagens, tickets e eventos operacionais.
- Indicador de idioma refinado com bandeiras por pais e melhor alinhamento visual na barra superior.
- Correcao do nome e dos icones do aplicativo instalado no navegador, exibindo `CRM Ideia no Bolso` com o favicon atual.
- Aba `Chat Interno` em `Tickets` passou a respeitar o plano da empresa, desaparecendo quando o recurso estiver desabilitado.
- Refinos tecnicos no carregamento de `Configuracoes > Planos` para estabilizar a experiencia no ambiente de teste.

## 3.3.5

### Integracao Meta pelo painel e consolidacao da base estavel

- `d21c58b` - `fix(meta): move facebook and instagram app config to panel`
- A configuracao de `Facebook` e `Instagram` passou a ser feita diretamente pelo painel, sem necessidade de editar `.env`.
- Inclusao de fluxo pratico para cadastro de `App ID` e `Chave Secreta` da Meta na area de conexoes.
- Consolidacao de correcoes funcionais e visuais da linha `3.3.x`, mantendo a base estavel de referencia.

## 3.3.4

### Painel reorganizado e experiencia visual mais madura

- `9c4f38d` - `fix(ui): finaliza correcoes da release 3.3.4`
- Reorganizacao do menu lateral com distribuicao mais clara por modulos.
- Ajustes de layout em telas internas para reduzir quebras visuais e melhorar leitura.
- Refinamento da barra superior e da experiencia geral de navegacao no CRM.

## 3.3.3

### Fluxos, conexoes e experiencia administrativa ampliada

- `13b385f` - `feat(app): finaliza correcoes da release 3.3.3`
- Melhorias no `FlowBuilder` e no reaproveitamento de fluxos dentro do CRM.
- Evolucoes em integracoes, conexoes e experiencias administrativas do painel.
- Ajustes de comportamento em modulos estrategicos para tornar a operacao mais fluida.

## 3.3.2

### Busca de mensagens e jornada de atendimento mais eficiente

- `20dcc1c` - `fix(app): finaliza correcoes da release 3.3.2`
- Busca de mensagens aprimorada para localizar e abrir o ponto correto dentro da conversa.
- Melhorias no comportamento da navegacao entre tickets e historicos.
- Refinos de usabilidade para tornar a pesquisa mais proxima da experiencia do WhatsApp.

## 3.3.1

### Interface modernizada com icones mais atuais

- `63aaa99` - `feat(layout): moderniza icones da interface`
- Atualizacao dos icones do menu lateral, barra superior e areas operacionais do sistema.
- Visual mais moderno, jovem e profissional sem ruptura com o design existente.
- Melhor coerencia visual entre modulos administrativos e operacionais.

## 3.2.2

### Chat interno com leitura mais clara

- `7a5d72b` - `fix(chat-interno): destaca conversa e limpa notificacoes ao abrir`
- A lista de conversas do chat interno passou a indicar visualmente qual usuario enviou nova mensagem.
- As conversas agora exibem notificacao individual de nao lidas.
- Ao abrir a conversa, a notificacao e removida corretamente, refletindo que a mensagem ja foi visualizada.

## 3.2.1

### Chat interno com contador visual na aba

- `e0ba803` - `fix(chat-interno): adiciona contador visual na aba`
- A aba `Chat Interno` passou a exibir contador de mensagens nao lidas, no mesmo padrao visual de `Atendendo` e `Aguardando`.
- O contador foi integrado ao fluxo de notificacao em tempo real para dar mais clareza no acompanhamento interno.

## 3.2.0

### Chat interno integrado a Tickets

- `4f3ee92` - `feat(tickets): integra chat interno na tela de tickets`
- O chat interno deixou de ficar isolado em uma area separada e passou a funcionar dentro da tela de `Tickets`.
- A lista de usuarios e conversas internas passou a ficar na coluna esquerda, mantendo a conversa na direita, igual ao fluxo operacional de atendimento.
- Novos usuarios do sistema passaram a aparecer automaticamente como opcoes de conversa interna.
- Funcao reorganizada:
  Chat Interno removido do fluxo separado de menu e incorporado ao modulo principal de tickets.

## 3.1.3

### Painel mais organizado e operacao mais clara

- `2c07980` - `fix(app): finaliza correcoes da release 3.1.3`
- Melhorias de layout e proporcao na tela principal de tickets para facilitar leitura e operacao.
- Ajustes de textos, acentuacao e padronizacao visual do painel.
- Substituicao de `Fila` por `Setor/Setores` em pontos relevantes da interface.
- Lista de transmissao com historico mais consistente, mantendo a mensagem localizada em conversas futuras.

## 3.1.2

### Lista de transmissao mais segura e funcional

- `b73e93c` - `fix(app): finaliza correcoes da release 3.1.2`
- Correcao do erro interno ao abrir a tela de nova lista de transmissao.
- Transmissoes passaram a manter historico localizavel mesmo quando o contato nao tinha ticket aberto no momento do envio.
- Acoes de edicao e exclusao foram restringidas para reduzir risco operacional.
- Funcao simplificada:
  campos desnecessarios da tela de transmissao foram removidos para deixar o fluxo mais objetivo.

## 3.1.1

### Evolucao visual dos tickets e refinamento do painel

- `530d719` - `fix(app): finaliza correcoes da release 3.1.1`
- Refinamento visual dos tickets para um layout mais compacto, elegante e profissional.
- Melhorias em badges, identificacao de conexao, setor e responsavel.
- Ajustes de alinhamento, leitura de informacoes e hierarquia visual na operacao.
- Melhorias no ambiente de teste e consolidacao da experiencia visual antes da publicacao em producao.

## 3.1.0

### Comunicacao em massa e novos recursos de marketing

- `880634d` - `feat(marketing): adiciona stories e lista de transmissao`
- Inclusao da `Lista de transmissao` para envio de mensagem unica a contatos selecionados.
- Inclusao inicial do modulo de `Stories`.
- Expansao das capacidades de comunicacao ativa da plataforma.
- Funcao posteriormente revista:
  o modulo de `Stories` foi retirado do fluxo principal em etapas posteriores por nao atender o comportamento esperado no painel.

## 3.0.0

### Reorganizacao operacional de tickets

- `24c63aa` - `feat: reorganiza tickets por tags e expande gestao operacional`
- Reestruturacao da operacao de tickets com foco em organizacao por tags.
- Melhorias na leitura operacional e ampliacao da gestao de atendimentos.

## 2.1.6

### Base estavel da linha 2.x

- `4220fb9` - `chore: prepara release 2.1.6`
- Consolidacao da ultima release estavel da linha `2.1.x`.
- Serviu como referencia de estabilidade antes da evolucao para a linha `3.x`.

## 2.1.5

### Ajustes de painel e experiencia visual

- `07616af` - `style: remove mensagem vazia do painel e prepara release 2.1.5`
- Limpeza visual do painel e reducao de ruido na experiencia do usuario.

## 2.1.4

### Correcao no fluxo de arquivos

- `5652111` - `fix: corrige download de arquivos e prepara release 2.1.4`
- Correcao de download de arquivos para melhorar confiabilidade no uso diario.

## 2.1.3

### Contatos, tags e sincronizacao

- `b688d2a` - `fix: corrige importacao de contatos, tags e atualizacao em tempo real`
- `a9d917f` - `fix: corrige URL da API no login em producao`
- Melhorias de consistencia na importacao de contatos.
- Ajustes de tags e sincronizacao em tempo real.
- Correcao de URL da API no login em producao.

## 2.1.2

### Refinos de painel e navegacao

- `1920104` - `style: prepara release 2.1.2 com ajustes no login e drawer`
- `1cc8bf9` - `Revert "style: adiciona scroll ao menu lateral do painel"`
- `90e2822` - `style: adiciona scroll ao menu lateral do painel`
- `f71c052` - `style: corrige encaixe da logo no drawer do painel`
- `4a9306a` - `style: adiciona respiro global aos containers do painel`
- Melhorias no drawer lateral, logo e espacamento geral do sistema.

## 2.1.1

### Nova apresentacao da tela de login

- `b2c08d4` - `chore: prepara release 2.1.1`
- `8c8445a` - `feat: adiciona dark mode com contraste ajustado na tela de login`
- `82d0ce3` - `style: refina hierarquia visual da tela de login`
- `8c289c0` - `style: centraliza formulario no container da tela de login`
- `e9c69cf` - `style: ajusta versao e responsividade da tela de login`
- `5388fac` - `style: refina alinhamento e responsividade da tela de login`
- `deca9e4` - `style: reformula tela de login com vitrine visual do CRM`
- Evolucao importante da identidade visual e da experiencia inicial de acesso ao sistema.

## 2.0.0

### Inicio da linha 2.x

- `66c0b35` - `chore: define versao 2.0.0`
- Marco inicial da linha `2.x`.
