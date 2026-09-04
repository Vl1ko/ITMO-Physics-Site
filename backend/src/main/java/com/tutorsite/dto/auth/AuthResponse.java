package com.tutorsite.dto.auth;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponse {
    String token;
    long expiresInMs;
    UserDto user;
}
