package com.ourthings.service;

import com.ourthings.model.Community;
import com.ourthings.repository.CommunityRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final GeminiService geminiService;

    public CommunityService(CommunityRepository communityRepository, GeminiService geminiService) {
        this.communityRepository = communityRepository;
        this.geminiService = geminiService;
    }

    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }

    public Optional<Community> getCommunityById(Long id) {
        return communityRepository.findById(id);
    }

    public Community createCommunity(String name, String type, String description, String addressDescription) {
        Community community = new Community(name, type, description, addressDescription);
        return communityRepository.save(community);
    }

    public Map<String, Object> resolveOrSuggestCommunity(String input, Double userLat, Double userLng) {
        List<Map<String, Object>> existing = communityRepository.findAll().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("type", c.getType());
            map.put("addressDescription", c.getAddressDescription());
            return map;
        }).collect(Collectors.toList());

        return geminiService.resolveCommunity(input, existing, userLat, userLng);
    }

    public Community findOrCreateByResolution(String userInput, Long matchedCommunityId, String canonicalName, String suggestedType, String address) {
        if (matchedCommunityId != null) {
            Optional<Community> existing = communityRepository.findById(matchedCommunityId);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        String targetName = canonicalName != null && !canonicalName.trim().isEmpty() ? canonicalName.trim() : userInput.trim();
        Optional<Community> byName = communityRepository.findByName(targetName);
        if (byName.isPresent()) {
            return byName.get();
        }

        // Create new standardized community
        String type = suggestedType != null ? suggestedType : "NEIGHBOURHOOD";
        String addr = address != null && !address.trim().isEmpty() ? address.trim() : (targetName + ", Bengaluru");
        Community newComm = new Community(targetName, type, "Community resource circle for " + targetName, addr);
        return communityRepository.save(newComm);
    }
}

