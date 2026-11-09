package com.ourthings.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_listings")
public class ItemListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_id", nullable = false)
    private Long communityId;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "item_condition", nullable = false, length = 50)
    private String itemCondition;

    @Column(name = "pickup_location", nullable = false, length = 255)
    private String pickupLocation;

    @Column(name = "available_from", nullable = false)
    private LocalDate availableFrom;

    @Column(name = "available_to", nullable = false)
    private LocalDate availableTo;

    @Column(name = "estimated_replacement_value_inr", precision = 10, scale = 2)
    private BigDecimal estimatedReplacementValueInr;

    @Column(nullable = false, length = 50)
    private String status = "AVAILABLE"; // AVAILABLE, PAUSED, LENT, INACTIVE

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ItemListing() {}

    public ItemListing(Long communityId, Long ownerId, String title, String description,
                       String category, String itemCondition, String pickupLocation,
                       LocalDate availableFrom, LocalDate availableTo, BigDecimal estimatedReplacementValueInr) {
        this.communityId = communityId;
        this.ownerId = ownerId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.itemCondition = itemCondition;
        this.pickupLocation = pickupLocation;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.estimatedReplacementValueInr = estimatedReplacementValueInr;
        this.status = "AVAILABLE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getItemCondition() { return itemCondition; }
    public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public LocalDate getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDate availableFrom) { this.availableFrom = availableFrom; }

    public LocalDate getAvailableTo() { return availableTo; }
    public void setAvailableTo(LocalDate availableTo) { this.availableTo = availableTo; }

    public BigDecimal getEstimatedReplacementValueInr() { return estimatedReplacementValueInr; }
    public void setEstimatedReplacementValueInr(BigDecimal estimatedReplacementValueInr) { this.estimatedReplacementValueInr = estimatedReplacementValueInr; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
