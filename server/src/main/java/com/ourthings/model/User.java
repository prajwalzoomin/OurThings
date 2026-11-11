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

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(length = 100)
    private String city = "Bengaluru";

    @Column(length = 20)
    private String pincode = "560103";

    @Column(length = 255)
    private String address;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "active_community_id")
    private Long activeCommunityId;

    @Column(name = "trust_score_percent")
    private Integer trustScorePercent = 98;

    @Column(name = "completed_loans_count")
    private Integer completedLoansCount = 0;

    @Column(name = "completed_borrows_count")
    private Integer completedBorrowsCount = 0;

    @Column(name = "is_id_verified")
    private Boolean isIdVerified = true;

    @Column(length = 255)
    private String badges = "VERIFIED_RESIDENT";

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

    public User(String name, String email, String phone, String roomOrFlat, String avatarUrl, Long activeCommunityId, String role) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.roomOrFlat = roomOrFlat;
        this.avatarUrl = avatarUrl;
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

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Long getActiveCommunityId() { return activeCommunityId; }
    public void setActiveCommunityId(Long activeCommunityId) { this.activeCommunityId = activeCommunityId; }

    public Integer getTrustScorePercent() { return trustScorePercent != null ? trustScorePercent : 98; }
    public void setTrustScorePercent(Integer trustScorePercent) { this.trustScorePercent = trustScorePercent; }

    public Integer getCompletedLoansCount() { return completedLoansCount != null ? completedLoansCount : 0; }
    public void setCompletedLoansCount(Integer completedLoansCount) { this.completedLoansCount = completedLoansCount; }

    public Integer getCompletedBorrowsCount() { return completedBorrowsCount != null ? completedBorrowsCount : 0; }
    public void setCompletedBorrowsCount(Integer completedBorrowsCount) { this.completedBorrowsCount = completedBorrowsCount; }

    public Boolean getIsIdVerified() { return isIdVerified != null ? isIdVerified : true; }
    public void setIsIdVerified(Boolean isIdVerified) { this.isIdVerified = isIdVerified; }

    public String getBadges() { return badges != null ? badges : "VERIFIED_RESIDENT"; }
    public void setBadges(String badges) { this.badges = badges; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

