package com.ourthings.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class HandoverDtos {

    public static class RecordHandoverRequest {
        private String initialConditionNotes;
        private LocalDate plannedReturnDate;
        private String handoverPhotoUrl;

        public String getInitialConditionNotes() { return initialConditionNotes; }
        public void setInitialConditionNotes(String initialConditionNotes) { this.initialConditionNotes = initialConditionNotes; }

        public LocalDate getPlannedReturnDate() { return plannedReturnDate; }
        public void setPlannedReturnDate(LocalDate plannedReturnDate) { this.plannedReturnDate = plannedReturnDate; }

        public String getHandoverPhotoUrl() { return handoverPhotoUrl; }
        public void setHandoverPhotoUrl(String handoverPhotoUrl) { this.handoverPhotoUrl = handoverPhotoUrl; }
    }

    public static class RecordReturnRequest {
        private String returnConditionNotes;
        private String returnPhotoUrl;
        private Boolean depositRefunded;
        private BigDecimal depositDeductionInr;
        private String depositDeductionReason;
        private Boolean issueReported;
        private String issueDetails;
        private Boolean confirmedByOwner;
        private Boolean confirmedByBorrower;

        public String getReturnConditionNotes() { return returnConditionNotes; }
        public void setReturnConditionNotes(String returnConditionNotes) { this.returnConditionNotes = returnConditionNotes; }

        public String getReturnPhotoUrl() { return returnPhotoUrl; }
        public void setReturnPhotoUrl(String returnPhotoUrl) { this.returnPhotoUrl = returnPhotoUrl; }

        public Boolean getDepositRefunded() { return depositRefunded; }
        public void setDepositRefunded(Boolean depositRefunded) { this.depositRefunded = depositRefunded; }

        public BigDecimal getDepositDeductionInr() { return depositDeductionInr; }
        public void setDepositDeductionInr(BigDecimal depositDeductionInr) { this.depositDeductionInr = depositDeductionInr; }

        public String getDepositDeductionReason() { return depositDeductionReason; }
        public void setDepositDeductionReason(String depositDeductionReason) { this.depositDeductionReason = depositDeductionReason; }

        public Boolean getIssueReported() { return issueReported; }
        public void setIssueReported(Boolean issueReported) { this.issueReported = issueReported; }

        public String getIssueDetails() { return issueDetails; }
        public void setIssueDetails(String issueDetails) { this.issueDetails = issueDetails; }

        public Boolean getConfirmedByOwner() { return confirmedByOwner; }
        public void setConfirmedByOwner(Boolean confirmedByOwner) { this.confirmedByOwner = confirmedByOwner; }

        public Boolean getConfirmedByBorrower() { return confirmedByBorrower; }
        public void setConfirmedByBorrower(Boolean confirmedByBorrower) { this.confirmedByBorrower = confirmedByBorrower; }
    }
}

