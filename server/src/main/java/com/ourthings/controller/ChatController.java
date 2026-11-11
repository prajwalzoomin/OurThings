package com.ourthings.controller;

import com.ourthings.dto.ChatDtos.*;
import com.ourthings.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/thread")
    public ResponseEntity<List<ChatMessageDto>> getThread(@RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                                                          @RequestParam Long itemId,
                                                          @RequestParam Long otherUserId) {
        if (currentUserId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(chatService.getThread(itemId, currentUserId, otherUserId));
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<ChatMessageDto>> getRequestThread(@RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                                                                 @PathVariable Long requestId) {
        if (currentUserId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(chatService.getRequestThread(requestId, currentUserId));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummaryDto>> getConversations(@RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        if (currentUserId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(chatService.getUserConversations(currentUserId));
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
                                                      @RequestBody SendMessageRequest req) {
        if (currentUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(chatService.sendMessage(currentUserId, req));
    }
}
