package com.ourthings.repository;

import com.ourthings.model.UnmetDemand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnmetDemandRepository extends JpaRepository<UnmetDemand, Long> {

    List<UnmetDemand> findByCommunityIdAndStatusOrderByCreatedAtDesc(Long communityId, String status);

    List<UnmetDemand> findByCommunityIdOrderByCreatedAtDesc(Long communityId);

    List<UnmetDemand> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    interface AggregatedDemandView {
        String getCategory();
        String getNormalizedName();
        Long getDemandCount();
    }

    @Query("SELECT d.category AS category, d.normalizedName AS normalizedName, COUNT(d.id) AS demandCount " +
           "FROM UnmetDemand d WHERE d.communityId = :communityId AND d.status = 'OPEN' " +
           "GROUP BY d.category, d.normalizedName " +
           "ORDER BY COUNT(d.id) DESC")
    List<AggregatedDemandView> aggregateDemandsByCommunity(@Param("communityId") Long communityId);

    long countByCommunityIdAndStatus(Long communityId, String status);
}

