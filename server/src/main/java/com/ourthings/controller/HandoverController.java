package com.ourthings.controller;

import com.ourthings.dto.HandoverDtos.*;
import com.ourthings.model.HandoverRecord;
import com.ourthings.service.HandoverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/handovers")
public class HandoverController {

    private final HandoverService handoverService;

    public HandoverController(HandoverService handoverService) {
        this.handoverService = handoverService;
    }

    @PostMapping("/{requestId}/handover")
    public ResponseEntity<HandoverRecord> recordHandover(@PathVariable Long requestId,
                                                         @RequestHeader("X-Community-Id") Long communityId,
                                                         @RequestHeader("X-User-Id") Long userId,
                                                         @RequestBody RecordHandoverRequest req) {
        HandoverRecord record = handoverService.recordHandover(requestId, communityId, userId, req);
        return ResponseEntity.ok(record);
    }

    @PostMapping("/{requestId}/return")
    public ResponseEntity<HandoverRecord> recordReturn(@PathVariable Long requestId,
                                                       @RequestHeader("X-Community-Id") Long communityId,
                                                       @RequestHeader("X-User-Id") Long userId,
                                                       @RequestBody RecordReturnRequest req) {
        HandoverRecord record = handoverService.recordReturn(requestId, communityId, userId, req);
        return ResponseEntity.ok(record);
    }
}

