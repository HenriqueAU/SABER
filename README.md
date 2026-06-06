# SABER
Sistema de Acompanhamento Bibliográfico Escolar em Rede

## Estrutura do projeto
- `backend/` — NestJS
- `frontend/` — Angular
- `docs/` — Diagramas e documentação

## Convenção de commits

- feat:     nova funcionalidade
- fix:      correção de bug
- chore:    configuração, dependências
- docs:     documentação
- refactor: refatoração sem mudança de comportamento
- test:     testes

## Setup

### Pré-requisitos
- Node.js 20+
- Docker
- Git

### Backend

1. Instale as dependências:
```bash
   cd backend && npm install
```

2. Crie os arquivos de variáveis de ambiente com base no exemplo:
```bash
   cp .env.example .env        # raiz (Docker)
   cp backend/.env.example backend/.env  # backend (NestJS)
```
   Preencha os valores em ambos os arquivos.

3. Suba o banco de dados:
```bash
   docker compose up -d
```

4. Rode as migrations:
```bash
   cd backend && npm run migration:run
```

5. Inicie o servidor:
```bash
   npm run start:dev
```