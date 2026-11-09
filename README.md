# OurThings: Community Resource Sharing Platform

**Societal Based Mini Project (24CSE57)**  
Department of Computer Science and Engineering, New Horizon College of Engineering (NHCE)  
Academic Year 2026-27 | Semester V  
*Team:* 1NH25CS424 (Prajwal B), 1NH25CS416 (Mohammed Kasim) | *Guide:* Ms. Chitra C

---

## 1. Project Overview

**OurThings** is a community resource-sharing platform designed for hostel, apartment, and neighbourhood groups. It enables members to lend, find, reserve, inspect, and return infrequently used items (such as healthcare and mobility aids, power tools, electronics, event equipment, and travel gear) instead of purchasing them for occasional use.

The application addresses poor visibility into item availability, borrowing periods, return deadlines, and condition tracking through server-enforced booking conflict prevention, mutual handover inspections, and privacy-preserving demand aggregation.

---

## 2. Technology Stack

- **Frontend:** React 18 with Vite, modular CSS design system, typography using *IBM Plex Sans* and *IBM Plex Mono*.
- **Backend:** Java Spring Boot 3.3.5 REST API, Spring Data JPA, Hibernate, Bean Validation, transactional concurrency controls.
- **Persistence:** 
  - Standard support for **MySQL 8.0+** via profile (`--spring.profiles.active=mysql`).
  - Out-of-the-box persistent **H2 database in MySQL compatibility mode** (`MODE=MySQL;DATABASE_TO_LOWER=TRUE`) for instant local evaluation without requiring external database server setup.
- **Architecture:** Client-server REST architecture with full frontend static bundling into the Spring Boot executable JAR.

---

## 3. Strict Visual & Design System Compliance

In accordance with the build brief's anti-template direction, OurThings strictly complies with the following design requirements:

- **Palette:** Light warm-neutral canvas (`#f5f4ef`) rather than pure white, dark charcoal text (`#21201d`) rather than pure black, and a functional forest slate accent (`#1f4e3b`).
- **Surfaces & Borders:** Crisp 1px solid borders (`#dcd9cf`) and subtle surface tones. **No drop shadows**, radial orbs, glowing borders, or glass cards.
- **Controls:** Modest 2-4px corner rounding. **No pill-shaped default buttons** or oversized soft radii.
- **Typography:** IBM Plex Sans. **No Inter, Geist, or Space Grotesk**.
- **No Decorative Slop:** No emojis, sparkle icons, rainbow gradients, bento feature walls, fake code windows, or animated arrows.
- **Copy Standards:** Clear, truthful interface copy without startup slogans, em dashes, or "it's not X, it's Y" constructions.
- **Accessibility:** High contrast meeting WCAG 2.2 AA standards with visible focus indicators and accessible form labels.

---

## 4. Implemented User Journeys & Core Capabilities

### 1. Community Scoping & Membership Association
- Scopes all items, requests, handovers, and demands to a defined community (e.g. *Cauvery Boys Hostel*, *Green Glen Heights Apartment*, or *Kaikondrahalli Neighbourhood*).
- Server validates that members can only query or operate on resources in their active community.
- Header includes an instant community and demo user switcher for interactive evaluation.

### 2. Resource Listing Management
- Members list resources with title, description, category, observed condition (*Like New*, *Good*, *Fair*), pickup location, and availability dates.
- Optional *Estimated Replacement Value (INR)* for tracking community avoided expenditure.
- Item owners can pause, edit, or remove listings when no active loan is in progress.

### 3. Search & Discovery
- Search by keywords across titles and descriptions.
- Filter by category (*Healthcare & Mobility*, *Tools & Hardware*, *Electronics*, *Event Equipment*, *Travel Gear*).
- Filter by needed date availability range.
- Detailed listing view presents item specifications, owner contact info, and existing confirmed booking windows.

