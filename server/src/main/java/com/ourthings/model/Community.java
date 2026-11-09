package com.ourthings.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "communities")
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // HOSTEL, APARTMENT, NEIGHBOURHOOD

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "address_description", length = 255)
    private String addressDescription;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Community() {}

    public Community(String name, String type, String description, String addressDescription) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.addressDescription = addressDescription;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
