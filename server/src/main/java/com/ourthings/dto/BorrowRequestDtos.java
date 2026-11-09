package com.ourthings.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BorrowRequestDtos {

    public static class CreateBorrowRequest {
        private Long itemId;
        private LocalDate startDate;
        private LocalDate endDate;
        private String borrowPurpose;

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

        public String getBorrowPurpose() { return borrowPurpose; }
        public void setBorrowPurpose(String borrowPurpose) { this.borrowPurpose = borrowPurpose; }
    }

    public static class HandoverSummaryDto {
        private Long id;
        private LocalDateTime handedOverAt;
        private String initialConditionNotes;
        private LocalDate plannedReturnDate;
        private LocalDateTime returnedAt;
        private String returnConditionNotes;
        private Boolean issueReported;
        private String issueDetails;
        private Boolean confirmedByOwner;
        private Boolean confirmedByBorrower;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

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
    }

    public static class BorrowRequestResponseDto {
        private Long id;
        private Long itemId;
        private String itemTitle;
        private String itemCategory;
        private String itemPickupLocation;
        private Long communityId;
        private Long borrowerId;
        private String borrowerName;
        private String borrowerPhone;
        private String borrowerRoomOrFlat;
        private Long ownerId;
        private String ownerName;
        private String ownerPhone;
        private String ownerRoomOrFlat;
        private LocalDate startDate;
        private LocalDate endDate;
        private String borrowPurpose;
        private String status;
        private LocalDateTime createdAt;
        private Boolean hasConflictingPendingRequests;
        private HandoverSummaryDto handoverRecord;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public String getItemTitle() { return itemTitle; }
        public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }

        public String getItemCategory() { return itemCategory; }
        public void setItemCategory(String itemCategory) { this.itemCategory = itemCategory; }

        public String getItemPickupLocation() { return itemPickupLocation; }
        public void setItemPickupLocation(String itemPickupLocation) { this.itemPickupLocation = itemPickupLocation; }

        public Long getCommunityId() { return communityId; }
        public void setCommunityId(Long communityId) { this.communityId = communityId; }

        public Long getBorrowerId() { return borrowerId; }
        public void setBorrowerId(Long borrowerId) { this.borrowerId = borrowerId; }

        public String getBorrowerName() { return borrowerName; }
        public void setBorrowerName(String borrowerName) { this.borrowerName = borrowerName; }

        public String getBorrowerPhone() { return borrowerPhone; }
        public void setBorrowerPhone(String borrowerPhone) { this.borrowerPhone = borrowerPhone; }

        public String getBorrowerRoomOrFlat() { return borrowerRoomOrFlat; }
        public void setBorrowerRoomOrFlat(String borrowerRoomOrFlat) { this.borrowerRoomOrFlat = borrowerRoomOrFlat; }

        public Long getOwnerId() { return ownerId; }
        public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

        public String getOwnerPhone() { return ownerPhone; }
        public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

        public String getOwnerRoomOrFlat() { return ownerRoomOrFlat; }
        public void setOwnerRoomOrFlat(String ownerRoomOrFlat) { this.ownerRoomOrFlat = ownerRoomOrFlat; }

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

        public Boolean getHasConflictingPendingRequests() { return hasConflictingPendingRequests; }
        public void setHasConflictingPendingRequests(Boolean hasConflictingPendingRequests) { this.hasConflictingPendingRequests = hasConflictingPendingRequests; }

        public HandoverSummaryDto getHandoverRecord() { return handoverRecord; }
        public void setHandoverRecord(HandoverSummaryDto handoverRecord) { this.handoverRecord = handoverRecord; }
    }
}

