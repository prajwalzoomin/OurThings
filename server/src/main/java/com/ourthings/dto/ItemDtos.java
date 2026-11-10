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
        private Double latitude;
        private Double longitude;
        private String formattedAddress;
        private String premise;
        private String building;
        private String landmark;
        private String locality;
        private String city;
        private String pincode;
        private String state;

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

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public String getFormattedAddress() { return formattedAddress; }
        public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }

        public String getPremise() { return premise; }
        public void setPremise(String premise) { this.premise = premise; }

        public String getBuilding() { return building; }
        public void setBuilding(String building) { this.building = building; }

        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }

        public String getLocality() { return locality; }
        public void setLocality(String locality) { this.locality = locality; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
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
        private String communityName;
        private Long ownerId;
        private String ownerName;
        private String ownerPhone;
        private String ownerRoomOrFlat;
        private String title;
        private String description;
        private String category;
        private String itemCondition;
        private String pickupLocation;
        private Double latitude;
        private Double longitude;
        private String formattedAddress;
        private String premise;
        private String building;
        private String landmark;
        private String locality;
        private String city;
        private String pincode;
        private String state;
        private Double distanceKm;
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

        public String getCommunityName() { return communityName; }
        public void setCommunityName(String communityName) { this.communityName = communityName; }

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

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public String getFormattedAddress() { return formattedAddress; }
        public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }

        public String getPremise() { return premise; }
        public void setPremise(String premise) { this.premise = premise; }

        public String getBuilding() { return building; }
        public void setBuilding(String building) { this.building = building; }

        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }

        public String getLocality() { return locality; }
        public void setLocality(String locality) { this.locality = locality; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

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

