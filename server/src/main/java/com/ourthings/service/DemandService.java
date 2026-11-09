package com.ourthings.service;

import com.ourthings.dto.DemandDtos.*;
import com.ourthings.model.ActivityLog;
import com.ourthings.model.UnmetDemand;
import com.ourthings.repository.ActivityLogRepository;
import com.ourthings.repository.UnmetDemandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class DemandService {

    private final UnmetDemandRepository unmetDemandRepository;
    private final ActivityLogRepository activityLogRepository;

    public DemandService(UnmetDemandRepository unmetDemandRepository,
                         ActivityLogRepository activityLogRepository) {
        this.unmetDemandRepository = unmetDemandRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public List<AggregatedDemandDto> getAggregatedDemands(Long communityId) {
        List<UnmetDemandRepository.AggregatedDemandView> views =
                unmetDemandRepository.aggregateDemandsByCommunity(communityId);

        List<UnmetDemand> openDemands = unmetDemandRepository.findByCommunityIdAndStatusOrderByCreatedAtDesc(communityId, "OPEN");

        List<AggregatedDemandDto> result = new ArrayList<>();
        for (UnmetDemandRepository.AggregatedDemandView v : views) {
            String sampleName = openDemands.stream()
                    .filter(d -> d.getCategory().equalsIgnoreCase(v.getCategory()) &&
                                 d.getNormalizedName().equalsIgnoreCase(v.getNormalizedName()))
                    .findFirst()
                    .map(UnmetDemand::getItemName)
                    .orElse(v.getNormalizedName());

            result.add(new AggregatedDemandDto(
                    v.getCategory(),
                    v.getNormalizedName(),
                    sampleName,
                    v.getDemandCount()
            ));
        }

        return result;
    }

    public List<DemandDetailDto> getMyDemands(Long communityId, Long requesterId) {
        return unmetDemandRepository.findByRequesterIdOrderByCreatedAtDesc(requesterId).stream()
                .filter(d -> d.getCommunityId().equals(communityId))
                .map(d -> toDetailDto(d, true))
                .collect(Collectors.toList());
    }

    public List<DemandDetailDto> getAllOpenDemandsScrubbed(Long communityId, Long currentUserId) {
        // Return open demands for community with privacy preservation
        return unmetDemandRepository.findByCommunityIdAndStatusOrderByCreatedAtDesc(communityId, "OPEN").stream()
                .map(d -> {
                    boolean isMine = d.getRequesterId().equals(currentUserId);
                    return toDetailDto(d, isMine);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public DemandDetailDto submitDemand(Long communityId, Long requesterId, CreateDemandRequest req) {
        if (req.getItemName() == null || req.getItemName().trim().isEmpty()) {
            throw new IllegalArgumentException("Item name is required for demand request.");
        }
        if (req.getCategory() == null || req.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required for demand request.");
        }

        String rawName = req.getItemName().trim();
        String normalized = normalizeItemName(rawName);

        UnmetDemand demand = new UnmetDemand(
                communityId,
                requesterId,
                req.getCategory(),
                rawName,
                normalized,
                req.getNeededFrom(),
                req.getNeededTo(),
                req.getNotes() != null ? req.getNotes().trim() : null
        );

        demand = unmetDemandRepository.save(demand);

        // Community activity log preserves privacy: does not include requester's name
        activityLogRepository.save(new ActivityLog(
                communityId,
                requesterId,
                "DEMAND_REGISTERED",
                "New community demand logged in category: " + demand.getCategory()
        ));

        return toDetailDto(demand, true);
    }

    @Transactional
    public void fulfillDemand(Long demandId, Long communityId, Long actorId) {
        UnmetDemand demand = unmetDemandRepository.findById(demandId)
                .orElseThrow(() -> new IllegalArgumentException("Demand not found: " + demandId));

        if (!demand.getCommunityId().equals(communityId)) {
            throw new SecurityException("Demand does not belong to active community.");
        }

        demand.setStatus("FULFILLED");
        unmetDemandRepository.save(demand);

        activityLogRepository.save(new ActivityLog(
                communityId,
                actorId,
                "DEMAND_FULFILLED",
                "Demand marked fulfilled for item: " + demand.getItemName()
        ));
    }

    public static String normalizeItemName(String input) {
        if (input == null) return "";
        // Convert to lowercase, remove punctuation, collapse extra whitespace
        String clean = input.toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return clean.isEmpty() ? input.toLowerCase(Locale.ENGLISH).trim() : clean;
    }

    private DemandDetailDto toDetailDto(UnmetDemand d, boolean isMine) {
        DemandDetailDto dto = new DemandDetailDto();
        dto.setId(d.getId());
        dto.setCommunityId(d.getCommunityId());
        dto.setCategory(d.getCategory());
        dto.setItemName(d.getItemName());
        dto.setNeededFrom(d.getNeededFrom());
        dto.setNeededTo(d.getNeededTo());
        dto.setStatus(d.getStatus());
        dto.setCreatedAt(d.getCreatedAt());
        dto.setIsMyRequest(isMine);

        // Privacy protection: only reveal personal notes if it belongs to the current user
        if (isMine) {
            dto.setNotes(d.getNotes());
        } else {
            dto.setNotes(null);
        }

        return dto;
    }
}
