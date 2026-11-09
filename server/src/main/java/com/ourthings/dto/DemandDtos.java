package com.ourthings.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DemandDtos {

    public static class CreateDemandRequest {
        private String category;
        private String itemName;
        private LocalDate neededFrom;
        private LocalDate neededTo;
        private String notes;

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

        public LocalDate getNeededFrom() { return neededFrom; }
        public void setNeededFrom(LocalDate neededFrom) { this.neededFrom = neededFrom; }

        public LocalDate getNeededTo() { return neededTo; }
        public void setNeededTo(LocalDate neededTo) { this.neededTo = neededTo; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class AggregatedDemandDto {
        private String category;
        private String normalizedName;
        private String displayName;
        private Long demandCount;

        public AggregatedDemandDto(String category, String normalizedName, String displayName, Long demandCount) {
            this.category = category;
            this.normalizedName = normalizedName;
            this.displayName = displayName;
            this.demandCount = demandCount;
        }

        public String getCategory() { return category; }
        public String getNormalizedName() { return normalizedName; }
        public String getDisplayName() { return displayName; }
        public Long getDemandCount() { return demandCount; }
    }

    public static class DemandDetailDto {
        private Long id;
        private Long communityId;
        private String category;
        private String itemName;
        private LocalDate neededFrom;
        private LocalDate neededTo;
        private String notes;
        private String status;
        private LocalDateTime createdAt;
        private Boolean isMyRequest;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getCommunityId() { return communityId; }
        public void setCommunityId(Long communityId) { this.communityId = communityId; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

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

        public Boolean getIsMyRequest() { return isMyRequest; }
        public void setIsMyRequest(Boolean isMyRequest) { this.isMyRequest = isMyRequest; }
    }
}
