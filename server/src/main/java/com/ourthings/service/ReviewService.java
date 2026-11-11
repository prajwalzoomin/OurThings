package com.ourthings.service;

import com.ourthings.dto.ReviewDtos.*;
import com.ourthings.model.Review;
import com.ourthings.model.ItemListing;
import com.ourthings.model.User;
import com.ourthings.repository.ReviewRepository;
import com.ourthings.repository.ItemListingRepository;
import com.ourthings.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ItemListingRepository itemListingRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ItemListingRepository itemListingRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.itemListingRepository = itemListingRepository;
        this.userRepository = userRepository;
    }

    public ItemReviewSummaryDto getReviewsForItem(Long itemId) {
        List<Review> reviews = reviewRepository.findByItemIdOrderByCreatedAtDesc(itemId);
        List<ReviewResponseDto> dtos = reviews.stream().map(this::toDto).collect(Collectors.toList());

        double avg = dtos.isEmpty() ? 5.0 : dtos.stream().mapToInt(ReviewResponseDto::getRating).average().orElse(5.0);
        avg = Math.round(avg * 10.0) / 10.0;

        return new ItemReviewSummaryDto(avg, dtos.size(), dtos);
    }

    public List<ReviewResponseDto> getReviewsForUser(Long userId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponseDto submitReview(Long reviewerId, CreateReviewRequest req) {
        if (req.getItemId() == null) {
            throw new IllegalArgumentException("Item ID is required.");
        }
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars.");
        }

        ItemListing item = itemListingRepository.findById(req.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + req.getItemId()));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer user not found: " + reviewerId));

        Long revieweeId;
        String reviewType = req.getReviewType() != null ? req.getReviewType() : "BORROWER_TO_OWNER";
        if ("OWNER_TO_BORROWER".equalsIgnoreCase(reviewType)) {
            revieweeId = reviewerId.equals(item.getOwnerId()) ? (req.getRequestId() != null ? reviewerId : item.getOwnerId()) : item.getOwnerId();
        } else {
            revieweeId = item.getOwnerId();
        }

        Review review = new Review(
                item.getId(),
                req.getRequestId(),
                reviewerId,
                reviewer.getName(),
                reviewer.getAvatarUrl(),
                revieweeId,
                req.getRating(),
                req.getComment() != null ? req.getComment().trim() : "",
                reviewType
        );

        review = reviewRepository.save(review);
        return toDto(review);
    }

    public ReviewResponseDto toDto(Review r) {
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(r.getId());
        dto.setItemId(r.getItemId());
        dto.setRequestId(r.getRequestId());
        dto.setReviewerId(r.getReviewerId());
        dto.setReviewerName(r.getReviewerName());
        dto.setReviewerAvatar(r.getReviewerAvatar());
        dto.setRevieweeId(r.getRevieweeId());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setReviewType(r.getReviewType());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
