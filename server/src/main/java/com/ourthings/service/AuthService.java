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

    public static String hashPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            return null;
        }
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public UserDto login(LoginRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address or phone number is required.");
        }
        if (req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        String identifier = req.getEmail().trim();
        User user = userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new IllegalArgumentException("No registered account found with: " + identifier));

        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            String enteredHash = hashPassword(req.getPassword().trim());
            if (!user.getPasswordHash().equalsIgnoreCase(enteredHash) && !user.getPasswordHash().equals(req.getPassword().trim())) {
                throw new IllegalArgumentException("Incorrect password. Please verify your credentials and try again.");
            }
        }

        return toDto(user);
    }

    @Transactional
    public UserDto register(RegisterRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (req.getPassword() == null || req.getPassword().trim().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new IllegalArgumentException("An account with email " + email + " already exists. Please sign in instead.");
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

        String avatar = req.getAvatarUrl();
        if (avatar == null || avatar.trim().isEmpty()) {
            avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + Math.abs(email.hashCode()) + "&backgroundColor=0f172a,1e293b,334155";
        }

        User user = new User(req.getName().trim(), email, req.getPhone() != null ? req.getPhone().trim() : "", req.getRoomOrFlat() != null ? req.getRoomOrFlat().trim() : "", avatar, resolvedCommId, "MEMBER");
        user.setPasswordHash(hashPassword(req.getPassword().trim()));
        if (req.getCity() != null && !req.getCity().trim().isEmpty()) {
            user.setCity(req.getCity().trim());
        }
        if (req.getPincode() != null && !req.getPincode().trim().isEmpty()) {
            user.setPincode(req.getPincode().trim());
        }
        if (req.getAddress() != null && !req.getAddress().trim().isEmpty()) {
            user.setAddress(req.getAddress().trim());
        }

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
