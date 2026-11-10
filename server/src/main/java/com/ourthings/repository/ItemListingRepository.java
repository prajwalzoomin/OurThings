package com.ourthings.repository;

import com.ourthings.model.ItemListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemListingRepository extends JpaRepository<ItemListing, Long> {

    List<ItemListing> findByCommunityIdAndStatusNot(Long communityId, String status);

    List<ItemListing> findByCommunityId(Long communityId);

    List<ItemListing> findByOwnerId(Long ownerId);

    @Query("SELECT i FROM ItemListing i WHERE (:communityId IS NULL OR i.communityId = :communityId) " +
           "AND i.status <> 'INACTIVE' " +
           "AND (:category IS NULL OR :category = '' OR :category = 'All Categories' OR LOWER(i.category) = LOWER(:category)) " +
           "AND (:condition IS NULL OR :condition = '' OR LOWER(i.itemCondition) = LOWER(:condition)) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(i.pickupLocation) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     (i.locality IS NOT NULL AND LOWER(i.locality) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
           "     (i.landmark IS NOT NULL AND LOWER(i.landmark) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "AND (:dateFrom IS NULL OR i.availableFrom <= :dateFrom) " +
           "AND (:dateTo IS NULL OR i.availableTo >= :dateTo) " +
           "ORDER BY i.createdAt DESC")
    List<ItemListing> searchItems(@Param("communityId") Long communityId,
                                  @Param("category") String category,
                                  @Param("keyword") String keyword,
                                  @Param("condition") String condition,
                                  @Param("dateFrom") LocalDate dateFrom,
                                  @Param("dateTo") LocalDate dateTo);
}