### 4. Time-Bound Borrow Requests
- Borrowers select a start and end date with an optional usage note.
- Server validates date ranges (`start >= today`, `start <= end`, dates within owner's listed availability).
- Item owner can review incoming requests to approve or decline. Borrowers can withdraw pending requests.

### 5. Deterministic Booking Conflict Prevention
- Checks confirmed reservations on the server inside a database transaction (`findConflictingConfirmedReservations`).
- Two members cannot reserve the same item for overlapping periods.
- Overlapping requests receive an immediate HTTP 409 Conflict rejection.
- Pending requests remain visible to the owner with conflict warnings, clearly distinguished from locked confirmed reservations.

### 6. Handover & Return Audit Trail
- **Handover Stage:** Owner or borrower logs initial condition verification notes and planned return date, transitioning the loan to `ACTIVE` and the item to `LENT`.
- **Return Stage:** Observed condition and actual return date are recorded.
- **Problem & Dispute Logging:** If either party reports an issue or damage, the record is preserved permanently with issue details rather than silently closing the loan.

### 7. Demand Aggregation (Unmet Demand)
- Members can submit requests for resources not currently listed in the community.
- Deterministic name normalization (lowercasing, punctuation stripping, whitespace collapsing) groups repeated community needs.
- **Privacy Protection:** Requester names, room numbers, and personal medical notes are stripped from public community aggregates. Only the normalized item title, category, and demand count are displayed.
- Community owners can click *"I have this item! List it now"* to fulfill open demands.

### 8. Community Activity Dashboard & Avoided Expenditure
- Real operational metrics: Shared Inventory, Active Loans, Fulfilled Borrowings, Resource Utilization Rate (%), Total Days Borrowed, and Open Demands.
- **Estimated Avoided Expenditure:** Documented formula summing replacement purchase costs of completed borrowings. Clearly labeled as a rough estimate.
- Category breakdown and recent timestamped activity log.

### 9. Reviewable Terms & Privacy Policy
- Dedicated, navigable pages linked in the footer covering non-commercial sharing terms, property care, server scoping, and healthcare/mobility equipment privacy.

---

## 5. Integration Decisions Record

- **Razorpay (Payments):** The project synopsis listed Razorpay without defining a payment flow. Because OurThings is a non-commercial peer lending service for hostels and apartment communities, billing, checkout, and payment collection have been intentionally excluded from core borrowing.
- **LLM API:** Both source documents referenced an LLM API without specifying its function. For reliability, deterministic matching and normalization are implemented for demand aggregation. AI features have not been added to booking conflict, authorization, or safety decisions.

---

## 6. How to Run Locally

### Prerequisites
- Java JDK 21+ (Java 26 supported)
- Node.js 18+ (tested with v20.18.0)

### Quick Start (Single Full Stack Server on Port 8080)

1. Double-click or run:
   ```cmd
   run-server.bat
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8080/
   ```
   The Spring Boot application automatically serves both the REST API and the React frontend.

### Development Mode (Vite HMR on Port 5173)

1. In terminal 1, start the backend:
   ```cmd
   run-server.bat
   ```
2. In terminal 2, start the Vite client:
   ```cmd
   run-client.bat
   ```
3. Open `http://localhost:5173/`. Requests to `/api/*` are automatically proxied to port 8080.

### Running with Native MySQL (Optional)

1. Create a MySQL database named `ourthings`.
2. Start the server with the MySQL profile:
   ```cmd
   cd server
   java -jar target/ourthings-server-1.0.0.jar --spring.profiles.active=mysql --MYSQL_USER=root --MYSQL_PASSWORD=yourpassword
   ```

---

## 7. Sample Community Demo Data

The database is pre-seeded with realistic community scenarios:

| Community | Pre-seeded Resources | Demonstration Scenario |
| :--- | :--- | :--- |
| **Cauvery Boys Hostel** | Bosch Impact Drill Kit, Underarm Crutches, Epson HD Projector, Wildcraft Rucksack, JBL PA Speaker | Returned drill with condition log, active projector loan, approved crutches reservation, and aggregated demand for folding wheelchairs. |
| **Green Glen Heights Apartment** | Adult Wheelchair, Omron Blood Pressure Monitor, 6-Step Folding Ladder, Large Suitcase | Fulfilled wheelchair borrowing with sanitized return notes, demand for infant scale and battery jump starter. |
| **Kaikondrahalli Neighbourhood** | Community lead account for neighbourhood ward collective | Community scoping and independent inventory. |

