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
    public List<ItemResponseDto> getItems(@RequestHeader("X-Community-Id") Long communityId,
                                          @RequestParam(required = false) String category,
                                          @RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return itemService.searchItems(communityId, category, keyword, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDto> getItemById(@PathVariable Long id,
                                                       @RequestHeader("X-Community-Id") Long communityId) {
        return ResponseEntity.ok(itemService.getItemById(id, communityId));
    }

    @GetMapping("/my-listings")
    public List<ItemResponseDto> getMyListings(@RequestHeader("X-User-Id") Long userId) {
        return itemService.getItemsByOwner(userId);
    }

    @PostMapping
    public ResponseEntity<ItemResponseDto> createItem(@RequestHeader("X-Community-Id") Long communityId,
                                                      @RequestHeader("X-User-Id") Long userId,
                                                      @RequestBody CreateUpdateItemRequest req) {
        ItemResponseDto created = itemService.createItem(communityId, userId, req);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponseDto> updateItem(@PathVariable Long id,
                                                      @RequestHeader("X-Community-Id") Long communityId,
                                                      @RequestHeader("X-User-Id") Long userId,
                                                      @RequestBody CreateUpdateItemRequest req) {
        ItemResponseDto updated = itemService.updateItem(id, communityId, userId, req);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/toggle-pause")
    public ResponseEntity<ItemResponseDto> togglePause(@PathVariable Long id,
                                                       @RequestHeader("X-Community-Id") Long communityId,
                                                       @RequestHeader("X-User-Id") Long userId) {
        ItemResponseDto updated = itemService.togglePause(id, communityId, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable Long id,
                                           @RequestHeader("X-Community-Id") Long communityId,
                                           @RequestHeader("X-User-Id") Long userId) {
        itemService.removeItem(id, communityId, userId);
        return ResponseEntity.noContent().build();
    }
}

