# Autoflex Stock Control

Sistema web para controle de produtos, matérias-primas e sugestão de produção com priorização por maior valor do produto.

## Stack

- Backend: Quarkus (Java 21), JPA/Panache, Flyway
- Frontend: React + Vite + Tailwind
- Banco: PostgreSQL
- Containers: Docker + Docker Compose

## Funcionalidades

- CRUD de produtos (`code`, `name`, `price`)
- CRUD de matérias-primas (`code`, `name`, `stockQuantity`)
- CRUD de associação produto x matéria-prima (BOM)
- Consulta de sugestão de produção com priorização por maior preço do produto
- Cálculo de valor total da produção sugerida

## Arquitetura

- `backend/`: API REST + regras de negócio + persistência
- `frontend/`: interface web responsiva
- `docker-compose.yml`: sobe frontend, backend e banco em conjunto

## Execução com Docker (recomendado)

Pré-requisitos:
- Docker
- Docker Compose

## Passo a passo 
1) Abra o terminal na pasta desejada <br>
    1.1 Execute o seguinte comando
    ```bash
    git clone https://github.com/wellesjr/autoflex-stock-control.git
    ```
2) Vá ate a pasta ```autoflex-stock-control``` e execute
```bash
docker compose up --build
```

Acessos:
- Frontend: `http://localhost:5173`
- Swagger UI: `http://localhost:8080/q/swagger-ui`

Parar:

```bash
docker compose down
```

## Execução local (desenvolvimento)

Pré-requisitos:
- Java 21
- Maven (ou `./mvnw`)
- Node.js 20+
- PostgreSQL 16 (ou usar o container só do banco)

### 1) Banco de dados

```bash
docker compose up -d db
```

### 2) Backend

```bash
cd backend
./mvnw compile quarkus:dev
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local: `http://localhost:5173`

## Testes

Backend:

```bash
cd backend
./mvnw test
```

## Endpoints principais

- `GET|POST /api/products`
- `GET|PUT|DELETE /api/products/{id}`
- `GET|POST /api/products/{id}/materials`
- `PUT|DELETE /api/products/{id}/materials/{rawMaterialId}`
- `GET|POST /api/raw-materials`
- `GET|PUT|DELETE /api/raw-materials/{id}`
- `GET /api/production/suggestion`

## Observações

- Migrações são aplicadas automaticamente pelo Flyway no backend.
- O frontend usa proxy para `/api` em desenvolvimento e Nginx reverse proxy em Docker.
