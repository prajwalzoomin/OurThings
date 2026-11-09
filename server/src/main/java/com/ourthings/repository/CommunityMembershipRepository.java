package com.ourthings.repository;

import com.ourthings.model.CommunityMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityMembershipRepository extends JpaRepository<CommunityMembership, Long> {
    List<CommunityMembership> findByUserId(Long userId);
    List<CommunityMembership> findByCommunityId(Long communityId);
    Optional<CommunityMembership> findByUserIdAndCommunityId(Long userId, Long communityId);
    boolean existsByUserIdAndCommunityId(Long userId, Long communityId);
}

