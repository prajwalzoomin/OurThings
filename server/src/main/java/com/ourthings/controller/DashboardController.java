package com.ourthings.controller;

import com.ourthings.dto.DashboardDtos.DashboardResponseDto;
import com.ourthings.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponseDto> getDashboard(@RequestHeader("X-Community-Id") Long communityId) {
        DashboardResponseDto dashboard = dashboardService.getCommunityDashboard(communityId);
        return ResponseEntity.ok(dashboard);
    }
}
