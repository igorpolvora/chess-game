package com.chessmaster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"application", "com.chessmaster"})
public class ChessBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChessBackendApplication.class, args);
    }
}
