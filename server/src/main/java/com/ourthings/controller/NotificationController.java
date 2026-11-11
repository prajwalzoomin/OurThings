package com.ourthings.controller;

import com.ourthings.dto.NotificationDtos.NotificationDto;
import com.ourthings.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.ok(Map.of("unreadCount", 0));
        }
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userId)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@RequestHeader(value = "X-User-Id", required = false) Long userId, @PathVariable Long id) {
        if (userId != null) {
            notificationService.markAsRead(id, userId);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId != null) {
            notificationService.markAllAsRead(userId);
        }
        return ResponseEntity.ok().build();
    }
}
