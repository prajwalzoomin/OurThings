package com.ourthings.service;

import com.ourthings.model.Community;
import com.ourthings.repository.CommunityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;

    public CommunityService(CommunityRepository communityRepository) {
        this.communityRepository = communityRepository;
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
}

