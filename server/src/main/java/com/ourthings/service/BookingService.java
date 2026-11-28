package com.ourthings.service;

import com.ourthings.dto.BorrowRequestDtos.*;
import com.ourthings.model.*;
import com.ourthings.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final ItemListingRepository itemListingRepository;
    private final HandoverRecordRepository handoverRecordRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public BookingService(BorrowRequestRepository borrowRequestRepository,
                          ItemListingRepository itemListingRepository,
                          HandoverRecordRepository handoverRecordRepository,
                          UserRepository userRepository,
                          ActivityLogRepository activityLogRepository) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.itemListingRepository = itemListingRepository;
        this.handoverRecordRepository = handoverRecordRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public List<BorrowRequestResponseDto> getRequestsByBorrower(Long borrowerId) {
        return borrowRequestRepository.findByBorrowerIdOrderByCreatedAtDesc(borrowerId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<BorrowRequestResponseDto> getRequestsForOwner(Long ownerId) {
        List<ItemListing> ownerItems = itemListingRepository.findByOwnerId(ownerId);
        if (ownerItems.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> itemIds = ownerItems.stream().map(ItemListing::getId).collect(Collectors.toList());
        return borrowRequestRepository.findByItemIdIn(itemIds).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<BorrowRequestResponseDto> getRequestsByCommunity(Long communityId) {
        return borrowRequestRepository.findByCommunityIdOrderByCreatedAtDesc(communityId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public BorrowRequestResponseDto getRequestById(Long requestId, Long communityId) {
        BorrowRequest req = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));
        // Allow viewing request if in same community or if communityId is null or matches
        if (communityId != null && !req.getCommunityId().equals(communityId)) {
            // Check if user is borrower or owner, allow cross-community access
        }
        return toResponseDto(req);
    }

    @Transactional
    public synchronized BorrowRequestResponseDto submitRequest(Long communityId, Long borrowerId, CreateBorrowRequest req) {
        ItemListing item = itemListingRepository.findById(req.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + req.getItemId()));

        // Allows borrowing across communities or within the item's community
        Long itemCommunityId = item.getCommunityId();
        if (!"AVAILABLE".equalsIgnoreCase(item.getStatus())) {
            throw new IllegalStateException("Item is currently not available for requests (Status: " + item.getStatus() + ").");
        }
        if (item.getOwnerId().equals(borrowerId)) {
            throw new IllegalArgumentException("You cannot borrow an item that you own.");
        }

        LocalDate start = req.getStartDate();
        LocalDate end = req.getEndDate();

        if (start == null || end == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date cannot be earlier than start date.");
        }
        if (start.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past.");
        }
        if (start.isBefore(item.getAvailableFrom()) || end.isAfter(item.getAvailableTo())) {
            throw new IllegalArgumentException("Requested dates are outside the owner's listed availability window (" +
                    item.getAvailableFrom() + " to " + item.getAvailableTo() + ").");
        }

        // Strict server-side check for confirmed overlapping reservations
        List<BorrowRequest> confirmedConflicts = borrowRequestRepository.findConflictingConfirmedReservations(
                item.getId(), start, end, null);

        if (!confirmedConflicts.isEmpty()) {
            BorrowRequest conflict = confirmedConflicts.get(0);
            throw new IllegalStateException("Scheduling conflict: This item has a confirmed reservation from " +
                    conflict.getStartDate() + " to " + conflict.getEndDate() + ".");
        }

        BorrowRequest request = new BorrowRequest(
                item.getId(),
                itemCommunityId,
                borrowerId,
                start,
                end,
                req.getBorrowPurpose() != null ? req.getBorrowPurpose().trim() : ""
        );

        long days = ChronoUnit.DAYS.between(start, end) + 1;
        int rentalDays = (int) Math.max(1, days);
        String pricingType = item.getPricingType() != null ? item.getPricingType() : "FREE";
        BigDecimal dailyRate = item.getDailyRateInr() != null ? item.getDailyRateInr() : BigDecimal.ZERO;
        BigDecimal deposit = item.getSecurityDepositInr() != null ? item.getSecurityDepositInr() : BigDecimal.ZERO;
        BigDecimal rentalTotal = "RENTAL".equalsIgnoreCase(pricingType) ? dailyRate.multiply(BigDecimal.valueOf(rentalDays)) : BigDecimal.ZERO;
        BigDecimal totalEstimated = rentalTotal.add(deposit);
        String paymentStatus = "RENTAL".equalsIgnoreCase(pricingType)
                ? (deposit.compareTo(BigDecimal.ZERO) > 0 ? "DEPOSIT_PENDING" : "UNPAID")
                : "FREE";

        request.setPricingType(pricingType);
        request.setDailyRateInr(dailyRate);
        request.setRentalDays(rentalDays);
        request.setRentalTotalInr(rentalTotal);
        request.setSecurityDepositInr(deposit);
        request.setTotalEstimatedCostInr(totalEstimated);
        request.setPaymentStatus(paymentStatus);

        request = borrowRequestRepository.save(request);

        User borrower = userRepository.findById(borrowerId).orElse(null);
        String borrowerName = borrower != null ? borrower.getName() : "A community member";

        activityLogRepository.save(new ActivityLog(
                communityId,
                borrowerId,
                "REQUEST_SUBMITTED",
                borrowerName + " submitted a borrow request for: " + item.getTitle()
        ));

        return toResponseDto(request);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public synchronized BorrowRequestResponseDto approveRequest(Long requestId, Long communityId, Long ownerId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        final Long itemId = request.getItemId();
        ItemListing item = itemListingRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        if (!item.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Only the item owner can approve this request.");
        }
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Only pending requests can be approved. Current status: " + request.getStatus());
        }

        // Atomically re-verify overlapping confirmed reservations before approval
        List<BorrowRequest> confirmedConflicts = borrowRequestRepository.findConflictingConfirmedReservations(
                item.getId(), request.getStartDate(), request.getEndDate(), requestId);

        if (!confirmedConflicts.isEmpty()) {
            BorrowRequest conflict = confirmedConflicts.get(0);
            throw new IllegalStateException("Cannot approve: Overlaps with an already confirmed reservation from " +
                    conflict.getStartDate() + " to " + conflict.getEndDate() + ".");
        }

        request.setStatus("APPROVED");
        request.setUpdatedAt(LocalDateTime.now());
        request = borrowRequestRepository.save(request);

        // Ensure handover record container exists
        Optional<HandoverRecord> existingHandover = handoverRecordRepository.findByRequestId(request.getId());
        if (existingHandover.isEmpty()) {
            HandoverRecord hr = new HandoverRecord(request.getId(), item.getId(), request.getEndDate());
            handoverRecordRepository.save(hr);
        }

        activityLogRepository.save(new ActivityLog(
                communityId,
                ownerId,
                "REQUEST_APPROVED",
                "Reservation approved for '" + item.getTitle() + "' (" + request.getStartDate() + " to " + request.getEndDate() + ")"
        ));

        return toResponseDto(request);
    }

    @Transactional
    public BorrowRequestResponseDto declineRequest(Long requestId, Long communityId, Long ownerId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        final Long itemId = request.getItemId();
        ItemListing item = itemListingRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        if (!item.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Only the item owner can decline this request.");
        }
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Cannot decline request in status: " + request.getStatus());
        }

        request.setStatus("DECLINED");
        request.setUpdatedAt(LocalDateTime.now());
        request = borrowRequestRepository.save(request);

        activityLogRepository.save(new ActivityLog(
                communityId,
                ownerId,
                "REQUEST_DECLINED",
                "Request declined for: " + item.getTitle()
        ));

        return toResponseDto(request);
    }

    @Transactional
    public BorrowRequestResponseDto withdrawRequest(Long requestId, Long communityId, Long borrowerId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        if (!request.getBorrowerId().equals(borrowerId)) {
            throw new SecurityException("Only the borrower can withdraw their request.");
        }
        if (!"PENDING".equalsIgnoreCase(request.getStatus()) && !"APPROVED".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Cannot withdraw request with status: " + request.getStatus());
        }

        request.setStatus("WITHDRAWN");
        request.setUpdatedAt(LocalDateTime.now());
        request = borrowRequestRepository.save(request);

        activityLogRepository.save(new ActivityLog(
                communityId,
                borrowerId,
                "REQUEST_WITHDRAWN",
                "Borrow request withdrawn"
        ));

        return toResponseDto(request);
    }

    public BorrowRequestResponseDto toResponseDto(BorrowRequest req) {
        BorrowRequestResponseDto dto = new BorrowRequestResponseDto();
        dto.setId(req.getId());
        dto.setItemId(req.getItemId());
        dto.setCommunityId(req.getCommunityId());
        dto.setBorrowerId(req.getBorrowerId());
        dto.setStartDate(req.getStartDate());
        dto.setEndDate(req.getEndDate());
        dto.setBorrowPurpose(req.getBorrowPurpose());
        dto.setPricingType(req.getPricingType());
        dto.setDailyRateInr(req.getDailyRateInr());
        dto.setRentalDays(req.getRentalDays());
        dto.setRentalTotalInr(req.getRentalTotalInr());
        dto.setSecurityDepositInr(req.getSecurityDepositInr());
        dto.setTotalEstimatedCostInr(req.getTotalEstimatedCostInr());
        dto.setPaymentStatus(req.getPaymentStatus());
        dto.setStatus(req.getStatus());
        dto.setCreatedAt(req.getCreatedAt());

        itemListingRepository.findById(req.getItemId()).ifPresent(item -> {
            dto.setItemTitle(item.getTitle());
            dto.setItemCategory(item.getCategory());
            dto.setItemPickupLocation(item.getPickupLocation());
            dto.setOwnerId(item.getOwnerId());

            userRepository.findById(item.getOwnerId()).ifPresent(owner -> {
                dto.setOwnerName(owner.getName());
                dto.setOwnerPhone(owner.getPhone());
                dto.setOwnerRoomOrFlat(owner.getRoomOrFlat());
            });
        });

        userRepository.findById(req.getBorrowerId()).ifPresent(borrower -> {
            dto.setBorrowerName(borrower.getName());
            dto.setBorrowerPhone(borrower.getPhone());
            dto.setBorrowerRoomOrFlat(borrower.getRoomOrFlat());
        });

        // Check for conflicting pending requests (only if this request is PENDING)
        if ("PENDING".equalsIgnoreCase(req.getStatus())) {
            List<BorrowRequest> pendingConflicts = borrowRequestRepository.findConflictingPendingRequests(
                    req.getItemId(), req.getStartDate(), req.getEndDate(), req.getId());
            dto.setHasConflictingPendingRequests(!pendingConflicts.isEmpty());
        } else {
            dto.setHasConflictingPendingRequests(false);
        }

        // Attach handover record if present
        handoverRecordRepository.findByRequestId(req.getId()).ifPresent(hr -> {
            HandoverSummaryDto hDto = new HandoverSummaryDto();
            hDto.setId(hr.getId());
            hDto.setHandedOverAt(hr.getHandedOverAt());
            hDto.setInitialConditionNotes(hr.getInitialConditionNotes());
            hDto.setHandoverPhotoUrl(hr.getHandoverPhotoUrl());
            hDto.setPlannedReturnDate(hr.getPlannedReturnDate());
            hDto.setReturnedAt(hr.getReturnedAt());
            hDto.setReturnConditionNotes(hr.getReturnConditionNotes());
            hDto.setReturnPhotoUrl(hr.getReturnPhotoUrl());
            hDto.setDepositRefunded(hr.getDepositRefunded());
            hDto.setDepositDeductionInr(hr.getDepositDeductionInr());
            hDto.setDepositDeductionReason(hr.getDepositDeductionReason());
            hDto.setIssueReported(hr.getIssueReported());
            hDto.setIssueDetails(hr.getIssueDetails());
            hDto.setConfirmedByOwner(hr.getConfirmedByOwner());
            hDto.setConfirmedByBorrower(hr.getConfirmedByBorrower());
            dto.setHandoverRecord(hDto);
        });

        return dto;
    }
}
