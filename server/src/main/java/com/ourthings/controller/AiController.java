package com.ourthings.controller;

import com.ourthings.model.ItemListing;
import com.ourthings.repository.ItemListingRepository;
import com.ourthings.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;
    private final ItemListingRepository itemListingRepository;

    public AiController(GeminiService geminiService, ItemListingRepository itemListingRepository) {
        this.geminiService = geminiService;
        this.itemListingRepository = itemListingRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(geminiService.getAiStatus());
    }

    @PostMapping("/key")
    public ResponseEntity<Map<String, Object>> setApiKey(@RequestBody Map<String, String> payload) {
        String key = payload.get("key");
        geminiService.setRuntimeApiKey(key);
        return ResponseEntity.ok(geminiService.getAiStatus());
    }

    @PostMapping("/parse-address")
    public ResponseEntity<Map<String, Object>> parseAddress(@RequestBody Map<String, String> payload) {
        String raw = payload.get("address");
        Map<String, Object> parsed = geminiService.parseAndStandardizeAddress(raw);
        return ResponseEntity.ok(parsed);
    }

    @PostMapping("/smart-search")
    public ResponseEntity<Map<String, Object>> smartSearch(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        List<ItemListing> allItems = itemListingRepository.findAll();
        Map<String, Object> result = geminiService.smartSearch(query, allItems);
        return ResponseEntity.ok(result);
    }
}

