package com.ourthings.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_requests")
public class BorrowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "community_id", nullable = false)
    private Long communityId;

    @Column(name = "borrower_id", nullable = false)
    private Long borrowerId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "borrow_purpose", columnDefinition = "TEXT")
    private String borrowPurpose;

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, DECLINED, WITHDRAWN, ACTIVE, RETURNED, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public BorrowRequest() {}

    public BorrowRequest(Long itemId, Long communityId, Long borrowerId, LocalDate startDate, LocalDate endDate, String borrowPurpose) {
        this.itemId = itemId;
        this.communityId = communityId;
        this.borrowerId = borrowerId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.borrowPurpose = borrowPurpose;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public Long getBorrowerId() { return borrowerId; }
    public void setBorrowerId(Long borrowerId) { this.borrowerId = borrowerId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getBorrowPurpose() { return borrowPurpose; }
    public void setBorrowPurpose(String borrowPurpose) { this.borrowPurpose = borrowPurpose; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
