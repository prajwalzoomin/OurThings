package com.ourthings.repository;

import com.ourthings.model.BorrowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    List<BorrowRequest> findByCommunityIdOrderByCreatedAtDesc(Long communityId);

    List<BorrowRequest> findByBorrowerIdOrderByCreatedAtDesc(Long borrowerId);

    List<BorrowRequest> findByItemIdOrderByStartDateAsc(Long itemId);

    @Query("SELECT r FROM BorrowRequest r WHERE r.itemId = :itemId " +
           "AND r.status IN ('APPROVED', 'ACTIVE') " +
           "AND r.startDate <= :checkEnd AND r.endDate >= :checkStart " +
           "AND (:excludeRequestId IS NULL OR r.id <> :excludeRequestId)")
    List<BorrowRequest> findConflictingConfirmedReservations(@Param("itemId") Long itemId,
                                                            @Param("checkStart") LocalDate checkStart,
                                                            @Param("checkEnd") LocalDate checkEnd,
                                                            @Param("excludeRequestId") Long excludeRequestId);

    @Query("SELECT r FROM BorrowRequest r WHERE r.itemId = :itemId " +
           "AND r.status = 'PENDING' " +
           "AND r.startDate <= :checkEnd AND r.endDate >= :checkStart " +
           "AND (:excludeRequestId IS NULL OR r.id <> :excludeRequestId)")
    List<BorrowRequest> findConflictingPendingRequests(@Param("itemId") Long itemId,
                                                      @Param("checkStart") LocalDate checkStart,
                                                      @Param("checkEnd") LocalDate checkEnd,
                                                      @Param("excludeRequestId") Long excludeRequestId);

    @Query("SELECT r FROM BorrowRequest r WHERE r.itemId IN :itemIds ORDER BY r.createdAt DESC")
    List<BorrowRequest> findByItemIdIn(@Param("itemIds") List<Long> itemIds);

    long countByCommunityIdAndStatus(Long communityId, String status);
}

