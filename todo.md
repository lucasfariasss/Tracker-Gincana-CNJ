# Project TODO - Prêmio CNJ de Qualidade TJPB 2026

## Estrutura de Dados
- [x] Criar tabela requirements no schema do banco
- [x] Criar tabela requirement_updates no schema
- [x] Criar script de seed para popular banco com dados do CSV
- [x] Executar migrations e seed

## Backend (tRPC Procedures)
- [x] Criar procedure para listar setores únicos
- [x] Criar procedure para listar requirements por setor
- [x] Criar procedure para atualizar status de requirement
- [ ] Criar procedure para calcular progresso por setor

## Frontend - Tela de Seleção de Setor
- [x] Criar página SectorSelection com dropdown de setores
- [x] Implementar navegação para dashboard após seleção
- [x] Adicionar logo e branding do TJPB

## Frontend - Dashboard
- [x] Criar página Dashboard com filtro por setor
- [x] Implementar agrupamento de cards por EIXO
- [x] Criar componente Card para exibir requisitos
- [x] Adicionar badges de status (Pendente/Em Andamento/Concluído)
- [x] Destacar prazos próximos em vermelho
- [x] Aplicar esquema de cores por eixo

## Frontend - Modal de Edição
- [x] Criar componente Modal de edição
- [x] Adicionar campos: Status, Link de Evidência, Observações
- [x] Implementar salvamento de alterações
- [x] Adicionar validação de formulário

## Gamificação
- [x] Criar barra de progresso no topo do dashboard
- [x] Calcular pontos concluídos vs total do setor
- [x] Adicionar indicadores visuais de progresso

## Testes e Qualidade
- [x] Testar fluxo completo de seleção de setor
- [x] Testar edição e persistência de dados
- [x] Verificar responsividade mobile
- [x] Validar cálculo de progresso
- [x] Corrigir erros de HTML nesting (p dentro de p, div dentro de p)

## Correções
- [x] Corrigir atualização de progresso em tempo real

## Deploy
- [x] Criar checkpoint final
- [x] Documentar instruções de uso
