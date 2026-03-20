# Reserva IoT — API Backend

API REST para monitoramento de reservas florestais com sensores IoT. Construída com **Node.js + TypeScript**, **Express 5**, **TypeORM** e **PostgreSQL**.

---

## Início Rápido — Criar usuário no Postman

> Faça isso antes de qualquer outra coisa. Sem um usuário cadastrado não é possível fazer login.

### Passo 1 — Suba a API

```bash
# Sobe só o banco em Docker, depois roda a API local:
docker compose up postgres -d
npm install
npm run dev
```

Aguarde aparecer no terminal:
```
Conectou com o banco!
Server is running in port: 6060
```

### Passo 2 — Crie o usuário no Postman

Abra o Postman e configure a requisição:

| Campo | Valor |
|-------|-------|
| Método | `POST` |
| URL | `http://localhost:6060/api/register` |
| Body | `raw` → `JSON` |

Cole o JSON abaixo no body:

```json
{
  "nome": "admin",
  "email": "admin@email.com",
  "senha": "minimo8chars",
  "matricula": "MAT001",
  "especialidade": "Biologia",
  "titulacao": "Mestrado",
  "dataNascimento": "1995-05-20"
}
```

**Regras importantes:**
- `senha` — mínimo **8 caracteres**
- `titulacao` — deve ser exatamente uma das opções: `Graduação` | `Especialização` | `Mestrado` | `Doutorado`
- `dataNascimento` — formato `YYYY-MM-DD`
- `email` e `matricula` são únicos (não pode repetir)
- `linhaPesquisa` é opcional

Clique em **Send**. Resposta esperada `201 Created`:

```json
{
  "id": "uuid...",
  "nome": "João Silva",
  "email": "joao@email.com",
  "matricula": "MAT001"
}
```

### Passo 3 — Faça login para obter o token

```
POST http://localhost:6060/api/login
```
```json
{
  "email": "joao@email.com",
  "senha": "minimo8chars"
}
```

Resposta:
```json
{
  "tokens": {
    "tokenAccess": "eyJ...",
    "tokenRefresh": "eyJ..."
  }
}
```

### Passo 4 — Use o token nas rotas protegidas

No Postman: aba **Authorization** → tipo **Bearer Token** → cole o `tokenAccess`.

O token expira em **15 minutos**. Quando isso acontecer, use o endpoint `/api/refresh` (veja seção abaixo).

---

## Tecnologias

- Node.js 20 + TypeScript
- Express 5
- TypeORM + PostgreSQL 16
- JWT (access token 15min + refresh token 7d)
- Bcryptjs — hash de senhas
- Zod — validação de entrada
- Docker + Docker Compose

---

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **rodando**

---

## Variáveis de Ambiente

O arquivo `.env` já vem configurado para desenvolvimento local:

```env
JWT_ACCESS_SECRET="CHAVE SECRETA ACCESS"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_SECRET="CHAVE SECRETA REFRESH"
JWT_REFRESH_EXPIRATION="7d"
PORT=6060
NODE_ENV="development"
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=123
DB_NAME=reservaIot2
```

> Em produção, troque os segredos JWT por valores fortes.

---

## Como rodar — Desenvolvimento Local

### Passo 1 — Subir o banco de dados com Docker

```bash
docker compose up postgres -d
```

Aguarde o container ficar saudável. Verifique com:

```bash
docker ps
```

O container `postgres-db` deve aparecer com status `healthy`.

### Passo 2 — Instalar dependências

```bash
npm install
```

### Passo 3 — Iniciar a API

```bash
npm run dev
```

Saída esperada:
```
Conectou com o banco!
Server is running in port: 6060
```

A API estará em: **`http://localhost:6060`**

> O TypeORM com `synchronize: true` cria as tabelas automaticamente na primeira execução.

---

## Como rodar — Tudo no Docker (API + Banco)

```bash
docker compose up --build -d
```

Parar tudo:
```bash
docker compose down
```

Parar e apagar dados do banco:
```bash
docker compose down -v
```

---

