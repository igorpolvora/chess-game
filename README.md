# ♞ ChessMaster

Jogo de xadrez fullstack com backend em Java (Spring Boot) e frontend em HTML/CSS/JS puro.

## Tecnologias

**Backend**
- Java 21+
- Spring Boot 3.4.5
- Spring Web (API REST)
- Spring WebSocket (STOMP)
- Maven

**Frontend**
- HTML5 / CSS3 / JavaScript puro
- Google Fonts (Syne + DM Mono)
- Live Server (desenvolvimento)

---

## Funcionalidades

- Tabuleiro interativo com clique para selecionar e mover peças
- Destaque visual dos movimentos possíveis
- Movimentos especiais: roque, en passant e promoção de peão
- Detecção de xeque e xeque-mate
- Painel com peças capturadas e contador de turnos
- Comunicação em tempo real entre frontend e backend via API REST

---

## Estrutura do projeto

```
chess-system-java/
├── backend/                        # Spring Boot
│   └── src/main/java/com/chessmaster/
│       ├── ChessBackendApplication.java
│       ├── GameController.java
│       ├── CorsConfig.java
│       ├── WebSocketConfig.java
│       ├── chess/
│       │   ├── ChessMatch.java
│       │   ├── ChessPiece.java
│       │   ├── ChessPosition.java
│       │   ├── ChessException.java
│       │   ├── Color.java
│       │   └── pieces/
│       │       ├── Bishop.java
│       │       ├── King.java
│       │       ├── Knight.java
│       │       ├── Pawn.java
│       │       ├── Queen.java
│       │       └── Rook.java
│       └── boardgame/
│           ├── Board.java
│           ├── BoardException.java
│           ├── Piece.java
│           └── Position.java
└── chess-frontend/                 # Frontend
    ├── index.html
    ├── styles.css
    └── script.js
```

---

## Como rodar localmente

### Pré-requisitos

- Java 21+
- Maven 3.9+
- Navegador moderno
- Extensão Live Server (VS Code) ou qualquer servidor HTTP estático

### 1. Iniciar o backend

```bash
cd backend
mvn spring-boot:run
```

O servidor sobe em `http://localhost:8080`.

### 2. Abrir o frontend

Abra o `chess-frontend/index.html` com o Live Server do VS Code ou qualquer servidor HTTP local.

> **Atenção:** abrir o HTML diretamente como `file://` não funciona por restrições de CORS do navegador. Use sempre um servidor local.

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/game` | Cria uma nova partida |
| `GET` | `/api/game/{id}` | Retorna o estado atual do jogo |
| `POST` | `/api/game/{id}/possible-moves` | Retorna os movimentos possíveis de uma peça |
| `POST` | `/api/game/{id}/move` | Executa um movimento |

### Exemplo de requisição — criar partida

```bash
curl -X POST http://localhost:8080/api/game
```

### Exemplo de resposta

```json
{
  "gameId": "uuid-aqui",
  "turn": 1,
  "currentPlayer": "WHITE",
  "check": false,
  "checkMate": false,
  "board": [[...]]
}
```

---

## Próximos passos

- [ ] Persistência com PostgreSQL e Spring Data JPA
- [ ] Autenticação com Spring Security + JWT
- [ ] Sistema de ranking ELO
- [ ] Modo online com WebSocket (STOMP)
- [ ] Campeonatos e torneios
- [ ] Deploy na nuvem

---

## Origem do projeto

Este projeto começou como um jogo de xadrez para console em Java puro e foi escalado para uma aplicação web fullstack com API REST.
