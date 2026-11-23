package com.ourthings.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewDtos {

    public static class CreateReviewRequest {
        private Long itemId;
        private Long requestId;
        private Integer rating; // 1 - 5
        private String comment;
        private String reviewType; // BORROWER_TO_OWNER, OWNER_TO_BORROWER

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public Long getRequestId() { return requestId; }
        public void setRequestId(Long requestId) { this.requestId = requestId; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public String getReviewType() { return reviewType; }
        public void setReviewType(String reviewType) { this.reviewType = reviewType; }
    }

    public static class ReviewResponseDto {
        private Long id;
        private Long itemId;
        private Long requestId;
        private Long reviewerId;
        private String reviewerName;
        private String reviewerAvatar;
        private Long revieweeId;
        private Integer rating;
        private String comment;
        private String reviewType;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public Long getRequestId() { return requestId; }
        public void setRequestId(Long requestId) { this.requestId = requestId; }

        public Long getReviewerId() { return reviewerId; }
        public void setReviewerId(Long reviewerId) { this.reviewerId = reviewerId; }

        public String getReviewerName() { return reviewerName; }
        public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

        public String getReviewerAvatar() { return reviewerAvatar; }
        public void setReviewerAvatar(String reviewerAvatar) { this.reviewerAvatar = reviewerAvatar; }

        public Long getRevieweeId() { return revieweeId; }
        public void setRevieweeId(Long revieweeId) { this.revieweeId = revieweeId; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public String getReviewType() { return reviewType; }
        public void setReviewType(String reviewType) { this.reviewType = reviewType; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class ItemReviewSummaryDto {
        private Double averageRating;
        private Integer totalReviews;
        private List<ReviewResponseDto> reviews;

        public ItemReviewSummaryDto(Double averageRating, Integer totalReviews, List<ReviewResponseDto> reviews) {
            this.averageRating = averageRating;
            this.totalReviews = totalReviews;
            this.reviews = reviews;
        }

        public Double getAverageRating() { return averageRating; }
        public Integer getTotalReviews() { return totalReviews; }
        public List<ReviewResponseDto> getReviews() { return reviews; }
    }
}

