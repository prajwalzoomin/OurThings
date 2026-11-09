package com.ourthings.controller;

import com.ourthings.dto.AuthDtos.*;
import com.ourthings.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/users")
    public List<UserDto> getUsers() {
        return authService.getAllUsers();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            // Default to first user if not set
            List<UserDto> users = authService.getAllUsers();
            if (users.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(users.get(0));
        }
        return authService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody RegisterRequest req) {
        UserDto created = authService.register(req);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/switch-community")
    public ResponseEntity<UserDto> switchCommunity(@RequestHeader("X-User-Id") Long userId,
                                                   @RequestBody Map<String, Long> payload) {
        Long communityId = payload.get("communityId");
        if (communityId == null) {
            return ResponseEntity.badRequest().build();
        }
        UserDto updated = authService.switchActiveCommunity(userId, communityId);
        return ResponseEntity.ok(updated);
    }
}

