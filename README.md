# Prêmio CNJ de Qualidade - TJPB 2026

Aplicação web para acompanhamento de metas por Setor (mock login), com Dashboard por EIXO, edição via modal e persistência no Supabase.

## Requisitos
- Node.js 18+
- Conta no Supabase

## Configuração
1. Crie um projeto no Supabase e copie `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
2. Crie um arquivo `.env.local` na raiz com base no `.env.example`.
3. No Supabase (SQL Editor), execute o conteúdo de `schema.sql` para criar as tabelas.

## Seed do CSV
1. Copie seu `BD.csv` para `data/BD.csv` (com cabeçalhos: "Setor Executor","EIXO","ITEM","SUBITEM","DEADLINE","Pontos Aplicáveis 2025").
2. Exporte `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (iguais aos do projeto):

```powershell
$env:SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR-SERVICE-ROLE-KEY"
```

3. Rode o seed:

```powershell
npm run seed
```

## Rodar o app
```powershell
npm install
npm run dev
```
Abra o endereço exibido (por padrão: http://localhost:5173).

## Funcionalidades
- Mock Login: escolha de Setor (valores únicos de `Setor Executor`).
- Dashboard: cards agrupados por `EIXO` exibindo `SUBITEM`, `ITEM`, `DEADLINE` (alerta em vermelho quando próximo), `Pontos` e Status (badge).
- Edição (Modal): Status, Link de Evidência e Observações (salva/upsert em `updates`).
- Barra de Progresso do Setor: pontos concluídos / pontos totais.

## Observações
- Cores por EIXO: Governança (azul), Produtividade (verde), Dados (roxo), Transparência (laranja).
- Ajuste o prazo crítico em `DEADLINE_ALERT_DAYS` no `App.tsx` (padrão 15 dias).
