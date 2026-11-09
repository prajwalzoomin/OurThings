package com.ourthings.controller;

import com.ourthings.model.Community;
import com.ourthings.service.CommunityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping
    public List<Community> getAllCommunities() {
        return communityService.getAllCommunities();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Community> getCommunityById(@PathVariable Long id) {
        return communityService.getCommunityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Community> createCommunity(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String type = body.get("type");
        String description = body.get("description");
        String address = body.get("addressDescription");

        if (name == null || name.trim().isEmpty() || type == null || type.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Community created = communityService.createCommunity(name.trim(), type.trim(), description, address);
        return ResponseEntity.ok(created);
    }
}

