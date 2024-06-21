
# Rocketseat Ignite Node.js - Desafio 02: Daily Diet API

## Descrição

Este projeto é uma API REST desenvolvida como parte do curso Ignite da Rocketseat. A API permite gerenciar dados de dietas diárias utilizando Node.js, TypeScript e Fastify, com suporte a operações CRUD (Create, Read, Update, Delete). O projeto faz uso de várias [tecnologias modernas](#tecnologias-utilizadas) para garantir um desenvolvimento robusto e eficiente.

## Estrutura do Projeto

- **src/**: Contém o código-fonte da aplicação.
- **db/**: Contém as migrações de banco de dados.
- **test/**: Contém os testes da aplicação.

## Instalação

Para rodar este projeto, siga os passos abaixo:

1. Clone o repositório:

    ```bash
    git clone https://github.com/AlanRehfeldt/Rocketseat_IgniteNode-02_daily_diet_api.git
    cd Rocketseat_IgniteNode-02_daily_diet_api
    ```

2. Instale as dependências:

    ```bash
    npm install
    ```

3. Configure as variáveis de ambiente:

    - Copie o arquivo `.env.exemple` para `.env` e ajuste as variáveis conforme necessário.
    - Copie o arquivo `.env.test.exemple` para `.env.test` para configuração de testes.

## Uso

### Executando a Aplicação

Para iniciar a aplicação em modo de desenvolvimento, execute:

```bash
npm run dev
```

### Executando o Banco de Dados e Migrations

Para configurar e executar o banco de dados, siga os passos abaixo:

1. Crie as tabelas no banco de dados rodando as migrations:

    ```bash
    npm run knex -- migrate:latest
    ```

2. Para desfazer as migrations (caso necessário):

    ```bash
    npm run knex -- migrate:rollback
    ```

3. Para criar uma nova migration:

    ```bash
    npm run knex -- migrate:make migration_name
    ```

### Rodando Testes

Para executar os testes, use o comando:

```bash
npm test
```

Os testes incluem:

- Testes end-to-end: Simulam o uso da aplicação de ponta a ponta para garantir que todos os fluxos funcionam corretamente.

## Visão Geral das Rotas

### Rotas de User

- **POST /users**: Cria um novo usuário.
- **GET /users/me**: Obtém detalhes do usuário logado.
- **PUT /users/:id**: Atualiza informações de um usuário.

### Rotas de Session

- **POST /sessions**: Cria uma nova sessão de login para o usuário (autenticação).

### Rotas de Meals

- **POST /meals**: Adiciona uma nova refeição.
- **GET /meals**: Lista todas as refeições do usuário.
- **PUT /meals/:id**: Atualiza informações de uma refeição.
- **DELETE /meals/:id**: Remove uma refeição.
- **GET /meals/metrics**: Retorna as métricas de um usuário.

## Tecnologias Utilizadas

- Node.js
- TypeScript
- fastify
- Knex.js
- SQLite (pode ser alterado para outro banco de dados conforme configuração)
- Zod
- Cookies
- Jsonwebtoken
- Tsx
- Dotenv
- Vitest
- Supertest

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
