package com.ourthings.service;

import com.ourthings.dto.DashboardDtos.*;
import com.ourthings.model.ActivityLog;
import com.ourthings.model.BorrowRequest;
import com.ourthings.model.ItemListing;
import com.ourthings.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ItemListingRepository itemListingRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final UnmetDemandRepository unmetDemandRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardService(ItemListingRepository itemListingRepository,
                            BorrowRequestRepository borrowRequestRepository,
                            UnmetDemandRepository unmetDemandRepository,
                            ActivityLogRepository activityLogRepository) {
        this.itemListingRepository = itemListingRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.unmetDemandRepository = unmetDemandRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public DashboardResponseDto getCommunityDashboard(Long communityId) {
        List<ItemListing> activeItems = itemListingRepository.findByCommunityIdAndStatusNot(communityId, "INACTIVE");
        List<BorrowRequest> allRequests = borrowRequestRepository.findByCommunityIdOrderByCreatedAtDesc(communityId);

        long activeLoans = allRequests.stream()
                .filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .count();

        List<BorrowRequest> fulfilledLoans = allRequests.stream()
                .filter(r -> "RETURNED".equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        long openDemands = unmetDemandRepository.countByCommunityIdAndStatus(communityId, "OPEN");

        // Calculate utilization rate
        Set<Long> loanedItemIds = allRequests.stream()
                .filter(r -> "RETURNED".equalsIgnoreCase(r.getStatus()) || "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .map(BorrowRequest::getItemId)
                .collect(Collectors.toSet());

        double utilizationRate = activeItems.isEmpty() ? 0.0 :
                Math.round((loanedItemIds.size() * 100.0 / activeItems.size()) * 10.0) / 10.0;

        // Calculate total days borrowed
        long totalDaysBorrowed = allRequests.stream()
                .filter(r -> "RETURNED".equalsIgnoreCase(r.getStatus()) || "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .mapToLong(r -> {
                    if (r.getStartDate() != null && r.getEndDate() != null) {
                        long days = ChronoUnit.DAYS.between(r.getStartDate(), r.getEndDate()) + 1;
                        return Math.max(days, 1);
                    }
                    return 0;
                })
                .sum();

        // Calculate avoided expenditure from completed borrowings with recorded replacement values
        Map<Long, ItemListing> itemMap = activeItems.stream()
                .collect(Collectors.toMap(ItemListing::getId, i -> i, (a, b) -> a));

        BigDecimal avoidedExpenditure = BigDecimal.ZERO;
        for (BorrowRequest req : fulfilledLoans) {
            ItemListing it = itemMap.get(req.getItemId());
            if (it == null) {
                it = itemListingRepository.findById(req.getItemId()).orElse(null);
            }
            if (it != null && it.getEstimatedReplacementValueInr() != null) {
                avoidedExpenditure = avoidedExpenditure.add(it.getEstimatedReplacementValueInr());
            }
        }

        String explanation = "Formula: Sum of owner-reported replacement purchase values for items successfully borrowed and returned in this community. " +
                "Items without a stated replacement value are excluded. This indicates estimated avoided upfront equipment purchases for occasional use.";

        // Popular categories breakdown
        Map<String, Long> categoryItemCount = activeItems.stream()
                .collect(Collectors.groupingBy(ItemListing::getCategory, Collectors.counting()));

        Map<String, Long> categoryLoanCount = new HashMap<>();
        for (BorrowRequest req : allRequests) {
            if ("RETURNED".equalsIgnoreCase(req.getStatus()) || "ACTIVE".equalsIgnoreCase(req.getStatus())) {
                ItemListing it = itemMap.get(req.getItemId());
                if (it == null) {
                    it = itemListingRepository.findById(req.getItemId()).orElse(null);
                }
                if (it != null) {
                    categoryLoanCount.merge(it.getCategory(), 1L, Long::sum);
                }
            }
        }

        List<CategoryStatDto> categoryStats = new ArrayList<>();
        Set<String> allCats = new TreeSet<>();
        allCats.addAll(categoryItemCount.keySet());
        allCats.addAll(categoryLoanCount.keySet());

        for (String cat : allCats) {
            long iCount = categoryItemCount.getOrDefault(cat, 0L);
            long lCount = categoryLoanCount.getOrDefault(cat, 0L);
            categoryStats.add(new CategoryStatDto(cat, iCount, lCount));
        }

        // Recent activity
        List<ActivityLog> logs = activityLogRepository.findTop20ByCommunityIdOrderByCreatedAtDesc(communityId);
        List<ActivitySummaryDto> activityList = logs.stream()
                .map(l -> new ActivitySummaryDto(l.getId(), l.getActionType(), l.getSummary(), l.getCreatedAt()))
                .collect(Collectors.toList());

        DashboardResponseDto dto = new DashboardResponseDto();
        dto.setTotalItems(activeItems.size());
        dto.setActiveLoans(activeLoans);
        dto.setFulfilledRequests(fulfilledLoans.size());
        dto.setOpenDemands(openDemands);
        dto.setUtilizationRatePercent(utilizationRate);
        dto.setTotalDaysBorrowed(totalDaysBorrowed);
        dto.setAvoidedExpenditureEstimateInr(avoidedExpenditure);
        dto.setAvoidedExpenditureExplanation(explanation);
        dto.setCategoryBreakdown(categoryStats);
        dto.setRecentActivity(activityList);

        return dto;
    }
}

