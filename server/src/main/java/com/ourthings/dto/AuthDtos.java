package com.ourthings.dto;

public class AuthDtos {

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String phone;
        private String password;
        private String roomOrFlat;
        private Long communityId;
        private String avatarUrl;
        private String city;
        private String pincode;
        private String address;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRoomOrFlat() { return roomOrFlat; }
        public void setRoomOrFlat(String roomOrFlat) { this.roomOrFlat = roomOrFlat; }

        public Long getCommunityId() { return communityId; }
        public void setCommunityId(Long communityId) { this.communityId = communityId; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }

    public static class UpdateProfileRequest {
        private String name;
        private String phone;
        private String roomOrFlat;
        private String avatarUrl;
        private String address;
        private String city;
        private String pincode;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getRoomOrFlat() { return roomOrFlat; }
        public void setRoomOrFlat(String roomOrFlat) { this.roomOrFlat = roomOrFlat; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }
    }

    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String roomOrFlat;
        private String avatarUrl;
        private String address;
        private String city;
        private String pincode;
        private Long activeCommunityId;
        private String role;

        public UserDto(Long id, String name, String email, String phone, String roomOrFlat, String avatarUrl, String address, String city, String pincode, Long activeCommunityId, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.roomOrFlat = roomOrFlat;
            this.avatarUrl = avatarUrl;
            this.address = address;
            this.city = city;
            this.pincode = pincode;
            this.activeCommunityId = activeCommunityId;
            this.role = role;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getRoomOrFlat() { return roomOrFlat; }
        public String getAvatarUrl() { return avatarUrl; }
        public String getAddress() { return address; }
        public String getCity() { return city; }
        public String getPincode() { return pincode; }
        public Long getActiveCommunityId() { return activeCommunityId; }
        public String getRole() { return role; }
    }
}

