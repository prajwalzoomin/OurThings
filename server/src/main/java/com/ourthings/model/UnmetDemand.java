package com.ourthings.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "unmet_demands")
public class UnmetDemand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_id", nullable = false)
    private Long communityId;

    @Column(name = "requester_id", nullable = false)
    private Long requesterId;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "normalized_name", nullable = false, length = 200)
    private String normalizedName;

    @Column(name = "needed_from")
    private LocalDate neededFrom;

    @Column(name = "needed_to")
    private LocalDate neededTo;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, length = 50)
    private String status = "OPEN"; // OPEN, FULFILLED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public UnmetDemand() {}

    public UnmetDemand(Long communityId, Long requesterId, String category, String itemName,
                       String normalizedName, LocalDate neededFrom, LocalDate neededTo, String notes) {
        this.communityId = communityId;
        this.requesterId = requesterId;
        this.category = category;
        this.itemName = itemName;
        this.normalizedName = normalizedName;
        this.neededFrom = neededFrom;
        this.neededTo = neededTo;
        this.notes = notes;
        this.status = "OPEN";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public Long getRequesterId() { return requesterId; }
    public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getNormalizedName() { return normalizedName; }
    public void setNormalizedName(String normalizedName) { this.normalizedName = normalizedName; }

    public LocalDate getNeededFrom() { return neededFrom; }
    public void setNeededFrom(LocalDate neededFrom) { this.neededFrom = neededFrom; }

    public LocalDate getNeededTo() { return neededTo; }
    public void setNeededTo(LocalDate neededTo) { this.neededTo = neededTo; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
