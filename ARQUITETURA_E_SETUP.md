# Arquitetura de Dados e Setup Local

## 📊 De Onde Vêm os Dados?

Os dados **NÃO são hardcodados**. Eles vêm de um **banco de dados MySQL/TiDB** e foram populados através de um script de seed que importou o arquivo CSV que você forneceu.

### Fluxo de Dados:

```
CSV (BD.xlsx) 
    ↓
seed-data.json (processado via Python)
    ↓
seed-db.ts (script Node.js)
    ↓
Banco de Dados MySQL/TiDB
    ↓
tRPC Procedures (server/routers.ts)
    ↓
Frontend React (client/src/pages/)
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `requirements`
Armazena os dados base importados do CSV (223 requisitos):
- `id` - ID único
- `eixo` - Governança, Produtividade, Transparência, Dados e Tecnologia
- `item` - Meta principal
- `requisito` - Descrição específica
- `descricao` - Detalhamento
- `setorExecutor` - Setor responsável (38 setores)
- `coordenadorExecutivo` - Responsável
- `deadline` - Prazo
- `pontosAplicaveis2026` - Pontuação

### Tabela: `requirement_updates`
Armazena as atualizações feitas pelos servidores:
- `id` - ID único
- `requirementId` - Referência ao requirement
- `status` - "pendente", "em_andamento" ou "concluido"
- `linkEvidencia` - URL de comprovação
- `observacoes` - Notas do servidor
- `updatedAt` - Última atualização

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- MySQL 8.0+ ou TiDB rodando localmente
- Git

### Passo 1: Clonar o Repositório
```bash
# Se você tem acesso ao repositório Git
git clone <seu-repositorio>
cd premio-cnj-tjpb

# Ou, se estiver usando os arquivos do Manus:
# Baixe os arquivos do checkpoint e extraia
```

### Passo 2: Instalar Dependências
```bash
pnpm install
# ou npm install / yarn install
```

### Passo 3: Configurar Banco de Dados Local

#### Opção A: MySQL Local
```bash
# Instalar MySQL (macOS com Homebrew)
brew install mysql
brew services start mysql

# Criar banco de dados
mysql -u root -p
CREATE DATABASE premio_cnj;
CREATE USER 'premio_user'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON premio_cnj.* TO 'premio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Opção B: Docker (Recomendado)
```bash
docker run --name mysql-premio \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=premio_cnj \
  -e MYSQL_USER=premio_user \
  -e MYSQL_PASSWORD=sua_senha \
  -p 3306:3306 \
  -d mysql:8.0
```

### Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="mysql://premio_user:sua_senha@localhost:3306/premio_cnj"

# OAuth (se quiser usar autenticação, deixe em branco para desenvolvimento local)
VITE_APP_ID=""
OAUTH_SERVER_URL=""
VITE_OAUTH_PORTAL_URL=""

# Outros
JWT_SECRET="sua_chave_secreta_aqui"
VITE_APP_TITLE="Prêmio CNJ de Qualidade - TJPB 2026"
```

### Passo 5: Criar Tabelas (Migrations)
```bash
pnpm db:push
```

Este comando:
- Lê o schema em `drizzle/schema.ts`
- Gera migrations em `drizzle/`
- Aplica as mudanças no banco

### Passo 6: Popular o Banco com Dados (Seed)
```bash
pnpm exec tsx seed-db.ts
```

Você verá:
```
🌱 Iniciando seed do banco de dados...
📊 Carregando 223 requisitos...
✓ Inseridos 50/223 requisitos
✓ Inseridos 100/223 requisitos
✓ Inseridos 150/223 requisitos
✓ Inseridos 200/223 requisitos
✓ Inseridos 223/223 requisitos
✅ Seed concluído com sucesso!
```

### Passo 7: Rodar a Aplicação
```bash
pnpm dev
```

A aplicação estará disponível em: `http://localhost:3000`

## 🔧 Estrutura do Projeto

```
premio-cnj-tjpb/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SectorSelection.tsx    # Tela de login (setor)
│   │   │   └── Dashboard.tsx          # Dashboard principal
│   │   ├── components/
│   │   │   ├── RequirementModal.tsx   # Modal de edição
│   │   │   └── ProgressBar.tsx        # Barra de progresso
│   │   └── App.tsx                    # Rotas
│   └── index.html
├── server/                    # Backend Node.js/Express
│   ├── routers.ts            # tRPC procedures (API)
│   ├── db.ts                 # Query helpers
│   └── _core/                # Autenticação e configuração
├── drizzle/                  # Banco de dados
│   ├── schema.ts             # Definição das tabelas
│   └── migrations/           # Histórico de mudanças
├── seed-db.ts                # Script para popular banco
├── seed-data.json            # Dados do CSV processados
└── package.json
```

## 📡 Como os Dados Fluem

### 1. Frontend → Backend
```typescript
// Exemplo: Listar setores
const { data: sectors } = trpc.requirements.getSectors.useQuery();
```

### 2. Backend → Banco
```typescript
// server/routers.ts
getSectors: publicProcedure.query(async () => {
  const { getAllSectors } = await import("./db");
  return await getAllSectors();
});

// server/db.ts
export async function getAllSectors() {
  const db = await getDb();
  const result = await db.select({ setorExecutor: requirements.setorExecutor })
    .from(requirements)
    .groupBy(requirements.setorExecutor);
  return result.map(r => r.setorExecutor).sort();
}
```

### 3. Banco → Frontend
Os dados são retornados via tRPC e renderizados no React.

## 🔄 Atualizando Dados

Quando um servidor atualiza um requisito no modal:

```typescript
// Frontend envia
updateMutation.mutate({
  requirementId: 1,
  status: "concluido",
  linkEvidencia: "https://...",
  observacoes: "Concluído em 15/11"
});

// Backend salva em requirement_updates
// Banco armazena a atualização
// Frontend recarrega e mostra novo status
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'drizzle-orm'"
```bash
pnpm install
```

### Erro: "Connection refused" no banco
Verifique se MySQL está rodando:
```bash
# macOS
brew services list

# Docker
docker ps | grep mysql

# Verifique a DATABASE_URL em .env.local
```

### Erro: "Migration not found"
Execute novamente:
```bash
pnpm db:push
```

### Dados não aparecem no dashboard
Verifique se o seed foi executado:
```bash
pnpm exec tsx seed-db.ts
```

## 📝 Importar Novos Dados

Se você tiver um novo CSV com requisitos:

1. Substitua `seed-data.json` ou processe o novo CSV:
```bash
python3 << 'EOF'
import pandas as pd
import json

df = pd.read_csv('novo_arquivo.csv')
# ... processar dados ...
with open('seed-data.json', 'w') as f:
    json.dump(requirements, f)
EOF
```

2. Limpe o banco (opcional):
```bash
# No MySQL
TRUNCATE TABLE requirement_updates;
TRUNCATE TABLE requirements;
```

3. Execute o seed novamente:
```bash
pnpm exec tsx seed-db.ts
```

## 🚢 Deployment

Para colocar em produção:

1. Use um banco de dados gerenciado (AWS RDS, Google Cloud SQL, etc.)
2. Configure variáveis de ambiente no servidor
3. Execute migrations: `pnpm db:push`
4. Execute seed (se primeira vez): `pnpm exec tsx seed-db.ts`
5. Build: `pnpm build`
6. Start: `pnpm start`

---

**Resumo**: Os dados vêm do seu banco de dados MySQL/TiDB, não são hardcodados. Você pode rodar tudo localmente seguindo os passos acima!
