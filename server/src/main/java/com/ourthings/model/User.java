package com.ourthings.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(name = "room_or_flat", length = 50)
    private String roomOrFlat;

    @Column(name = "active_community_id")
    private Long activeCommunityId;

    @Column(length = 50)
    private String role = "MEMBER";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String name, String email, String phone, String roomOrFlat, Long activeCommunityId, String role) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.roomOrFlat = roomOrFlat;
        this.activeCommunityId = activeCommunityId;
        this.role = role != null ? role : "MEMBER";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRoomOrFlat() { return roomOrFlat; }
    public void setRoomOrFlat(String roomOrFlat) { this.roomOrFlat = roomOrFlat; }

    public Long getActiveCommunityId() { return activeCommunityId; }
    public void setActiveCommunityId(Long activeCommunityId) { this.activeCommunityId = activeCommunityId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
