# Changelog

Todas as mudancas relevantes deste projeto devem ser registradas aqui.

O formato segue SemVer e mantem rastreabilidade entre codigo, tag e release.

## [2.1.1] - 2026-04-03

- Corrigida a sincronizacao em tempo real de tickets e mensagens para reduzir a necessidade de F5 no painel.
- Ajustado o fluxo de envio e persistencia de mensagens no WhatsApp para refletir no chat imediatamente.
- Melhorada a ordenacao e reconciliacao da lista de mensagens para evitar atrasos e inconsistencias visuais.
- Atualizado o modal de QR Code com novo layout, instrucoes guiadas e identidade visual alinhada ao painel.
- Removido o modulo Kanban do menu lateral e das rotas protegidas do sistema.
- Padronizada a resolucao da URL do backend no frontend para respeitar o host atual e reduzir erros de rede local.

## [2.0.30] - 2026-04-02

- Ajustado o menu lateral para destacar o item selecionado com fundo arredondado e persistente.
- Mantida a paleta atual do painel, alterando apenas o estilo de selecao do item ativo.
- Aplicado o mesmo padrao visual nos itens expansiveis (campanhas e flowbuilder) quando ativos.

## [2.0.29] - 2026-04-02

- Corrigido erro em Configuracoes > Whitelabel (`Apps is not defined`).
- Adicionados imports dos icones usados na tela (`Apps`, `Palette`, `Image`, `Colorize`, `Delete`, `AttachFile`).

## [2.0.28] - 2026-04-02

- Corrigida a tela de Conexoes para atualizar a lista imediatamente apos exclusao, sem precisar de F5.
- Adicionada recarga da listagem apos `delete` para refletir a remocao na hora.

## [2.0.27] - 2026-04-02

- Corrigida a renderizacao da logo no topo do menu lateral para manter proporcao sem distorcao.
- Ajustada a exibicao da imagem para usar `object-fit: contain` e `src` dinamico do tema ativo.
- Removidos imports de logo nao utilizados no layout principal.

## [2.0.19] - 2026-03-31

- Redesenhada a tela de login com layout dividido em desktop e foco no formulario na lateral direita.
- Removidos elementos excedentes do acesso para manter apenas login, senha e versao visivel.
- Ajustada a responsividade para ocultar o painel visual esquerdo em telas menores e priorizar o formulario.

## [2.0.20] - 2026-04-01

- Centralizado o botao Entrar na nova tela de login para melhorar o alinhamento visual do formulario.

## [2.0.21] - 2026-04-02

- Corrigidos textos em português com acentuação quebrada na base principal de traduções do frontend.
- Ajustados os textos visíveis da tela de login, da busca de usuários e da versão exibida no painel.

## [2.0.22] - 2026-04-02

- Corrigida a validação de sessão no frontend para não marcar usuário como autenticado apenas pela presença de token local.
- Ajustado o carregamento de versão no app para usar endpoint público e evitar erro `401` na tela de login.

## [2.0.23] - 2026-04-02

- Aplicada nova identidade visual roxo/laranja como tema padrão do painel.
- Atualizada a tela de login para usar a nova paleta em fundo, botão e destaques.
- Ajustadas cores utilitárias globais para manter consistência visual nas telas.

## [2.0.24] - 2026-04-02

- Ajustada a identidade visual para a paleta da logo (azul/ciano com apoio em cinza escuro).
- Atualizado o tema global do painel e os fundos de navegação para refletir a marca.
- Atualizada a tela de login com gradientes, botões e destaques alinhados às cores da logo.

## [2.0.25] - 2026-04-02

- Refinada a tipografia da versão para um estilo mais profissional e discreto.
- Reduzido o tamanho da versão no login e no menu lateral para um visual mais sutil.

## [2.0.26] - 2026-04-02

- Reformulada a tela de API para estilo de documentacao tecnica, mais explicativa e visualmente profissional.
- Adicionados blocos de endpoint, payload, cURL e observacoes para texto e midia.
- Mantido painel de testes integrado na propria documentacao para envio rapido de requests.

