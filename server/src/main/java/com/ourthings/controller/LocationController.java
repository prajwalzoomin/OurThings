package com.ourthings.controller;

import com.ourthings.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<Map<String, Object>> reverseGeocode(
            @RequestParam double lat,
            @RequestParam double lng) {
        Map<String, Object> data = locationService.reverseGeocode(lat, lng);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchPlace(
            @RequestParam String query) {
        List<Map<String, Object>> results = locationService.searchPlace(query);
        return ResponseEntity.ok(results);
    }
}

