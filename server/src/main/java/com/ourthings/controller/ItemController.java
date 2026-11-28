package com.ourthings.controller;

import com.ourthings.dto.ItemDtos.*;
import com.ourthings.service.ItemService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<ItemResponseDto> getItems(@RequestHeader(value = "X-Community-Id", required = false) Long headerCommunityId,
                                          @RequestHeader(value = "X-User-Lat", required = false) Double headerLat,
                                          @RequestHeader(value = "X-User-Lng", required = false) Double headerLng,
                                          @RequestParam(required = false) Long communityId,
                                          @RequestParam(required = false) String category,
                                          @RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) String condition,
                                          @RequestParam(required = false) Double userLat,
                                          @RequestParam(required = false) Double userLng,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        Long effectiveCommunityId = communityId != null ? communityId : headerCommunityId;
        Double effectiveLat = userLat != null ? userLat : headerLat;
        Double effectiveLng = userLng != null ? userLng : headerLng;
        return itemService.searchItems(effectiveCommunityId, category, keyword, condition, dateFrom, dateTo, effectiveLat, effectiveLng);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDto> getItemById(@PathVariable Long id,
                                                       @RequestHeader(value = "X-Community-Id", required = false) Long headerCommunityId,
                                                       @RequestHeader(value = "X-User-Lat", required = false) Double headerLat,
                                                       @RequestHeader(value = "X-User-Lng", required = false) Double headerLng,
                                                       @RequestParam(required = false) Long communityId,
                                                       @RequestParam(required = false) Double userLat,
                                                       @RequestParam(required = false) Double userLng) {
        Long effectiveCommunityId = communityId != null ? communityId : headerCommunityId;
        Double effectiveLat = userLat != null ? userLat : headerLat;
        Double effectiveLng = userLng != null ? userLng : headerLng;
        return ResponseEntity.ok(itemService.getItemById(id, effectiveCommunityId, effectiveLat, effectiveLng));
    }

    @GetMapping("/my-listings")
    public List<ItemResponseDto> getMyListings(@RequestHeader("X-User-Id") Long userId) {
        return itemService.getItemsByOwner(userId);
    }

    @PostMapping
    public ResponseEntity<ItemResponseDto> createItem(@RequestHeader(value = "X-Community-Id", required = false) Long communityId,
                                                      @RequestHeader("X-User-Id") Long userId,
                                                      @RequestBody CreateUpdateItemRequest req) {
        Long effectiveCommId = communityId != null ? communityId : req.getCommunityId();
        ItemResponseDto created = itemService.createItem(effectiveCommId, userId, req);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponseDto> updateItem(@PathVariable Long id,
                                                      @RequestHeader(value = "X-Community-Id", required = false) Long communityId,
                                                      @RequestHeader("X-User-Id") Long userId,
                                                      @RequestBody CreateUpdateItemRequest req) {
        ItemResponseDto updated = itemService.updateItem(id, communityId, userId, req);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/toggle-pause")
    public ResponseEntity<ItemResponseDto> togglePause(@PathVariable Long id,
                                                       @RequestHeader(value = "X-Community-Id", required = false) Long communityId,
                                                       @RequestHeader("X-User-Id") Long userId) {
        ItemResponseDto updated = itemService.togglePause(id, communityId, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable Long id,
                                           @RequestHeader(value = "X-Community-Id", required = false) Long communityId,
                                           @RequestHeader("X-User-Id") Long userId) {
        itemService.removeItem(id, communityId, userId);
        return ResponseEntity.noContent().build();
    }
}