## [2.0.13] - 2026-03-31

- Corrigido o formulario de integracoes do tipo Flowbuilder para exibir os campos completos.
- Adicionada a selecao do fluxo do Flowbuilder no cadastro da integracao.
- Ajustado o backend para iniciar o fluxo configurado na integracao no primeiro contato.

## [2.0.14] - 2026-03-31

- Ajustada a barra lateral para ter rolagem propria.
- Corrigida a navegacao do menu para permitir acessar as ultimas opcoes sem reduzir o zoom da pagina.

## [2.0.15] - 2026-03-31

- Removido o submenu de Gerencia da barra lateral.
- Adicionadas abas internas para navegar entre Dashboard, Relatorios e Painel.
- Reorganizada a area de Gerencia para concentrar a navegacao no topo da tela.

## [2.0.16] - 2026-03-31

- Corrigida a tela de filas para exibir novas filas imediatamente apos o cadastro.
- Adicionado recarregamento automatico da lista apos salvar fila, sem precisar atualizar a pagina.

## [2.0.17] - 2026-03-31

- Adicionada selecao de multiplas conexoes no cadastro de usuarios.
- Mantida a conexao padrao separada como referencia para abertura de novos tickets.
- Ajustada a abertura de novo ticket para respeitar as conexoes permitidas do usuario.

## [2.0.18] - 2026-03-31

- Ajustada a exibicao das conexoes no cadastro de usuarios para usar as cores cadastradas em cada conexao.

## [2.0.12] - 2026-03-31

- Alterada a nomenclatura do menu lateral de Atendimentos para Tickets.

## [2.0.11] - 2026-03-31

- Criada uma aba propria de horario de expediente no cadastro de usuarios.
- Movidos os campos de horario da aba geral para a nova aba semanal por dia.
- Adicionada persistencia de agenda semanal do usuario com compatibilidade com o controle antigo de expediente.

## [2.0.10] - 2026-03-31

- Corrigida a atualizacao da tela de conexoes para exibir novas conexoes sem precisar de `F5`.
- Adicionado recarregamento imediato da lista apos salvar uma nova conexao no painel.

## [2.0.9] - 2026-03-31

- Exibida a versao atual do sistema no menu lateral abaixo de Empresas.

## [2.0.8] - 2026-03-31

- Reestruturado o README com foco em painel, modulos, instalacao e deploy.
- Documentados comandos de instalacao local e fluxo basico para VPS.
- Adicionada configuracao recomendada de infraestrutura.

## [2.0.7] - 2026-03-31

- Removida a secao de releases do README.

## [2.0.6] - 2026-03-31

- Removida a secao detalhada de versionamento do README.

## [2.0.5] - 2026-03-31

- Criado espacamento entre o menu lateral e a area principal do painel.
- Ajustado o respiro lateral das abas para evitar conteudo colado na drawer.

## [2.0.4] - 2026-03-31

- Removido o acesso ao modulo de prompts no menu lateral.
- Removida a rota `/prompts` do painel.

## [2.0.3] - 2026-03-31

- Ajustado o espacamento global das telas autenticadas.
- Criado mais respiro lateral e vertical em cabecalhos, conteudo e tabelas.
- Melhorada a distribuicao dos botoes e a leitura visual das paginas do painel.

## [2.0.2] - 2026-03-31

- Travado o frontend para uso exclusivo em `pt`.
- Removidos os seletores de idioma da tela de login e do painel logado.
- Removida a configuracao de idiomas disponiveis do whitelabel.

## [2.0.1] - 2026-03-31

- Removida a referencia `Talk.Ai` do menu do painel.
- Padronizada a identificacao do modulo de prompts nas traducoes do frontend.

## [2.0.0] - 2026-03-31

- Estruturado o fluxo profissional de versionamento com SemVer.
- Definida a base atual do projeto como `2.0.0`.
- Ajustado o ambiente local de desenvolvimento para execucao do painel e backend.
- Corrigidos seeds iniciais para funcionamento com PostgreSQL.
- Corrigido CORS local para aceitar `localhost` e `127.0.0.1`.
