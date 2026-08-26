# Historico de Versoes

Este arquivo registra as versoes publicadas do projeto e os commits relacionados a cada release.

## 3.3.18

- `53e062e` - `fix: automatiza correcao do bug ajv-keywords no update.sh`

## 3.3.17

- `7ae5795` - `feat: troca atualizacao automatica de pm2 para systemd + corrige charset do HTML`

Primeiro deploy em producao (VPS Hostinger, wp.ideianobolso.com / wp-bk.ideianobolso.com).
O painel de Atualizacoes passa a reiniciar o backend via systemd em vez de pm2 (pm2 nao
funcionava nesta VPS) e agora tambem publica o build do frontend automaticamente.

## 3.3.16

- `b07eed4` - `style: torna notificacao de versao mais discreta e remove referencias a GitHub/commit`
- `c2a91a1` - `fix: corrige banner de versao esticado no Firefox e reformula tela de login`

Notificacao de nova versao agora e um selo discreto de uma linha (sem mencionar GitHub/commit,
com descricao do que muda e para qual versao); corrigido bug de Firefox que esticava esse selo
quase full-width; tela de login com tipografia/inputs revisados, botao "Entrar" no tamanho certo,
selo de conexao segura HTTPS/TLS real, numero da versao e rodape com razao social/CNPJ/endereco.

## 3.3.15

- `f209580` - `fix: remove position:fixed indevido do MessageInput em telas estreitas`

Corrige o corte visual (barra escura/conteudo cortado do lado esquerdo) que aparecia no
banner "Ticket Aguardando" e na caixa de mensagem em telas mais estreitas: o wrapper usava
`position:fixed; left:0; right:0` abaixo do breakpoint "sm", o que ancorava o elemento na
viewport inteira em vez da coluna do chat, fazendo-o renderizar por baixo do menu lateral.

## 3.3.14

- `f67f748` - `fix: corrige overflow horizontal especifico do Firefox (botoes de acao e input de mensagem)`
- `2331ecd` - `fix: corrige conteudo invisivel por overflow em 33 paginas com tabela/lista`
- `f040e3e` - `chore: bump version to 3.3.14`

Observacao: a v3.3.13 foi publicada e depois removida (tag e release apagadas do GitHub) a pedido do usuario, que pediu para nunca usar o numero 13 em versionamento deste ou de qualquer outro projeto. O commit de correcao (f67f748) segue valido e faz parte da 3.3.14.

## 3.3.12

- `d807cd0` - `fix: remove uso de 100vw na AppBar principal (corta conteudo com scrollbar)`
- `e7536ae` - `chore: bump version to 3.3.12`

## 3.3.11

- `eee7861` - `fix: corrige causa raiz do scroll lateral - deteccao de largura de tela`
- `6e8ddbb` - `chore: bump version to 3.3.11`

## 3.3.10

- `afd61d2` - `fix: corrige scroll lateral real na lista de mensagens do ticket`
- `ee4312c` - `chore: bump version to 3.3.10`

## 3.3.9

- `19ca310` - `fix: corrige scroll lateral na conversa do ticket e crash no login`
- `a956c4e` - `chore: bump version to 3.3.9`

## 3.1.8

- `db9a042` - `feat: adiciona atualizacao automatica do sistema via GitHub`
- `c0b27b5` - `fix: corrige exclusao de conexoes e fecha multiplas falhas de seguranca`
- `0139137` - `chore: bump version to 3.1.8`

## 3.0.0

- `24c63aa` - `feat: reorganiza tickets por tags e expande gestao operacional`

## 3.1.1

- `c8bcd7e` - `feat: entrega pacote 3.1.1 com plantao e melhorias operacionais`

## 2.1.6

- `4220fb9` - `chore: prepara release 2.1.6`

## 2.1.5

- `07616af` - `style: remove mensagem vazia do painel e prepara release 2.1.5`

## 2.1.4

- `5652111` - `fix: corrige download de arquivos e prepara release 2.1.4`

## 2.1.3

- `b688d2a` - `fix: corrige importacao de contatos, tags e atualizacao em tempo real`
- `a9d917f` - `fix: corrige URL da API no login em producao`

## 2.1.2

- `1920104` - `style: prepara release 2.1.2 com ajustes no login e drawer`
- `1cc8bf9` - `Revert "style: adiciona scroll ao menu lateral do painel"`
- `90e2822` - `style: adiciona scroll ao menu lateral do painel`
- `f71c052` - `style: corrige encaixe da logo no drawer do painel`
- `4a9306a` - `style: adiciona respiro global aos containers do painel`

## 2.1.1

- `b2c08d4` - `chore: prepara release 2.1.1`
- `8c8445a` - `feat: adiciona dark mode com contraste ajustado na tela de login`
- `82d0ce3` - `style: refina hierarquia visual da tela de login`
- `8c289c0` - `style: centraliza formulario no container da tela de login`
- `e9c69cf` - `style: ajusta versao e responsividade da tela de login`
- `5388fac` - `style: refina alinhamento e responsividade da tela de login`
- `deca9e4` - `style: reformula tela de login com vitrine visual do CRM`

## 2.0.0

- `66c0b35` - `chore: define versao 2.0.0`
