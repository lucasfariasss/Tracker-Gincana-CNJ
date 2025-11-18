# Prêmio CNJ de Qualidade - TJPB 2026 (zero-config)

Aplicação web estática (Docker + Nginx), sem dependência de banco. Os dados são lidos de `data/BD.csv` (servido como arquivo estático) e as edições são salvas em `localStorage` do navegador.

## Como rodar com Docker (sem nenhuma configuração extra)
1. (Opcional) Coloque seu `BD.csv` em `./data/BD.csv`.
	- Cabeçalhos esperados: "Setor Executor","EIXO","ITEM","SUBITEM","DEADLINE","Pontos Aplicáveis 2025".
	- Se o arquivo não existir, o app sobe com dados de exemplo.
2. Construa e suba com Docker Compose:
	```powershell
	docker compose up --build
	```
3. Acesse: http://localhost:8080

## Desenvolvimento local (opcional)
```powershell
npm install
npm run dev
```

## Funcionalidades
- Mock Login: dropdown com valores únicos de `Setor Executor`.
- Dashboard: agrupamento por `EIXO`, cards com `SUBITEM`, `ITEM`, `DEADLINE` (alerta quando próximo), `Pontos` e Status (badge).
- Edição (Modal): Status, Link de Evidência e Observações. Persistência em `localStorage` no navegador.
- Barra de Progresso do Setor: pontos concluídos / pontos totais.

## Observações
- Cores por EIXO: Governança (azul), Produtividade (verde), Dados (roxo), Transparência (laranja).
- Ajuste o prazo crítico em `DEADLINE_ALERT_DAYS` no `src/App.tsx` (padrão 15 dias).
