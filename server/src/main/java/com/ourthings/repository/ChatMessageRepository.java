package com.ourthings.repository;

import com.ourthings.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE m.itemId = :itemId AND ((m.senderId = :u1 AND m.recipientId = :u2) OR (m.senderId = :u2 AND m.recipientId = :u1)) ORDER BY m.createdAt ASC")
    List<ChatMessage> findThread(@Param("itemId") Long itemId, @Param("u1") Long u1, @Param("u2") Long u2);

    List<ChatMessage> findByRequestIdOrderByCreatedAtAsc(Long requestId);

    @Query("SELECT m FROM ChatMessage m WHERE m.senderId = :userId OR m.recipientId = :userId ORDER BY m.createdAt DESC")
    List<ChatMessage> findUserMessages(@Param("userId") Long userId);
}