## Testando com Postman

### Health Check
```
GET http://localhost:6060/health
```
Resposta: `{ "status": "ok" }`

---

### 1. Criar usuário (Register)

```
POST http://localhost:6060/api/register
Content-Type: application/json
```

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "minimo8chars",
  "matricula": "MAT001",
  "especialidade": "Biologia",
  "titulacao": "Mestrado",
  "dataNascimento": "1995-05-20"
}
```

> **Titulações válidas:** `Graduação` | `Especialização` | `Mestrado` | `Doutorado`
> `linhaPesquisa` é opcional.

Resposta `201 Created`:
```json
{
  "id": "uuid...",
  "nome": "João Silva",
  "email": "joao@email.com",
  "matricula": "MAT001",
  ...
}
```

---

### 2. Login

```
POST http://localhost:6060/api/login
Content-Type: application/json
```

```json
{
  "email": "joao@email.com",
  "senha": "minimo8chars"
}
```

Resposta `200 OK`:
```json
{
  "tokens": {
    "tokenAccess": "eyJ...",
    "tokenRefresh": "eyJ..."
  }
}
```

> Guarde o `tokenAccess` para usar nas demais rotas.

---

### 3. Rotas autenticadas

No Postman: aba **Authorization** → tipo **Bearer Token** → cole o `tokenAccess`.

---

### 4. Refresh Token

Quando o `tokenAccess` expirar (15min):

```
POST http://localhost:6060/api/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "eyJ..."
}
```

Resposta:
```json
{
  "tokens": {
    "tokenAccess": "eyJ...",
    "tokenRefresh": "eyJ..."
  }
}
```

---

### 5. Logout

```
POST http://localhost:6060/api/logout
Content-Type: application/json
```

```json
{
  "refreshToken": "eyJ..."
}
```

---

## Endpoints completos

Base URL: `http://localhost:6060/api`

### Pesquisadores

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/register` | Não | Cadastrar pesquisador |
| GET | `/pesquisador` | Não | Listar todos |
| GET | `/pesquisador/:id` | Não | Buscar por ID |
| PUT | `/pesquisador/:id` | Não | Atualizar |
| DELETE | `/pesquisador/:id` | Não | Remover |

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/login` | Login |
| POST | `/refresh` | Renovar access token |
| POST | `/logout` | Encerrar sessão |

### Áreas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/area` | Criar área |
| GET | `/area` | Listar |
| GET | `/area/:id` | Buscar por ID |
| PUT | `/area/:id` | Atualizar |
| DELETE | `/area/:id` | Remover |
| GET | `/area/sensor/:id` | Sensores ativos da área |

### Sensores

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/sensors` | Criar sensor |
| GET | `/sensors` | Listar |
| PUT | `/sensors/:id` | Atualizar |
| DELETE | `/sensors/:id` | Remover |

### Leituras

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/leitura` | Registrar leitura |
| GET | `/leitura` | Listar |
| GET | `/leitura/:id` | Buscar por ID |
| PUT | `/leitura/:id` | Atualizar |
| DELETE | `/leitura/:id` | Remover |
| GET | `/leitura/area/:areaId` | Leituras de uma área |

---

## Estrutura do Projeto

```
src/
├── config/         # JWT config
├── controllers/    # Handlers HTTP
├── database/       # Conexão TypeORM (appDataSource)
├── entities/       # Entidades do banco (Pesquisador, Sensor, Area, Leitura, RefreshToken)
├── errors/         # AppError
├── middleware/      # validarBody, errorHandler, authMiddleware
├── routes/         # Rotas da API
├── services/       # Lógica de negócio
├── utils/          # asyncHandler
├── validats/       # Schemas Zod
└── server.ts       # Entry point
```

---

## Frontend (Angular)

O frontend está em `../Reserva-IoT/`. Para rodar:

```bash
cd ../Reserva-IoT
npm install
npm start
```

Acesse **`http://localhost:4200`**.
A API precisa estar rodando em `http://localhost:6060`.

---

