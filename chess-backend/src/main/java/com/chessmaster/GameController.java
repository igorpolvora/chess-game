package com.chessmaster;


import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.chessmaster.chess.ChessException;
import com.chessmaster.chess.ChessMatch;
import com.chessmaster.chess.ChessPiece;
import com.chessmaster.chess.ChessPosition;

@RestController
@RequestMapping("/api/game")
public class GameController {

    private final Map<String, ChessMatch> games = new ConcurrentHashMap<>();
    
    public GameController() {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateGameResponse createGame() {
        String gameId = UUID.randomUUID().toString();
        ChessMatch chessMatch = new ChessMatch();
        games.put(gameId, chessMatch);
        CreateGameResponse response = new CreateGameResponse();
        response.gameId = gameId;
        applyGameState(chessMatch, response);
        return response;
    }

    @GetMapping("/{id}")
    public GameStateResponse getGame(@PathVariable String id) {
        ChessMatch chessMatch = getChessMatch(id);
        return buildGameStateResponse(chessMatch);
    }

    @PostMapping("/{id}/possible-moves")
    public boolean[][] possibleMoves(@PathVariable String id, @RequestBody PositionRequest request) {
        ChessMatch chessMatch = getChessMatch(id);
        ChessPosition source = toChessPosition(request.from);
        return chessMatch.possibleMoves(source);
    }

    @PostMapping("/{id}/move")
public GameStateResponse performMove(@PathVariable String id, @RequestBody MoveRequest request) {
    ChessMatch chessMatch = getChessMatch(id);
    ChessPosition source = toChessPosition(request.from);
    ChessPosition target = toChessPosition(request.to);
    chessMatch.performChessMove(source, target);
    return buildGameStateResponse(chessMatch); // sem broadcast por enquanto
}

    @ExceptionHandler(ChessException.class)
    public ResponseEntity<Map<String, String>> handleChessException(ChessException ex) {
        return ResponseEntity.badRequest().body(Collections.singletonMap("error", ex.getMessage()));
    }

    private ChessMatch getChessMatch(String id) {
        ChessMatch chessMatch = games.get(id);
        if (chessMatch == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found: " + id);
        }
        return chessMatch;
    }

    private ChessPosition toChessPosition(String notation) {
        if (notation == null || notation.length() != 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid position: " + notation);
        }
        char column = notation.charAt(0);
        int row = Character.getNumericValue(notation.charAt(1));
        try {
            return new ChessPosition(column, row);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    private GameStateResponse buildGameStateResponse(ChessMatch chessMatch) {
        GameStateResponse response = new GameStateResponse();
        applyGameState(chessMatch, response);
        return response;
    }

    private void applyGameState(ChessMatch chessMatch, GameStateResponse response) {
        response.turn = chessMatch.getTurn();
        response.currentPlayer = chessMatch.getCurrentPlayer().name();
        response.check = chessMatch.getCheck();
        response.checkMate = chessMatch.getCheckMate();
        response.board = toBoard(chessMatch.getPieces());
    }

    private PieceDto[][] toBoard(ChessPiece[][] pieces) {
        PieceDto[][] board = new PieceDto[pieces.length][pieces[0].length];
        for (int i = 0; i < pieces.length; i++) {
            for (int j = 0; j < pieces[i].length; j++) {
                ChessPiece p = pieces[i][j];
                board[i][j] = (p == null) ? null : new PieceDto(p.toString(), p.getColor().name());
            }
        }
        return board;
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    public static class CreateGameResponse extends GameStateResponse {
        public String gameId;
    }

    public static class GameStateResponse {
        public int turn;
        public String currentPlayer;
        public boolean check;
        public boolean checkMate;
        public PieceDto[][] board;
    }

    public static class PositionRequest {
        public String from;
    }

    public static class MoveRequest {
        public String from;
        public String to;
    }

    public static class PieceDto {
        public String type;
        public String color;

        public PieceDto(String type, String color) {
            this.type = type;
            this.color = color;
        }
    }
}