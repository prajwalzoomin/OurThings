package com.ourthings.controller;

import com.ourthings.dto.ReviewDtos.*;
import com.ourthings.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<ItemReviewSummaryDto> getItemReviews(@PathVariable Long itemId) {
        return ResponseEntity.ok(reviewService.getReviewsForItem(itemId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponseDto>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(userId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDto> submitReview(@RequestHeader("X-User-Id") Long userId,
                                                          @RequestBody CreateReviewRequest req) {
        return ResponseEntity.ok(reviewService.submitReview(userId, req));
    }
}