## Como funciona a parte IoT — Wokwi alimentando o Dashboard

O dashboard do frontend exibe leituras em tempo real de sensores. Esses dados chegam via **simulação IoT com o Wokwi**.

### Visão geral do fluxo

```
Wokwi (simulador IoT)
        │
        │  HTTP POST /api/leitura
        ▼
  API Backend (Node.js)
        │
        │  salva no banco
        ▼
  PostgreSQL
        │
        │  GET /api/leitura/area/:id
        ▼
  Frontend Angular (Dashboard)
```

### Como configurar no Wokwi

1. **Acesse** [wokwi.com](https://wokwi.com) e crie um projeto com ESP32 (ou Arduino com WiFi).

2. **No código do firmware**, configure a URL da API:
   ```cpp
   const char* serverUrl = "http://SEU_IP_LOCAL:6060/api/leitura";
   ```
   > Use o IP da sua máquina na rede local (ex: `192.168.0.10`), não `localhost`.

3. **O Wokwi envia um POST** para `/api/leitura` com o payload:
   ```json
   {
     "valorLeitura": 25.4,
     "sensorId": "uuid-do-sensor",
     "areaId": "uuid-da-area"
   }
   ```

4. **Pré-requisito**: a Área e o Sensor precisam já estar cadastrados na API (use o frontend ou Postman para criar antes de ligar o Wokwi).

### Fluxo completo para a aula

1. Sobe a API e o banco (`docker compose up postgres -d` + `npm run dev`)
2. Abre o frontend (`npm start` em `../Reserva-IoT`)
3. Cria um pesquisador (via Postman ou frontend)
4. Faz login no frontend
5. Cria uma **Área** e um **Sensor** no CRUD do dashboard
6. Abre o projeto Wokwi com o código apontando para a API
7. Inicia a simulação no Wokwi — ele começa a enviar leituras
8. O dashboard Angular atualiza automaticamente exibindo as leituras por área

### Endpoints IoT relevantes

| Rota | Método | Descrição |
|------|--------|-----------|
| `POST /api/leitura` | Wokwi envia dados | Registrar leitura |
| `GET /api/leitura/area/:areaId` | Frontend consulta | Leituras de uma área |
| `GET /api/sensors` | Frontend lista | Sensores cadastrados |

> O `sensor_id` usado pelo Wokwi deve ser o mesmo UUID gerado pela API ao cadastrar o sensor.

---

## Simulando envio de dados IoT pelo Postman (sem hardware)

> **Não precisa de autenticação.** O endpoint `/api/leitura` é público — qualquer dispositivo ou ferramenta pode enviar dados.

Use isso para testar o dashboard sem precisar do Wokwi ou de um ESP32 físico.

### Passo 1 — Obtenha o ID do sensor

Primeiro busque os sensores cadastrados:

```
GET http://localhost:6060/api/sensors
```

Copie o `id` do sensor que deseja usar.

### Passo 2 — Envie uma leitura

```
POST http://localhost:6060/api/leitura
Content-Type: application/json
```

```json
{
  "umidade": 65.5,
  "temperatura": 28.3,
  "sensor_id": "cole-aqui-o-uuid-do-sensor",
  "dataHora": "2024-01-01T10:00:00.000Z"
}
```

**Campos:**
- `umidade` — número entre `0` e `100` (percentual)
- `temperatura` — número entre `-50` e `100` (graus Celsius)
- `sensor_id` — UUID do sensor cadastrado (obrigatório)
- `dataHora` — qualquer data ISO válida (o sistema substitui pela hora atual automaticamente)

Resposta `201 Created`:
```json
{
  "id": "uuid...",
  "umidade": 65.5,
  "temperatura": 28.3,
  "dataHora": "2024-03-11T14:30:00.000Z"
}
```

### Passo 3 — Veja no dashboard

Abra o frontend em `http://localhost:4200`, faça login, e acesse o dashboard. Os dados aparecerão nos gráficos da área à qual o sensor pertence.

> Repita o POST várias vezes com valores diferentes para ver a evolução no gráfico.
