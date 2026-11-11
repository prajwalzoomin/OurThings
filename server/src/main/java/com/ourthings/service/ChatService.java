package com.ourthings.service;

import com.ourthings.dto.ChatDtos.*;
import com.ourthings.model.ChatMessage;
import com.ourthings.model.ItemListing;
import com.ourthings.model.User;
import com.ourthings.repository.ChatMessageRepository;
import com.ourthings.repository.ItemListingRepository;
import com.ourthings.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ItemListingRepository itemListingRepository;
    private final UserRepository userRepository;

    public ChatService(ChatMessageRepository chatMessageRepository,
                       ItemListingRepository itemListingRepository,
                       UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.itemListingRepository = itemListingRepository;
        this.userRepository = userRepository;
    }

    public List<ChatMessageDto> getThread(Long itemId, Long u1, Long u2) {
        List<ChatMessage> list = chatMessageRepository.findThread(itemId, u1, u2);
        // Mark as read for u1
        for (ChatMessage m : list) {
            if (m.getRecipientId().equals(u1) && !Boolean.TRUE.equals(m.getIsRead())) {
                m.setIsRead(true);
                chatMessageRepository.save(m);
            }
        }
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ChatMessageDto> getRequestThread(Long requestId, Long currentUserId) {
        List<ChatMessage> list = chatMessageRepository.findByRequestIdOrderByCreatedAtAsc(requestId);
        for (ChatMessage m : list) {
            if (m.getRecipientId().equals(currentUserId) && !Boolean.TRUE.equals(m.getIsRead())) {
                m.setIsRead(true);
                chatMessageRepository.save(m);
            }
        }
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDto sendMessage(Long senderId, SendMessageRequest req) {
        if (req.getMessageText() == null || req.getMessageText().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty.");
        }
        if (req.getItemId() == null) {
            throw new IllegalArgumentException("Item ID is required for chat context.");
        }

        ItemListing item = itemListingRepository.findById(req.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + req.getItemId()));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender user not found: " + senderId));

        Long recipientId = req.getRecipientId();
        if (recipientId == null) {
            // Default recipient is item owner if sender is not owner
            recipientId = senderId.equals(item.getOwnerId()) ? null : item.getOwnerId();
            if (recipientId == null) {
                throw new IllegalArgumentException("Recipient must be specified.");
            }
        }

        ChatMessage message = new ChatMessage(
                item.getId(),
                req.getRequestId(),
                senderId,
                sender.getName(),
                sender.getAvatarUrl(),
                recipientId,
                req.getMessageText().trim()
        );

        message = chatMessageRepository.save(message);
        return toDto(message);
    }

    public List<ConversationSummaryDto> getUserConversations(Long userId) {
        List<ChatMessage> messages = chatMessageRepository.findUserMessages(userId);
        Map<String, ChatMessage> latestByConv = new LinkedHashMap<>();
        Map<String, Integer> unreadByConv = new HashMap<>();

        for (ChatMessage m : messages) {
            Long otherUser = m.getSenderId().equals(userId) ? m.getRecipientId() : m.getSenderId();
            String key = m.getItemId() + "_" + otherUser;

            if (!latestByConv.containsKey(key)) {
                latestByConv.put(key, m);
            }
            if (m.getRecipientId().equals(userId) && !Boolean.TRUE.equals(m.getIsRead())) {
                unreadByConv.put(key, unreadByConv.getOrDefault(key, 0) + 1);
            }
        }

        List<ConversationSummaryDto> result = new ArrayList<>();
        for (Map.Entry<String, ChatMessage> entry : latestByConv.entrySet()) {
            String key = entry.getKey();
            ChatMessage lastMsg = entry.getValue();
            Long otherUserId = lastMsg.getSenderId().equals(userId) ? lastMsg.getRecipientId() : lastMsg.getSenderId();

            ConversationSummaryDto summary = new ConversationSummaryDto();
            summary.setItemId(lastMsg.getItemId());
            summary.setOtherUserId(otherUserId);
            summary.setLastMessageText(lastMsg.getMessageText());
            summary.setLastMessageTime(lastMsg.getCreatedAt());
            summary.setUnreadCount(unreadByConv.getOrDefault(key, 0));

            itemListingRepository.findById(lastMsg.getItemId()).ifPresent(it -> {
                summary.setItemTitle(it.getTitle());
                summary.setItemImageUrl(it.getImageUrl());
            });

            userRepository.findById(otherUserId).ifPresent(u -> {
                summary.setOtherUserName(u.getName());
                summary.setOtherUserAvatar(u.getAvatarUrl());
            });

            result.add(summary);
        }

        return result;
    }

    public ChatMessageDto toDto(ChatMessage m) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(m.getId());
        dto.setItemId(m.getItemId());
        dto.setRequestId(m.getRequestId());
        dto.setSenderId(m.getSenderId());
        dto.setSenderName(m.getSenderName());
        dto.setSenderAvatar(m.getSenderAvatar());
        dto.setRecipientId(m.getRecipientId());
        dto.setMessageText(m.getMessageText());
        dto.setIsRead(m.getIsRead());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
