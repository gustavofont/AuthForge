Você é um Arquiteto de Software Sênior especializado em NestJS, arquitetura de microserviços, Clean Architecture, DDD e boas práticas de segurança.

Sua missão é desenvolver um Authentication Service genérico, reutilizável e independente de qualquer regra de negócio.

Este serviço será responsável exclusivamente pela autenticação e autorização de usuários, podendo ser consumido por qualquer aplicação (Web, Mobile, APIs e outros microserviços).

Não implemente nenhuma regra específica de negócio.

--------------------------------------------------
TECNOLOGIAS
--------------------------------------------------

Utilize:

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- Refresh Token
- Docker
- Docker Compose
- Swagger
- Class Validator
- ConfigModule
- Passport JWT
- Argon2 para hash de senhas

--------------------------------------------------
ARQUITETURA
--------------------------------------------------

Utilize uma arquitetura baseada em módulos, seguindo os princípios da Clean Architecture.

Exemplo:

src

common/
config/
database/

modules/

auth/
users/
roles/
permissions/
sessions/

Cada módulo deve possuir:

controllers
services
repositories
entities
dtos
interfaces
guards
decorators
mappers

Toda a arquitetura deve ser desacoplada.

Nenhum módulo deve acessar diretamente outro banco de dados.

--------------------------------------------------
FUNCIONALIDADES
--------------------------------------------------

Implemente:

### Usuários

- Criar usuário
- Buscar usuário
- Atualizar usuário
- Desativar usuário

### Autenticação

- Login
- Logout
- Refresh Token
- Revogar Refresh Token

### Sessões

Cada login deve criar uma sessão.

Salvar:

- dispositivo
- ip
- refresh token (hash)
- data de expiração

Permitir:

- listar sessões
- remover sessão
- logout de todos dispositivos

### Senhas

- Alterar senha
- Esqueci minha senha
- Resetar senha utilizando token

### Email

Preparar estrutura para envio de emails.

Criar interfaces para permitir qualquer provider futuro.

Exemplo:

EmailProvider

SendMail()

Não implementar provedores específicos.

Criar apenas a abstração.

--------------------------------------------------
AUTORIZAÇÃO
--------------------------------------------------

Implementar RBAC.

Criar entidades:

Role

Permission

RolePermission

UserRole

Criar decorators como:

@Roles()

@Permissions()

Criar Guards responsáveis por validar permissões.

Exemplo:

ADMIN

MANAGER

USER

Permissões:

create_user

delete_user

create_product

view_dashboard

--------------------------------------------------
JWT
--------------------------------------------------

Gerar Access Token

Gerar Refresh Token

Payload:

sub

email

roles

permissions

issuedAt

expiration

Assinar utilizando segredo configurável.

Preparar estrutura para futura troca por chave pública/privada.

--------------------------------------------------
BANCO
--------------------------------------------------

Criar migrations.

Criar entidades para:

users

roles

permissions

role_permissions

user_roles

sessions

password_reset_tokens

Criar índices.

Criar relacionamentos.

Criar soft delete quando fizer sentido.

--------------------------------------------------
VALIDAÇÕES
--------------------------------------------------

Utilizar:

DTOs

Class Validator

Validation Pipes

Nunca retornar erros internos.

Criar Exceptions customizadas.

--------------------------------------------------
SEGURANÇA
--------------------------------------------------

Hash utilizando Argon2.

Nunca salvar Refresh Token em texto puro.

Salvar apenas hash.

Rate Limit no Login.

Helmet.

CORS.

Sanitização de dados.

Proteção contra brute force.

--------------------------------------------------
DOCUMENTAÇÃO
--------------------------------------------------

Gerar documentação Swagger completa.

Documentar:

Request

Response

Erros

Exemplos

--------------------------------------------------
LOGS
--------------------------------------------------

Criar Logging centralizado.

Logar:

Login

Logout

Troca de senha

Refresh Token

Falhas de autenticação

--------------------------------------------------
TESTES
--------------------------------------------------

Criar:

Unit Tests

Utilizar Jest.

--------------------------------------------------
DOCKER
--------------------------------------------------

Criar:

Dockerfile

docker-compose

Containers:

API

PostgreSQL

--------------------------------------------------
CONFIGURAÇÃO
--------------------------------------------------

Criar ConfigModule separado.

Variáveis de ambiente:

JWT_SECRET

JWT_EXPIRES

REFRESH_EXPIRES

DATABASE_URL

REDIS_URL

PORT

APP_NAME

--------------------------------------------------
API
--------------------------------------------------

Criar endpoints:

POST /auth/login

POST /auth/logout

POST /auth/refresh

POST /auth/forgot-password

POST /auth/reset-password

GET /users

GET /users/:id

POST /users

PATCH /users/:id

DELETE /users/:id

GET /sessions

DELETE /sessions/:id

DELETE /sessions

GET /roles

POST /roles

GET /permissions

POST /permissions

--------------------------------------------------
QUALIDADE
--------------------------------------------------

Seguir SOLID.

Seguir Clean Code.

Seguir princípios REST.

Evitar duplicação de código.

Criar interfaces para todos os serviços.

Utilizar Injeção de Dependência.

Separar domínio de infraestrutura.

Criar código preparado para evolução futura.

Não utilizar valores fixos.

Todo comportamento configurável deve estar centralizado.

O resultado deve ser um Authentication Service pronto para produção, escalável, desacoplado, reutilizável e facilmente integrado a qualquer sistema ou arquitetura de microserviços.