# Sistema de Avaliação Física - Backend

Este é o repositório do **Backend** do Sistema de Avaliação Física. O objetivo desta API RESTful é fornecer todos os recursos necessários para autenticação de usuários, cálculos matemáticos seguros, armazenamento de avaliações e gestão de alunos e professores.

## 🚀 Tecnologias Utilizadas

A API foi desenvolvida focando no desacoplamento, segurança e facilidade de manutenção:

- **Node.js** - Ambiente de execução JavaScript.
- **Express.js** - Micro-framework para criação das rotas e middlewares da API.
- **PostgreSQL** - Banco de dados relacional para persistência dos dados.
- **Prisma (ORM)** - Mapeamento objeto-relacional para modelagem do banco e queries seguras.
- **JSON Web Token (JWT)** - Autenticação e proteção de rotas.
- **Bcryptjs** - Para criptografia (hashing) de senhas.
- **Zod** - Validação estrutural de dados recebidos pelas requisições.

## ✨ Principais Funcionalidades

- **Autenticação Segura**: Geração de tokens JWT e verificação de sessões ativas.
- **Gestão de Controle de Acesso (RBAC)**: Diferenciação entre Professores e Administradores.
- **API Restful**: Endpoints para CRUD completo de alunos, professores, anamneses e avaliações.
- **Soft Delete**: Preservação de integridade de dados (LGPD) marcando registros como deletados sem removê-los fisicamente do banco.
- **Segurança**: Rate limiting e proteção de rotas baseadas em campus e perfis.

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- Banco de dados PostgreSQL rodando localmente ou em nuvem.

### Instalação

1. Clone o repositório e acesse a pasta do backend:
```bash
cd avaliacao-fisica-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto, utilizando a seguinte estrutura:
```env
# Configurações do Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/avaliacao_db?schema=public"

# Chave secreta para assinatura dos tokens JWT
JWT_SECRET="sua_chave_secreta_aqui"

# Configurações do Servidor
PORT=3333
```

4. Execute as migrations para criar as tabelas no banco de dados:
```bash
npx prisma migrate dev
```

5. (Opcional) Popule o banco com dados iniciais (Campi e Usuário Admin):
```bash
npx prisma db seed
```

6. Inicie o servidor em modo de desenvolvimento:
```bash
npm run dev
```

A API estará rodando em: `http://localhost:3333`

## 📂 Estrutura de Pastas

- `/prisma` - Arquivos de schema do banco de dados, migrations e seeds.
- `/routes` - Controladores e definição de rotas da API (`/alunos`, `/professors`, `/avaliacoes`, etc).
- `/middlewares` - Interceptadores de requisições (como o `authMiddleware` para verificar tokens).
