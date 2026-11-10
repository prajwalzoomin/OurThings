package com.ourthings.service;

import com.ourthings.dto.AuthDtos.*;
import com.ourthings.model.Community;
import com.ourthings.model.CommunityMembership;
import com.ourthings.model.User;
import com.ourthings.repository.CommunityMembershipRepository;
import com.ourthings.repository.CommunityRepository;
import com.ourthings.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMembershipRepository membershipRepository;

    public AuthService(UserRepository userRepository,
                       CommunityRepository communityRepository,
                       CommunityMembershipRepository membershipRepository) {
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.membershipRepository = membershipRepository;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<UserDto> getUserById(Long userId) {
        return userRepository.findById(userId).map(this::toDto);
    }

    public Optional<UserDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toDto);
    }

    @Transactional
    public UserDto register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("A user with email " + req.getEmail() + " already exists.");
        }

        final Long resolvedCommId;
        if (req.getCommunityId() != null) {
            Long reqId = req.getCommunityId();
            communityRepository.findById(reqId)
                    .orElseThrow(() -> new IllegalArgumentException("Community not found with id: " + reqId));
            resolvedCommId = reqId;
        } else {
            resolvedCommId = communityRepository.findAll().stream().findFirst().map(Community::getId).orElse(null);
        }

        User user = new User(req.getName(), req.getEmail(), req.getPhone(), req.getRoomOrFlat(), resolvedCommId, "MEMBER");
        user = userRepository.save(user);

        if (resolvedCommId != null) {
            membershipRepository.save(new CommunityMembership(user.getId(), resolvedCommId));
        }

        return toDto(user);
    }

    @Transactional
    public UserDto switchActiveCommunity(Long userId, Long communityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found: " + communityId));

        if (!membershipRepository.existsByUserIdAndCommunityId(userId, communityId)) {
            membershipRepository.save(new CommunityMembership(userId, communityId));
        }

        user.setActiveCommunityId(communityId);
        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            user.setName(req.getName().trim());
        }
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone().trim());
        }
        if (req.getRoomOrFlat() != null) {
            user.setRoomOrFlat(req.getRoomOrFlat().trim());
        }
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl().trim());
        }
        if (req.getAddress() != null) {
            user.setAddress(req.getAddress().trim());
        }
        if (req.getCity() != null) {
            user.setCity(req.getCity().trim());
        }
        if (req.getPincode() != null) {
            user.setPincode(req.getPincode().trim());
        }

        user = userRepository.save(user);
        return toDto(user);
    }

    public UserDto toDto(User u) {
        return new UserDto(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getPhone(),
                u.getRoomOrFlat(),
                u.getAvatarUrl(),
                u.getAddress(),
                u.getCity() != null ? u.getCity() : "Bengaluru",
                u.getPincode() != null ? u.getPincode() : "560103",
                u.getActiveCommunityId(),
                u.getRole()
        );
    }
}
