package com.ourthings.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_listings")
public class ItemListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_id", nullable = false)
    private Long communityId;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "item_condition", nullable = false, length = 50)
    private String itemCondition;

    @Column(name = "pickup_location", nullable = false, length = 255)
    private String pickupLocation;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "formatted_address", length = 500)
    private String formattedAddress;

    @Column(length = 100)
    private String premise;

    @Column(length = 150)
    private String building;

    @Column(length = 150)
    private String landmark;

    @Column(length = 100)
    private String locality;

    @Column(length = 100)
    private String city = "Bengaluru";

    @Column(length = 20)
    private String pincode = "560103";

    @Column(length = 100)
    private String state = "Karnataka";

    @Column(name = "available_from", nullable = false)
    private LocalDate availableFrom;

    @Column(name = "available_to", nullable = false)
    private LocalDate availableTo;

    @Column(name = "estimated_replacement_value_inr", precision = 10, scale = 2)
    private BigDecimal estimatedReplacementValueInr;

    @Column(name = "pricing_type", length = 30)
    private String pricingType = "FREE"; // FREE, RENTAL

    @Column(name = "daily_rate_inr", precision = 10, scale = 2)
    private BigDecimal dailyRateInr = BigDecimal.ZERO;

    @Column(name = "security_deposit_inr", precision = 10, scale = 2)
    private BigDecimal securityDepositInr = BigDecimal.ZERO;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false, length = 50)
    private String status = "AVAILABLE"; // AVAILABLE, PAUSED, LENT, INACTIVE

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ItemListing() {}

    public ItemListing(Long communityId, Long ownerId, String title, String description,
                       String category, String itemCondition, String pickupLocation,
                       LocalDate availableFrom, LocalDate availableTo, BigDecimal estimatedReplacementValueInr) {
        this.communityId = communityId;
        this.ownerId = ownerId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.itemCondition = itemCondition;
        this.pickupLocation = pickupLocation;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.estimatedReplacementValueInr = estimatedReplacementValueInr;
        this.status = "AVAILABLE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

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

    public LocalDate getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDate availableFrom) { this.availableFrom = availableFrom; }

    public LocalDate getAvailableTo() { return availableTo; }
    public void setAvailableTo(LocalDate availableTo) { this.availableTo = availableTo; }

    public BigDecimal getEstimatedReplacementValueInr() { return estimatedReplacementValueInr; }
    public void setEstimatedReplacementValueInr(BigDecimal estimatedReplacementValueInr) { this.estimatedReplacementValueInr = estimatedReplacementValueInr; }

    public String getPricingType() { return pricingType != null ? pricingType : "FREE"; }
    public void setPricingType(String pricingType) { this.pricingType = pricingType; }

    public BigDecimal getDailyRateInr() { return dailyRateInr != null ? dailyRateInr : BigDecimal.ZERO; }
    public void setDailyRateInr(BigDecimal dailyRateInr) { this.dailyRateInr = dailyRateInr; }

    public BigDecimal getSecurityDepositInr() { return securityDepositInr != null ? securityDepositInr : BigDecimal.ZERO; }
    public void setSecurityDepositInr(BigDecimal securityDepositInr) { this.securityDepositInr = securityDepositInr; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

