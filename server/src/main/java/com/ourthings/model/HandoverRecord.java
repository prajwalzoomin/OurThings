package com.ourthings.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "handover_records")
public class HandoverRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false, unique = true)
    private Long requestId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "handed_over_at")
    private LocalDateTime handedOverAt;

    @Column(name = "initial_condition_notes", columnDefinition = "TEXT")
    private String initialConditionNotes;

    @Column(name = "planned_return_date", nullable = false)
    private LocalDate plannedReturnDate;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(name = "return_condition_notes", columnDefinition = "TEXT")
    private String returnConditionNotes;

    @Column(name = "issue_reported")
    private Boolean issueReported = false;

    @Column(name = "issue_details", columnDefinition = "TEXT")
    private String issueDetails;

    @Column(name = "confirmed_by_owner")
    private Boolean confirmedByOwner = false;

    @Column(name = "confirmed_by_borrower")
    private Boolean confirmedByBorrower = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public HandoverRecord() {}

    public HandoverRecord(Long requestId, Long itemId, LocalDate plannedReturnDate) {
        this.requestId = requestId;
        this.itemId = itemId;
        this.plannedReturnDate = plannedReturnDate;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public LocalDateTime getHandedOverAt() { return handedOverAt; }
    public void setHandedOverAt(LocalDateTime handedOverAt) { this.handedOverAt = handedOverAt; }

    public String getInitialConditionNotes() { return initialConditionNotes; }
    public void setInitialConditionNotes(String initialConditionNotes) { this.initialConditionNotes = initialConditionNotes; }

    public LocalDate getPlannedReturnDate() { return plannedReturnDate; }
    public void setPlannedReturnDate(LocalDate plannedReturnDate) { this.plannedReturnDate = plannedReturnDate; }

    public LocalDateTime getReturnedAt() { return returnedAt; }
    public void setReturnedAt(LocalDateTime returnedAt) { this.returnedAt = returnedAt; }

    public String getReturnConditionNotes() { return returnConditionNotes; }
    public void setReturnConditionNotes(String returnConditionNotes) { this.returnConditionNotes = returnConditionNotes; }

    public Boolean getIssueReported() { return issueReported; }
    public void setIssueReported(Boolean issueReported) { this.issueReported = issueReported; }

    public String getIssueDetails() { return issueDetails; }
    public void setIssueDetails(String issueDetails) { this.issueDetails = issueDetails; }

    public Boolean getConfirmedByOwner() { return confirmedByOwner; }
    public void setConfirmedByOwner(Boolean confirmedByOwner) { this.confirmedByOwner = confirmedByOwner; }

    public Boolean getConfirmedByBorrower() { return confirmedByBorrower; }
    public void setConfirmedByBorrower(Boolean confirmedByBorrower) { this.confirmedByBorrower = confirmedByBorrower; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

