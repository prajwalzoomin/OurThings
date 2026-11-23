package com.ourthings.repository;

import com.ourthings.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByItemIdOrderByCreatedAtDesc(Long itemId);
    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);
    List<Review> findByRequestId(Long requestId);
    boolean existsByRequestIdAndReviewerId(Long requestId, Long reviewerId);
}

