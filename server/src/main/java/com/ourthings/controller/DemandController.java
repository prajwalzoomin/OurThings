package com.ourthings.controller;

import com.ourthings.dto.DemandDtos.*;
import com.ourthings.service.DemandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demands")
public class DemandController {

    private final DemandService demandService;

    public DemandController(DemandService demandService) {
        this.demandService = demandService;
    }

    @GetMapping("/aggregated")
    public List<AggregatedDemandDto> getAggregatedDemands(@RequestHeader(value = "X-Community-Id", required = false) Long communityId) {
        return demandService.getAggregatedDemands(communityId != null ? communityId : 1L);
    }

    @GetMapping("/open")
    public List<DemandDetailDto> getOpenDemands(@RequestHeader(value = "X-Community-Id", required = false) Long communityId,
                                                @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return demandService.getAllOpenDemandsScrubbed(communityId != null ? communityId : 1L, userId != null ? userId : -1L);
    }

    @GetMapping("/my")
    public List<DemandDetailDto> getMyDemands(@RequestHeader(value = "X-Community-Id", required = false) Long communityId,
                                              @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) return List.of();
        Long effectiveCommId = communityId != null ? communityId : 1L;
        return demandService.getMyDemands(effectiveCommId, userId);
    }

    @PostMapping
    public ResponseEntity<DemandDetailDto> submitDemand(@RequestHeader(value = "X-Community-Id", required = false) Long communityId,
                                                        @RequestHeader("X-User-Id") Long userId,
                                                        @RequestBody CreateDemandRequest req) {
        Long effectiveCommId = communityId != null ? communityId : 1L;
        DemandDetailDto created = demandService.submitDemand(effectiveCommId, userId, req);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/fulfill")
    public ResponseEntity<Void> fulfillDemand(@PathVariable Long id,
                                              @RequestHeader(value = "X-Community-Id", required = false) Long communityId,
                                              @RequestHeader("X-User-Id") Long userId) {
        Long effectiveCommId = communityId != null ? communityId : 1L;
        demandService.fulfillDemand(id, effectiveCommId, userId);
        return ResponseEntity.ok().build();
    }
}

