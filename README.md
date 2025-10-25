<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## 🗄️ Database - Drizzle ORM

Este projeto utiliza [Drizzle ORM](https://orm.drizzle.team/) como ORM para gerenciar o banco de dados PostgreSQL.

### 📁 Estrutura de Arquivos

```
src/
 ├── db/
 │    ├── schema.ts        # Definição das tabelas do banco
 │    ├── index.ts         # Conexão e export do drizzle
 │    └── migrations/      # Migrations geradas automaticamente
 ├── .env                  # Variáveis de ambiente (não commitado)
 └── drizzle.config.ts     # Configuração do drizzle-kit (raiz)
```

### ⚙️ Configuração

O arquivo `.env` deve conter a URL de conexão do banco de dados:

```env
DATABASE_URL=postgresql://admin:admin@localhost:5432/bora_de_excursao
```

### 🚀 Comandos Disponíveis

```bash
# Gerar migrations baseado no schema
$ npm run db:generate

# Aplicar migrations no banco de dados
$ npm run db:migrate

# Push das alterações diretamente no banco (dev)
$ npm run db:push

# Abrir Drizzle Studio (interface visual do banco)
$ npm run db:studio
```

### 📝 Como Usar

#### Importar o banco de dados

```typescript
import { db } from './db';
import { tenants } from './db/schema';
```

#### Exemplo: Inserir dados

```typescript
await db.insert(tenants).values({
  name: 'Minha Empresa',
  slug: 'minha-empresa',
  plan: 'premium',
});
```

#### Exemplo: Consultar dados

```typescript
// Buscar todos os tenants
const allTenants = await db.select().from(tenants);

// Buscar por slug
const tenant = await db
  .select()
  .from(tenants)
  .where(eq(tenants.slug, 'minha-empresa'))
  .limit(1);
```

#### Exemplo: Atualizar dados

```typescript
await db
  .update(tenants)
  .set({ plan: 'enterprise' })
  .where(eq(tenants.slug, 'minha-empresa'));
```

#### Exemplo: Deletar dados

```typescript
await db.delete(tenants).where(eq(tenants.slug, 'minha-empresa'));
```

### 🏗️ Criando Novas Tabelas

1. Adicione a definição da tabela em `src/db/schema.ts`:

```typescript
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

2. Gere a migration:

```bash
$ npm run db:generate
```

3. Aplique no banco de dados:

```bash
$ npm run db:push
```

### 🐳 Docker

O projeto inclui um container PostgreSQL configurado. Para iniciar:

```bash
$ docker-compose up -d postgresql
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## criar bucket local

```
aws --endpoint-url=http://localhost:4566 s3 mb s3://excursion-management-ag-bora-de-excursao --profile localstack

```

## Listar buckets

```
aws --endpoint-url=http://localhost:4566 s3 ls --profile localstack
```

## Deletar bucket

````
aws --endpoint-url=http://localhost:4566 s3 rb s3://excursion-management-ag-bora-de-excursao --profile localstack --force
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
````
