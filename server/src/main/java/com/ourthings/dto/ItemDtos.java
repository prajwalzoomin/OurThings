package com.ourthings.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ItemDtos {

    public static class CreateUpdateItemRequest {
        private String title;
        private String description;
        private String category;
        private String itemCondition;
        private String pickupLocation;
        private LocalDate availableFrom;
        private LocalDate availableTo;
        private BigDecimal estimatedReplacementValueInr;
        private String imageUrl;

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

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class ReservedPeriodDto {
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;

        public ReservedPeriodDto(LocalDate startDate, LocalDate endDate, String status) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.status = status;
        }

        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
        public String getStatus() { return status; }
    }

    public static class ItemResponseDto {
        private Long id;
        private Long communityId;
        private Long ownerId;
        private String ownerName;
        private String ownerPhone;
        private String ownerRoomOrFlat;
        private String title;
        private String description;
        private String category;
        private String itemCondition;
        private String pickupLocation;
        private LocalDate availableFrom;
        private LocalDate availableTo;
        private BigDecimal estimatedReplacementValueInr;
        private String imageUrl;
        private String status;
        private LocalDateTime createdAt;
        private List<ReservedPeriodDto> reservedPeriods;

        public ItemResponseDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getCommunityId() { return communityId; }
        public void setCommunityId(Long communityId) { this.communityId = communityId; }

        public Long getOwnerId() { return ownerId; }
        public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

        public String getOwnerPhone() { return ownerPhone; }
        public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

        public String getOwnerRoomOrFlat() { return ownerRoomOrFlat; }
        public void setOwnerRoomOrFlat(String ownerRoomOrFlat) { this.ownerRoomOrFlat = ownerRoomOrFlat; }

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

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public List<ReservedPeriodDto> getReservedPeriods() { return reservedPeriods; }
        public void setReservedPeriods(List<ReservedPeriodDto> reservedPeriods) { this.reservedPeriods = reservedPeriods; }
    }
}

