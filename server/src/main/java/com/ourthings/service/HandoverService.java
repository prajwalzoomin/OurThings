package com.ourthings.service;

import com.ourthings.dto.HandoverDtos.*;
import com.ourthings.model.ActivityLog;
import com.ourthings.model.BorrowRequest;
import com.ourthings.model.HandoverRecord;
import com.ourthings.model.ItemListing;
import com.ourthings.repository.ActivityLogRepository;
import com.ourthings.repository.BorrowRequestRepository;
import com.ourthings.repository.HandoverRecordRepository;
import com.ourthings.repository.ItemListingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class HandoverService {

    private final HandoverRecordRepository handoverRecordRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final ItemListingRepository itemListingRepository;
    private final ActivityLogRepository activityLogRepository;

    public HandoverService(HandoverRecordRepository handoverRecordRepository,
                           BorrowRequestRepository borrowRequestRepository,
                           ItemListingRepository itemListingRepository,
                           ActivityLogRepository activityLogRepository) {
        this.handoverRecordRepository = handoverRecordRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.itemListingRepository = itemListingRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public HandoverRecord recordHandover(Long requestId, Long communityId, Long actorId, RecordHandoverRequest req) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        final Long itemId = request.getItemId();
        ItemListing item = itemListingRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        if (!actorId.equals(item.getOwnerId()) && !actorId.equals(request.getBorrowerId())) {
            throw new SecurityException("Only the owner or borrower can record item handover.");
        }
        if (!"APPROVED".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Handover can only be recorded for approved requests. Current status: " + request.getStatus());
        }

        HandoverRecord record = handoverRecordRepository.findByRequestId(requestId)
                .orElse(new HandoverRecord(request.getId(), item.getId(), request.getEndDate()));

        record.setHandedOverAt(LocalDateTime.now());
        record.setInitialConditionNotes(req.getInitialConditionNotes() != null ? req.getInitialConditionNotes().trim() : "Checked and handed over in agreed condition.");
        if (req.getPlannedReturnDate() != null) {
            record.setPlannedReturnDate(req.getPlannedReturnDate());
        } else {
            record.setPlannedReturnDate(request.getEndDate());
        }

        if (actorId.equals(item.getOwnerId())) {
            record.setConfirmedByOwner(true);
        } else {
            record.setConfirmedByBorrower(true);
        }

        record = handoverRecordRepository.save(record);

        request.setStatus("ACTIVE");
        request.setUpdatedAt(LocalDateTime.now());
        borrowRequestRepository.save(request);

        item.setStatus("LENT");
        item.setUpdatedAt(LocalDateTime.now());
        itemListingRepository.save(item);

        activityLogRepository.save(new ActivityLog(
                communityId,
                actorId,
                "ITEM_HANDED_OVER",
                "Handover completed for '" + item.getTitle() + "'. Active loan started."
        ));

        return record;
    }

    @Transactional
    public HandoverRecord recordReturn(Long requestId, Long communityId, Long actorId, RecordReturnRequest req) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        final Long itemId = request.getItemId();
        ItemListing item = itemListingRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        if (!actorId.equals(item.getOwnerId()) && !actorId.equals(request.getBorrowerId())) {
            throw new SecurityException("Only the owner or borrower can record item return.");
        }
        if (!"ACTIVE".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Return can only be recorded for active loans. Current status: " + request.getStatus());
        }

        HandoverRecord record = handoverRecordRepository.findByRequestId(requestId)
                .orElseThrow(() -> new IllegalStateException("No handover record found for request: " + requestId));

        record.setReturnedAt(LocalDateTime.now());
        record.setReturnConditionNotes(req.getReturnConditionNotes() != null ? req.getReturnConditionNotes().trim() : "Returned and inspected.");

        boolean hasIssue = Boolean.TRUE.equals(req.getIssueReported());
        record.setIssueReported(hasIssue);
        if (hasIssue) {
            if (req.getIssueDetails() == null || req.getIssueDetails().trim().isEmpty()) {
                throw new IllegalArgumentException("Issue details must be provided when reporting a problem on return.");
            }
            record.setIssueDetails(req.getIssueDetails().trim());
        } else {
            record.setIssueDetails(null);
        }

        record.setConfirmedByOwner(Boolean.TRUE.equals(req.getConfirmedByOwner()) || actorId.equals(item.getOwnerId()));
        record.setConfirmedByBorrower(Boolean.TRUE.equals(req.getConfirmedByBorrower()) || actorId.equals(request.getBorrowerId()));

        record = handoverRecordRepository.save(record);

        request.setStatus("RETURNED");
        request.setUpdatedAt(LocalDateTime.now());
        borrowRequestRepository.save(request);

        item.setStatus("AVAILABLE");
        item.setUpdatedAt(LocalDateTime.now());
        itemListingRepository.save(item);

        String summary = "Item '" + item.getTitle() + "' returned.";
        if (hasIssue) {
            summary += " Problem reported: " + record.getIssueDetails();
        }

        activityLogRepository.save(new ActivityLog(
                communityId,
                actorId,
                hasIssue ? "ITEM_RETURNED_WITH_ISSUE" : "ITEM_RETURNED",
                summary
        ));

        return record;
    }
}
