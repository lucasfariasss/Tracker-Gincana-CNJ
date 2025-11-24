# 🚀 Guia de Configuração - StackBlitz

Este projeto foi adaptado para rodar **sem banco de dados** no StackBlitz, usando dados mockados em memória com persistência em `localStorage`.

## 📋 O Que Foi Mudado

### ✅ Versão StackBlitz (Atual)
- ✅ Dados mockados em `src/data/mockData.ts`
- ✅ Persistência em `localStorage` (navegador)
- ✅ Zero configuração necessária
- ✅ Funciona 100% no StackBlitz
- ✅ Sem dependências de backend

### ❌ Versão Original (Docker/Produção)
- ❌ Requer MySQL/TiDB
- ❌ Necessita Docker ou servidor
- ❌ Configuração de variáveis de ambiente
- ❌ Seed do banco de dados

---

## 🎯 Como Usar no StackBlitz

### Método 1: Importar do GitHub (Recomendado)
1. Acesse [stackblitz.com](https://stackblitz.com)
2. Clique em **"Import from GitHub"**
3. Cole a URL do repositório: `https://github.com/lucasfariasss/Tracker-Gincana-CNJ`
4. Aguarde a instalação automática
5. O app abrirá em uma nova aba

### Método 2: Upload Manual
1. Acesse [stackblitz.com](https://stackblitz.com)
2. Clique em **"New Project"** → **"Vite + React"**
3. Delete todos os arquivos padrão
4. **Arraste e solte** a pasta inteira do projeto
5. O StackBlitz detectará automaticamente o `package.json`
6. Aguarde instalação das dependências

### Método 3: Copiar/Colar Arquivos
Se alguns arquivos não copiarem automaticamente:

#### Arquivos Essenciais (copie nesta ordem):
```
1. package.json
2. vite.config.ts
3. tsconfig.json
4. index.html
5. src/
   ├── main.tsx
   ├── App.tsx
   ├── index.css
   ├── types.ts
   ├── data/
   │   └── mockData.ts          ⭐ IMPORTANTE
   ├── components/
   │   ├── EditModal.tsx
   │   └── ui/
   └── ...
```

---

## 🏗️ Estrutura Simplificada

```
premio-cnj-tjpb/
├── src/
│   ├── data/
│   │   └── mockData.ts          # ⭐ Dados mockados (11 requisitos de exemplo)
│   ├── components/
│   │   ├── EditModal.tsx        # Modal de edição
│   │   └── ui/                  # Componentes de UI
│   ├── types.ts                 # TypeScript types
│   ├── App.tsx                  # Componente principal
│   ├── main.tsx                 # Entry point
│   └── index.css                # Estilos Tailwind
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 💾 Como os Dados Funcionam

### Mock Data (src/data/mockData.ts)
11 requisitos de exemplo pré-carregados:

```typescript
export const mockRequirements: Requirement[] = [
  {
    id: 'req_1',
    setor_executor: 'Secretaria de Gestão Estratégica',
    eixo: 'Governança',
    item: 'Ter plano estratégico institucional vigente e publicado',
    subitem: 'Plano estratégico atualizado e publicado',
    deadline: '2026-06-30',
    pontos: 10
  },
  // ... mais 10 requisitos
];
```

### Setores Disponíveis
- ✅ **Secretaria de Gestão Estratégica** (3 requisitos)
- ✅ **Coordenadoria de Estatística** (3 requisitos)
- ✅ **Assessoria de Comunicação** (2 requisitos)
- ✅ **Diretoria de TI** (3 requisitos)

### Persistência Local
As edições são salvas em **localStorage**:
- ✅ Persiste entre refreshes da página
- ✅ Não precisa de banco de dados
- ✅ Funciona offline
- ⚠️ Reseta se limpar cache do navegador
- ⚠️ Dados são locais por navegador/sessão

---

## 🎨 Customização

### Adicionar Mais Requisitos
Edite `src/data/mockData.ts`:

```typescript
export const mockRequirements: Requirement[] = [
  // ... requisitos existentes
  {
    id: 'req_12',
    setor_executor: 'Novo Setor',
    eixo: 'Governança',
    item: 'Nova meta estratégica',
    subitem: 'Descrição do subitem',
    deadline: '2026-12-31',
    pontos: 15
  }
];
```

### Alterar Título da Aplicação
Edite `index.html`:

```html
<title>Seu Título Aqui</title>
```

### Mudar Cores dos Eixos
Edite `src/App.tsx`, função `eixoColor()`:

```typescript
function eixoColor(eixo: string) {
  const map: Record<string, string> = {
    'Governança': '#2563eb',      // Azul
    'Produtividade': '#16a34a',   // Verde
    'Dados': '#7c3aed',           // Roxo
    'Transparência': '#f59e0b'    // Laranja
  };
  return map[eixo] ?? '#334155';
}
```

### Alterar Prazo de Alerta (dias)
Edite `src/App.tsx`:

```typescript
const DEADLINE_ALERT_DAYS = 15; // Mudar para 30, 7, etc.
```

---

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento (Vite)
npm run build    # Build otimizado para produção
npm run preview  # Preview do build de produção
```

---

## ❓ Perguntas Frequentes

### 1. Por que não aparece nada na tela?
**Soluções:**
- ✅ Aguarde o StackBlitz terminar de instalar dependências (veja terminal)
- ✅ Abra o Console do navegador (F12) e verifique erros
- ✅ Tente dar refresh (Ctrl+R ou Cmd+R)
- ✅ Verifique se `src/data/mockData.ts` foi copiado corretamente

### 2. "Setor Exemplo" aparece em vez dos setores reais
- ✅ Isso significa que você está na versão antiga do código
- ✅ Copie novamente o `src/data/mockData.ts` atualizado
- ✅ Dê refresh na página

### 3. Minhas edições sumiram após refresh
- ⚠️ Você limpou o localStorage do navegador
- ✅ Isso é esperado - os dados são salvos localmente
- ✅ Para produção, use a versão com banco de dados

### 4. Como adicionar mais setores?
Edite `src/data/mockData.ts` e adicione requisitos com `setor_executor` diferente:

```typescript
{
  id: 'req_novo',
  setor_executor: 'Meu Novo Setor',  // ⭐ Novo setor
  eixo: 'Governança',
  // ...
}
```

### 5. Posso usar esse código em produção?
**NÃO!** Esta versão é para **demonstração/prototipagem** apenas.

Para produção, você precisa:
- ✅ Banco de dados real (MySQL/PostgreSQL)
- ✅ Backend com autenticação
- ✅ Backup e segurança dos dados
- ✅ Use a versão Docker original do projeto

---

## 🐛 Problemas Comuns

### Erro: "Module not found"
```bash
# No terminal do StackBlitz, execute:
npm install
```

### Erro: "Vite error: Failed to resolve import"
- ✅ Verifique se todas as importações estão corretas
- ✅ O StackBlitz é case-sensitive: `EditModal.tsx` ≠ `editmodal.tsx`
- ✅ Confirme que todos os arquivos em `src/components/` existem

### Componentes de UI não aparecem
- ✅ Verifique se `src/components/ui/` existe
- ✅ Se faltar componentes, copie-os do repositório original
- ✅ Ou crie componentes básicos para substituir

### Título "Prêmio CNJ..." não aparece
- ✅ Verifique `index.html`
- ✅ Confirme que `<title>` está definido
- ✅ Dê refresh forçado (Ctrl+Shift+R)

### Dropdown de setores vazio
- ✅ Abra o Console (F12)
- ✅ Execute: `localStorage.clear()` e dê refresh
- ✅ Verifique se `src/data/mockData.ts` tem dados

---

## 🔄 Migrando para Produção

Quando estiver pronto para usar com banco de dados real:

### 1. Clone o repositório original
```bash
git clone https://github.com/lucasfariasss/Tracker-Gincana-CNJ.git
cd Tracker-Gincana-CNJ
```

### 2. Siga o setup com Docker
Consulte o `README.md` original para:
- ✅ Configurar banco de dados
- ✅ Rodar com Docker Compose
- ✅ Fazer seed do CSV real
- ✅ Configurar variáveis de ambiente

### 3. Diferenças principais
| StackBlitz | Produção (Docker) |
|------------|-------------------|
| Mock data em memória | Banco MySQL/TiDB |
| localStorage | Persistência real |
| Zero config | Requer setup |
| Dados de exemplo | CSV real (BD.csv) |

---

## 📊 Dados de Exemplo Incluídos

### Por Setor:
- **Secretaria de Gestão Estratégica:** 3 requisitos (37 pontos)
- **Coordenadoria de Estatística:** 3 requisitos (63 pontos)
- **Assessoria de Comunicação:** 2 requisitos (22 pontos)
- **Diretoria de TI:** 3 requisitos (72 pontos)

### Por Eixo:
- **Governança:** 3 requisitos
- **Produtividade:** 3 requisitos
- **Transparência:** 2 requisitos
- **Dados:** 3 requisitos

**Total:** 11 requisitos, 194 pontos disponíveis

---

## 📞 Suporte

### Se encontrar problemas:

1. **Verifique os logs do terminal** no StackBlitz
2. **Abra o Console do navegador** (F12) para ver erros JavaScript
3. **Confirme que todos os arquivos foram copiados:**
   - ✅ `src/data/mockData.ts` (ESSENCIAL)
   - ✅ `src/App.tsx`
   - ✅ `src/types.ts`
   - ✅ `src/components/EditModal.tsx`

4. **Teste passo a passo:**
   ```javascript
   // No Console do navegador (F12):
   localStorage.getItem('premio_cnj_updates_v1')  // Ver dados salvos
   localStorage.clear()                            // Limpar e reiniciar
   ```

---

## ✨ Recursos da Versão StackBlitz

- ✅ **Mock Login:** Escolha de setor sem autenticação
- ✅ **Dashboard:** Cards agrupados por EIXO
- ✅ **Modal de Edição:** Status, Link de Evidência, Observações
- ✅ **Barra de Progresso:** Pontos concluídos vs. total
- ✅ **Alertas de Prazo:** Destaque em vermelho quando próximo
- ✅ **Persistência Local:** Salva no navegador
- ✅ **Zero Config:** Funciona imediatamente

---

**Pronto!** 🎉 

Seu projeto agora roda 100% no StackBlitz sem precisar de banco de dados externo, Docker ou qualquer configuração adicional.

Para ver funcionando: Basta copiar os arquivos e aguardar o StackBlitz instalar as dependências.
