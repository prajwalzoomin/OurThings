package com.ourthings.dto;

import java.time.LocalDateTime;

public class ChatDtos {

    public static class SendMessageRequest {
        private Long itemId;
        private Long requestId;
        private Long recipientId;
        private String messageText;

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public Long getRequestId() { return requestId; }
        public void setRequestId(Long requestId) { this.requestId = requestId; }

        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

        public String getMessageText() { return messageText; }
        public void setMessageText(String messageText) { this.messageText = messageText; }
    }

    public static class ChatMessageDto {
        private Long id;
        private Long itemId;
        private Long requestId;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private Long recipientId;
        private String messageText;
        private Boolean isRead;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public Long getRequestId() { return requestId; }
        public void setRequestId(Long requestId) { this.requestId = requestId; }

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getSenderAvatar() { return senderAvatar; }
        public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }

        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

        public String getMessageText() { return messageText; }
        public void setMessageText(String messageText) { this.messageText = messageText; }

        public Boolean getIsRead() { return isRead; }
        public void setIsRead(Boolean isRead) { this.isRead = isRead; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class ConversationSummaryDto {
        private Long itemId;
        private String itemTitle;
        private String itemImageUrl;
        private Long otherUserId;
        private String otherUserName;
        private String otherUserAvatar;
        private String lastMessageText;
        private LocalDateTime lastMessageTime;
        private Integer unreadCount;

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public String getItemTitle() { return itemTitle; }
        public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }

        public String getItemImageUrl() { return itemImageUrl; }
        public void setItemImageUrl(String itemImageUrl) { this.itemImageUrl = itemImageUrl; }

        public Long getOtherUserId() { return otherUserId; }
        public void setOtherUserId(Long otherUserId) { this.otherUserId = otherUserId; }

        public String getOtherUserName() { return otherUserName; }
        public void setOtherUserName(String otherUserName) { this.otherUserName = otherUserName; }

        public String getOtherUserAvatar() { return otherUserAvatar; }
        public void setOtherUserAvatar(String otherUserAvatar) { this.otherUserAvatar = otherUserAvatar; }

        public String getLastMessageText() { return lastMessageText; }
        public void setLastMessageText(String lastMessageText) { this.lastMessageText = lastMessageText; }

        public LocalDateTime getLastMessageTime() { return lastMessageTime; }
        public void setLastMessageTime(LocalDateTime lastMessageTime) { this.lastMessageTime = lastMessageTime; }

        public Integer getUnreadCount() { return unreadCount; }
        public void setUnreadCount(Integer unreadCount) { this.unreadCount = unreadCount; }
    }
}
