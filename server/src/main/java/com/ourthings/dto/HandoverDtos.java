package com.ourthings.dto;

import java.time.LocalDate;

public class HandoverDtos {

    public static class RecordHandoverRequest {
        private String initialConditionNotes;
        private LocalDate plannedReturnDate;

        public String getInitialConditionNotes() { return initialConditionNotes; }
        public void setInitialConditionNotes(String initialConditionNotes) { this.initialConditionNotes = initialConditionNotes; }

        public LocalDate getPlannedReturnDate() { return plannedReturnDate; }
        public void setPlannedReturnDate(LocalDate plannedReturnDate) { this.plannedReturnDate = plannedReturnDate; }
    }

    public static class RecordReturnRequest {
        private String returnConditionNotes;
        private Boolean issueReported;
        private String issueDetails;
        private Boolean confirmedByOwner;
        private Boolean confirmedByBorrower;

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
}
