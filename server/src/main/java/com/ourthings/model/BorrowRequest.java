package com.ourthings.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
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

    @Column(name = "pricing_type", length = 30)
    private String pricingType = "FREE";

    @Column(name = "daily_rate_inr", precision = 10, scale = 2)
    private BigDecimal dailyRateInr = BigDecimal.ZERO;

    @Column(name = "rental_days")
    private Integer rentalDays = 1;

    @Column(name = "rental_total_inr", precision = 10, scale = 2)
    private BigDecimal rentalTotalInr = BigDecimal.ZERO;

    @Column(name = "security_deposit_inr", precision = 10, scale = 2)
    private BigDecimal securityDepositInr = BigDecimal.ZERO;

    @Column(name = "total_estimated_cost_inr", precision = 10, scale = 2)
    private BigDecimal totalEstimatedCostInr = BigDecimal.ZERO;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "FREE"; // FREE, DEPOSIT_PENDING, DEPOSIT_HELD, PAID, REFUNDED

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

    public String getPricingType() { return pricingType != null ? pricingType : "FREE"; }
    public void setPricingType(String pricingType) { this.pricingType = pricingType; }

    public BigDecimal getDailyRateInr() { return dailyRateInr != null ? dailyRateInr : BigDecimal.ZERO; }
    public void setDailyRateInr(BigDecimal dailyRateInr) { this.dailyRateInr = dailyRateInr; }

    public Integer getRentalDays() { return rentalDays != null ? rentalDays : 1; }
    public void setRentalDays(Integer rentalDays) { this.rentalDays = rentalDays; }

    public BigDecimal getRentalTotalInr() { return rentalTotalInr != null ? rentalTotalInr : BigDecimal.ZERO; }
    public void setRentalTotalInr(BigDecimal rentalTotalInr) { this.rentalTotalInr = rentalTotalInr; }

    public BigDecimal getSecurityDepositInr() { return securityDepositInr != null ? securityDepositInr : BigDecimal.ZERO; }
    public void setSecurityDepositInr(BigDecimal securityDepositInr) { this.securityDepositInr = securityDepositInr; }

    public BigDecimal getTotalEstimatedCostInr() { return totalEstimatedCostInr != null ? totalEstimatedCostInr : BigDecimal.ZERO; }
    public void setTotalEstimatedCostInr(BigDecimal totalEstimatedCostInr) { this.totalEstimatedCostInr = totalEstimatedCostInr; }

    public String getPaymentStatus() { return paymentStatus != null ? paymentStatus : "FREE"; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

