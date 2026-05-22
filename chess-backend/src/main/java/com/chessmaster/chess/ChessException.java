package com.chessmaster.chess;

import com.chessmaster.boardgame.BoardException;

public class ChessException extends BoardException {

    private static final long serialVersionUID = 1L;

    public ChessException(String msg) {
        super(msg);
    }

}
