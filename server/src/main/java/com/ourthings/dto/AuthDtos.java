package com.ourthings.dto;

public class AuthDtos {

    public static class LoginRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String phone;
        private String roomOrFlat;
        private Long communityId;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getRoomOrFlat() { return roomOrFlat; }
        public void setRoomOrFlat(String roomOrFlat) { this.roomOrFlat = roomOrFlat; }
        public Long getCommunityId() { return communityId; }
        public void setCommunityId(Long communityId) { this.communityId = communityId; }
    }

    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String roomOrFlat;
        private Long activeCommunityId;
        private String role;

        public UserDto(Long id, String name, String email, String phone, String roomOrFlat, Long activeCommunityId, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.roomOrFlat = roomOrFlat;
            this.activeCommunityId = activeCommunityId;
            this.role = role;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getRoomOrFlat() { return roomOrFlat; }
        public Long getActiveCommunityId() { return activeCommunityId; }
        public String getRole() { return role; }
    }
}

