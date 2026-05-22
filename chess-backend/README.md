# Chess Backend

Backend Spring Boot para um jogo de xadrez, com API REST para criar partidas, consultar estado e executar movimentos.

## Visão geral

- Linguagem: Java 21
- Build: Maven
- Framework: Spring Boot 4.0.6
- API base: `/api/game`
- Armazenamento: partidas mantidas em memória no servidor
- CORS habilitado para origem local de desenvolvimento

## Requisitos

- Java 21
- Maven ou `./mvnw` (wrapper)

## Como executar

1. Abra o terminal na pasta do projeto:
   ```bash
   cd chess-backend
   ```

2. Compile o projeto:
   ```bash
   ./mvnw clean package
   ```

3. Execute a aplicação:
   ```bash
   ./mvnw spring-boot:run
   ```

A aplicação será iniciada na porta padrão do Spring Boot (`8080`).

## Endpoints da API

### Criar nova partida

- Método: `POST`
- URL: `/api/game`
- Resposta: `201 Created`
- Retorna um objeto com `gameId` e estado inicial do tabuleiro.

### Obter estado da partida

- Método: `GET`
- URL: `/api/game/{id}`
- Retorna o estado atual da partida, incluindo:
  - `turn`
  - `currentPlayer`
  - `check`
  - `checkMate`
  - `board`

### Consultar movimentos possíveis

- Método: `POST`
- URL: `/api/game/{id}/possible-moves`
- Body JSON:
  ```json
  {
    "from": "e2"
  }
  ```
- Retorna uma matriz `boolean[][]` indicando os movimentos válidos para a peça selecionada.

### Executar um movimento

- Método: `POST`
- URL: `/api/game/{id}/move`
- Body JSON:
  ```json
  {
    "from": "e2",
    "to": "e4"
  }
  ```
- Retorna o novo estado da partida após o movimento.

## Configuração de CORS

O projeto permite requisições de frontend nas origens:

- `http://localhost:5500`
- `http://127.0.0.1:5500`
- `http://localhost:3000`

## Observações

- O backend atualmente usa partidas em memória, sem persistência de banco de dados.
- Há dependência de runtime para PostgreSQL no `pom.xml`, mas a aplicação não está configurada para uso de banco de dados por padrão.
- Para usar o frontend local, acesse o diretório `../chess-frontend` e sirva a aplicação separadamente.
