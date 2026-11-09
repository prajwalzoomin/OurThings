-- OurThings Database Schema DDL
-- Compatible with MySQL 8.0+

CREATE TABLE IF NOT EXISTS communities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    address_description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    room_or_flat VARCHAR(50),
    active_community_id BIGINT,
    role VARCHAR(50) DEFAULT 'MEMBER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_community FOREIGN KEY (active_community_id) REFERENCES communities(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS community_memberships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    community_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_community UNIQUE (user_id, community_id),
    CONSTRAINT fk_membership_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_membership_comm FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    item_condition VARCHAR(50) NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    available_from DATE NOT NULL,
    available_to DATE NOT NULL,
    estimated_replacement_value_inr DECIMAL(10,2),
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS borrow_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    community_id BIGINT NOT NULL,
    borrower_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    borrow_purpose TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_item FOREIGN KEY (item_id) REFERENCES item_listings(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_comm FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_borrower FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS handover_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL UNIQUE,
    item_id BIGINT NOT NULL,
    handed_over_at TIMESTAMP NULL,
    initial_condition_notes TEXT,
    planned_return_date DATE NOT NULL,
    returned_at TIMESTAMP NULL,
    return_condition_notes TEXT,
    issue_reported BOOLEAN DEFAULT FALSE,
    issue_details TEXT,
    confirmed_by_owner BOOLEAN DEFAULT FALSE,
    confirmed_by_borrower BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_handover_req FOREIGN KEY (request_id) REFERENCES borrow_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_handover_item FOREIGN KEY (item_id) REFERENCES item_listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unmet_demands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    requester_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    normalized_name VARCHAR(200) NOT NULL,
    needed_from DATE,
    needed_to DATE,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_demand_comm FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_demand_user FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    community_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    summary VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

