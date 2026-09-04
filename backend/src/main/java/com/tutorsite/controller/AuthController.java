package com.tutorsite.controller;

import com.tutorsite.dto.RegistrationForm;
import com.tutorsite.dto.auth.AuthResponse;
import com.tutorsite.dto.auth.LoginRequest;
import com.tutorsite.dto.auth.UserDto;
import com.tutorsite.model.User;
import com.tutorsite.security.JwtService;
import com.tutorsite.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final UserService userService;

    private final JwtService jwtService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userService.getByEmail(request.getEmail());
        return buildResponse(user);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegistrationForm form) {
        User user = userService.registerStudent(form);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildResponse(user));
    }

    @GetMapping("/me")
    public UserDto me(Authentication authentication) {
        if (authentication == null) {
            throw new AuthenticationCredentialsNotFoundException("Требуется вход в систему");
        }
        return UserDto.from(userService.getByEmail(authentication.getName()));
    }

    private AuthResponse buildResponse(User user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user.getEmail(), user.getRole().name()))
                .expiresInMs(jwtService.getExpirationMs())
                .user(UserDto.from(user))
                .build();
    }
}
