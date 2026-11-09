package com.ourthings.controller;

import com.ourthings.dto.BorrowRequestDtos.*;
import com.ourthings.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final BookingService bookingService;

    public RequestController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BorrowRequestResponseDto> submitRequest(@RequestHeader("X-Community-Id") Long communityId,
                                                                  @RequestHeader("X-User-Id") Long userId,
                                                                  @RequestBody CreateBorrowRequest req) {
        BorrowRequestResponseDto created = bookingService.submitRequest(communityId, userId, req);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/borrower")
    public List<BorrowRequestResponseDto> getMyBorrowRequests(@RequestHeader("X-User-Id") Long userId) {
        return bookingService.getRequestsByBorrower(userId);
    }

    @GetMapping("/owner")
    public List<BorrowRequestResponseDto> getIncomingRequestsForOwner(@RequestHeader("X-User-Id") Long userId) {
        return bookingService.getRequestsForOwner(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowRequestResponseDto> getRequestById(@PathVariable Long id,
                                                                   @RequestHeader("X-Community-Id") Long communityId) {
        return ResponseEntity.ok(bookingService.getRequestById(id, communityId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<BorrowRequestResponseDto> approveRequest(@PathVariable Long id,
                                                                   @RequestHeader("X-Community-Id") Long communityId,
                                                                   @RequestHeader("X-User-Id") Long userId) {
        BorrowRequestResponseDto approved = bookingService.approveRequest(id, communityId, userId);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<BorrowRequestResponseDto> declineRequest(@PathVariable Long id,
                                                                   @RequestHeader("X-Community-Id") Long communityId,
                                                                   @RequestHeader("X-User-Id") Long userId) {
        BorrowRequestResponseDto declined = bookingService.declineRequest(id, communityId, userId);
        return ResponseEntity.ok(declined);
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<BorrowRequestResponseDto> withdrawRequest(@PathVariable Long id,
                                                                    @RequestHeader("X-Community-Id") Long communityId,
                                                                    @RequestHeader("X-User-Id") Long userId) {
        BorrowRequestResponseDto withdrawn = bookingService.withdrawRequest(id, communityId, userId);
        return ResponseEntity.ok(withdrawn);
    }
}

