package com.ourthings.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_memberships", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "community_id"})
})
public class CommunityMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "community_id", nullable = false)
    private Long communityId;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();

    public CommunityMembership() {}

    public CommunityMembership(Long userId, Long communityId) {
        this.userId = userId;
        this.communityId = communityId;
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
