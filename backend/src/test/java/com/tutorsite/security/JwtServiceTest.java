package com.tutorsite.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-key-with-at-least-32-chars";

    private final JwtService jwtService = new JwtService(SECRET, 60_000);

    @Test
    @DisplayName("в токене лежит email и он валидный")
    void generateAndParse() {
        String token = jwtService.generateToken("user@test.local", "STUDENT");

        assertThat(jwtService.isValid(token)).isTrue();
        assertThat(jwtService.extractEmail(token)).isEqualTo("user@test.local");
    }

    @Test
    @DisplayName("протухший токен не проходит")
    void expiredTokenRejected() {
        JwtService expiring = new JwtService(SECRET, -1_000);
        assertThat(expiring.isValid(expiring.generateToken("user@test.local", "STUDENT"))).isFalse();
    }

    @Test
    @DisplayName("токен с чужой подписью отклоняем")
    void foreignSignatureRejected() {
        JwtService other = new JwtService("another-secret-key-with-at-least-32-chars!", 60_000);
        String foreignToken = other.generateToken("hacker@test.local", "ADMIN");

        assertThat(jwtService.isValid(foreignToken)).isFalse();
    }

    @Test
    @DisplayName("мусор вместо токена не проходит")
    void garbageRejected() {
        assertThat(jwtService.isValid("not-a-jwt")).isFalse();
    }
}
