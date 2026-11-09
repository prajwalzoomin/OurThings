package com.ourthings.service;

import com.ourthings.dto.ItemDtos.*;
import com.ourthings.model.ActivityLog;
import com.ourthings.model.BorrowRequest;
import com.ourthings.model.ItemListing;
import com.ourthings.model.User;
import com.ourthings.repository.ActivityLogRepository;
import com.ourthings.repository.BorrowRequestRepository;
import com.ourthings.repository.ItemListingRepository;
import com.ourthings.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemListingRepository itemListingRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public ItemService(ItemListingRepository itemListingRepository,
                       BorrowRequestRepository borrowRequestRepository,
                       UserRepository userRepository,
                       ActivityLogRepository activityLogRepository) {
        this.itemListingRepository = itemListingRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public List<ItemResponseDto> searchItems(Long communityId, String category, String keyword, LocalDate dateFrom, LocalDate dateTo) {
        List<ItemListing> items = itemListingRepository.searchItems(communityId, category, keyword, dateFrom, dateTo);
        return items.stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public List<ItemResponseDto> getItemsByCommunity(Long communityId) {
        List<ItemListing> items = itemListingRepository.findByCommunityIdAndStatusNot(communityId, "INACTIVE");
        return items.stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public List<ItemResponseDto> getItemsByOwner(Long ownerId) {
        List<ItemListing> items = itemListingRepository.findByOwnerId(ownerId).stream()
                .filter(i -> !"INACTIVE".equalsIgnoreCase(i.getStatus()))
                .collect(Collectors.toList());
        return items.stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public ItemResponseDto getItemById(Long id, Long communityId) {
        ItemListing item = itemListingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));

        if (!item.getCommunityId().equals(communityId)) {
            throw new SecurityException("Unauthorized access: item does not belong to active community.");
        }

        return toResponseDto(item);
    }

    @Transactional
    public ItemResponseDto createItem(Long communityId, Long ownerId, CreateUpdateItemRequest req) {
        validateItemDates(req.getAvailableFrom(), req.getAvailableTo());

        ItemListing item = new ItemListing(
                communityId,
                ownerId,
                req.getTitle().trim(),
                req.getDescription() != null ? req.getDescription().trim() : "",
                req.getCategory(),
                req.getItemCondition(),
                req.getPickupLocation().trim(),
                req.getAvailableFrom(),
                req.getAvailableTo(),
                req.getEstimatedReplacementValueInr()
        );

        item = itemListingRepository.save(item);

        activityLogRepository.save(new ActivityLog(
                communityId,
                ownerId,
                "ITEM_LISTED",
                "Listed new item: " + item.getTitle() + " (" + item.getCategory() + ")"
        ));

        return toResponseDto(item);
    }

    @Transactional
    public ItemResponseDto updateItem(Long id, Long communityId, Long ownerId, CreateUpdateItemRequest req) {
        ItemListing item = itemListingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));

        if (!item.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Only the owner can edit this listing.");
        }
        if (!item.getCommunityId().equals(communityId)) {
            throw new SecurityException("Item does not belong to active community.");
        }

        boolean hasActiveLoans = borrowRequestRepository.findByItemIdOrderByStartDateAsc(id).stream()
                .anyMatch(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()));
        if (hasActiveLoans) {
            throw new IllegalStateException("Cannot edit listing while an active loan is in progress.");
        }

        validateItemDates(req.getAvailableFrom(), req.getAvailableTo());

        item.setTitle(req.getTitle().trim());
        item.setDescription(req.getDescription() != null ? req.getDescription().trim() : "");
        item.setCategory(req.getCategory());
        item.setItemCondition(req.getItemCondition());
        item.setPickupLocation(req.getPickupLocation().trim());
        item.setAvailableFrom(req.getAvailableFrom());
        item.setAvailableTo(req.getAvailableTo());
        item.setEstimatedReplacementValueInr(req.getEstimatedReplacementValueInr());
        item.setUpdatedAt(LocalDateTime.now());

        item = itemListingRepository.save(item);
        return toResponseDto(item);
    }

    @Transactional
    public ItemResponseDto togglePause(Long id, Long communityId, Long ownerId) {
        ItemListing item = itemListingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));

        if (!item.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Only the owner can modify listing status.");
        }

        boolean hasActiveLoans = borrowRequestRepository.findByItemIdOrderByStartDateAsc(id).stream()
                .anyMatch(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()));
        if (hasActiveLoans) {
            throw new IllegalStateException("Cannot pause listing while an active loan is in progress.");
        }

        if ("AVAILABLE".equalsIgnoreCase(item.getStatus())) {
            item.setStatus("PAUSED");
        } else if ("PAUSED".equalsIgnoreCase(item.getStatus())) {
            item.setStatus("AVAILABLE");
        } else {
            throw new IllegalStateException("Cannot toggle pause on item with status: " + item.getStatus());
        }

        item.setUpdatedAt(LocalDateTime.now());
        item = itemListingRepository.save(item);

        activityLogRepository.save(new ActivityLog(
                communityId,
                ownerId,
                "ITEM_STATUS_CHANGED",
                "Listing '" + item.getTitle() + "' status changed to " + item.getStatus()
        ));

        return toResponseDto(item);
    }

    @Transactional
    public void removeItem(Long id, Long communityId, Long ownerId) {
        ItemListing item = itemListingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));

        if (!item.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Only the owner can remove this listing.");
        }

        boolean hasActiveLoans = borrowRequestRepository.findByItemIdOrderByStartDateAsc(id).stream()
                .anyMatch(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()));
        if (hasActiveLoans) {
            throw new IllegalStateException("Cannot remove listing while an active loan is in progress.");
        }

        item.setStatus("INACTIVE");
        item.setUpdatedAt(LocalDateTime.now());
        itemListingRepository.save(item);

        activityLogRepository.save(new ActivityLog(
                communityId,
                ownerId,
                "ITEM_REMOVED",
                "Listing removed: " + item.getTitle()
        ));
    }

    private void validateItemDates(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("Availability dates must not be null.");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("Availability end date cannot be before start date.");
        }
    }

    public ItemResponseDto toResponseDto(ItemListing item) {
        ItemResponseDto dto = new ItemResponseDto();
        dto.setId(item.getId());
        dto.setCommunityId(item.getCommunityId());
        dto.setOwnerId(item.getOwnerId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCategory(item.getCategory());
        dto.setItemCondition(item.getItemCondition());
        dto.setPickupLocation(item.getPickupLocation());
        dto.setAvailableFrom(item.getAvailableFrom());
        dto.setAvailableTo(item.getAvailableTo());
        dto.setEstimatedReplacementValueInr(item.getEstimatedReplacementValueInr());
        dto.setStatus(item.getStatus());
        dto.setCreatedAt(item.getCreatedAt());

        userRepository.findById(item.getOwnerId()).ifPresent(owner -> {
            dto.setOwnerName(owner.getName());
            dto.setOwnerPhone(owner.getPhone());
            dto.setOwnerRoomOrFlat(owner.getRoomOrFlat());
        });

        List<ReservedPeriodDto> reserved = borrowRequestRepository.findByItemIdOrderByStartDateAsc(item.getId())
                .stream()
                .filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus()) || "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .map(r -> new ReservedPeriodDto(r.getStartDate(), r.getEndDate(), r.getStatus()))
                .collect(Collectors.toList());
        dto.setReservedPeriods(reserved);

        return dto;
    }
}

