package com.ourthings.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class DashboardDtos {

    public static class CategoryStatDto {
        private String category;
        private long itemCount;
        private long loanCount;

        public CategoryStatDto(String category, long itemCount, long loanCount) {
            this.category = category;
            this.itemCount = itemCount;
            this.loanCount = loanCount;
        }

        public String getCategory() { return category; }
        public long getItemCount() { return itemCount; }
        public long getLoanCount() { return loanCount; }
    }

    public static class ActivitySummaryDto {
        private Long id;
        private String actionType;
        private String summary;
        private LocalDateTime createdAt;

        public ActivitySummaryDto(Long id, String actionType, String summary, LocalDateTime createdAt) {
            this.id = id;
            this.actionType = actionType;
            this.summary = summary;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public String getActionType() { return actionType; }
        public String getSummary() { return summary; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    public static class DashboardResponseDto {
        private long totalItems;
        private long activeLoans;
        private long fulfilledRequests;
        private long openDemands;
        private double utilizationRatePercent;
        private long totalDaysBorrowed;
        private BigDecimal avoidedExpenditureEstimateInr;
        private String avoidedExpenditureExplanation;
        private List<CategoryStatDto> categoryBreakdown;
        private List<ActivitySummaryDto> recentActivity;

        public long getTotalItems() { return totalItems; }
        public void setTotalItems(long totalItems) { this.totalItems = totalItems; }

        public long getActiveLoans() { return activeLoans; }
        public void setActiveLoans(long activeLoans) { this.activeLoans = activeLoans; }

        public long getFulfilledRequests() { return fulfilledRequests; }
        public void setFulfilledRequests(long fulfilledRequests) { this.fulfilledRequests = fulfilledRequests; }

        public long getOpenDemands() { return openDemands; }
        public void setOpenDemands(long openDemands) { this.openDemands = openDemands; }

        public double getUtilizationRatePercent() { return utilizationRatePercent; }
        public void setUtilizationRatePercent(double utilizationRatePercent) { this.utilizationRatePercent = utilizationRatePercent; }

        public long getTotalDaysBorrowed() { return totalDaysBorrowed; }
        public void setTotalDaysBorrowed(long totalDaysBorrowed) { this.totalDaysBorrowed = totalDaysBorrowed; }

        public BigDecimal getAvoidedExpenditureEstimateInr() { return avoidedExpenditureEstimateInr; }
        public void setAvoidedExpenditureEstimateInr(BigDecimal avoidedExpenditureEstimateInr) { this.avoidedExpenditureEstimateInr = avoidedExpenditureEstimateInr; }

        public String getAvoidedExpenditureExplanation() { return avoidedExpenditureExplanation; }
        public void setAvoidedExpenditureExplanation(String avoidedExpenditureExplanation) { this.avoidedExpenditureExplanation = avoidedExpenditureExplanation; }

        public List<CategoryStatDto> getCategoryBreakdown() { return categoryBreakdown; }
        public void setCategoryBreakdown(List<CategoryStatDto> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

        public List<ActivitySummaryDto> getRecentActivity() { return recentActivity; }
        public void setRecentActivity(List<ActivitySummaryDto> recentActivity) { this.recentActivity = recentActivity; }
    }
}
