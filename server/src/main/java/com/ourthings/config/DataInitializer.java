package com.ourthings.config;

import com.ourthings.model.*;
import com.ourthings.repository.*;
import com.ourthings.service.DemandService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final CommunityMembershipRepository membershipRepository;
    private final ItemListingRepository itemListingRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final HandoverRecordRepository handoverRecordRepository;
    private final UnmetDemandRepository unmetDemandRepository;
    private final ActivityLogRepository activityLogRepository;

    public DataInitializer(CommunityRepository communityRepository,
                           UserRepository userRepository,
                           CommunityMembershipRepository membershipRepository,
                           ItemListingRepository itemListingRepository,
                           BorrowRequestRepository borrowRequestRepository,
                           HandoverRecordRepository handoverRecordRepository,
                           UnmetDemandRepository unmetDemandRepository,
                           ActivityLogRepository activityLogRepository) {
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.itemListingRepository = itemListingRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.handoverRecordRepository = handoverRecordRepository;
        this.unmetDemandRepository = unmetDemandRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    public void run(String... args) {
        if (communityRepository.count() > 0) {
            return; // Already seeded
        }

        System.out.println("Seeding OurThings sample community data...");

        // 1. Communities
        Community cauvery = communityRepository.save(new Community(
                "Cauvery Boys Hostel (Campus Block A)",
                "HOSTEL",
                "Campus residence sharing group for NHCE Block A students and staff.",
                "NHCE Campus, Outer Ring Road, Marathahalli"
        ));

        Community greenGlen = communityRepository.save(new Community(
                "Green Glen Heights Apartment",
                "APARTMENT",
                "Gated residential complex sharing infrequently needed domestic tools, mobility aids, and travel gear.",
                "Green Glen Layout, Bellandur, Bangalore"
        ));

        Community kaikondrahalli = communityRepository.save(new Community(
                "Kaikondrahalli Resident Neighbourhood",
                "NEIGHBOURHOOD",
                "Neighbourhood resource collective for households around Kaikondrahalli Lake ward.",
                "Sarjapur Main Road, Bangalore"
        ));

        // 2. Users
        User prajwal = userRepository.save(new User(
                "Prajwal B (Hostel Resident)",
                "prajwal@ourthings.local",
                "+91 98450 12345",
                "Hostel Room 304",
                cauvery.getId(),
                "MEMBER"
        ));

        User kasim = userRepository.save(new User(
                "Mohammed Kasim (Hostel Resident)",
                "kasim@ourthings.local",
                "+91 98450 67890",
                "Hostel Room 212",
                cauvery.getId(),
                "MEMBER"
        ));

        User ananya = userRepository.save(new User(
                "Ananya Rao (Apartment Resident)",
                "ananya@ourthings.local",
                "+91 98450 44556",
                "Flat 402, Block B",
                greenGlen.getId(),
                "MEMBER"
        ));

        User ramesh = userRepository.save(new User(
                "Ramesh Kumar (Apartment Resident)",
                "ramesh@ourthings.local",
                "+91 98450 77889",
                "Flat 105, Block A",
                greenGlen.getId(),
                "MEMBER"
        ));

        User suresh = userRepository.save(new User(
                "Dr. Suresh Hegde (Neighbourhood Lead)",
                "suresh@ourthings.local",
                "+91 98450 99001",
                "#14, 2nd Cross",
                kaikondrahalli.getId(),
                "MEMBER"
        ));

        // Memberships
        membershipRepository.save(new CommunityMembership(prajwal.getId(), cauvery.getId()));
        membershipRepository.save(new CommunityMembership(kasim.getId(), cauvery.getId()));
        membershipRepository.save(new CommunityMembership(ananya.getId(), greenGlen.getId()));
        membershipRepository.save(new CommunityMembership(ramesh.getId(), greenGlen.getId()));
        membershipRepository.save(new CommunityMembership(suresh.getId(), kaikondrahalli.getId()));

        LocalDate today = LocalDate.now();

        // 3. Items in Cauvery Hostel
        ItemListing drill = itemListingRepository.save(new ItemListing(
                cauvery.getId(),
                prajwal.getId(),
                "[Sample] Bosch 13mm Impact Drill Kit with Masonry Bits",
                "Complete electric drill kit with 13mm chuck, forward/reverse, chuck key, and 6-piece masonry drill bit set. Ideal for room shelves and wall mountings.",
                "Tools & Hardware",
                "Good",
                "Room 304, 3rd Floor, Block A",
                today.minusDays(30),
                today.plusDays(90),
                BigDecimal.valueOf(3499.00)
        ));

        ItemListing crutches = itemListingRepository.save(new ItemListing(
                cauvery.getId(),
                prajwal.getId(),
                "[Sample] Adjustable Aluminum Underarm Crutches (Adult Pair)",
                "Lightweight push-button adjustable crutches suited for heights 5'2\" to 6'0\". Padded arm rests and heavy-duty rubber tips. Thoroughly sanitized.",
                "Healthcare & Mobility",
                "Like New",
                "Room 304, 3rd Floor, Block A",
                today.minusDays(10),
                today.plusDays(120),
                BigDecimal.valueOf(1400.00)
        ));

        ItemListing projector = itemListingRepository.save(new ItemListing(
                cauvery.getId(),
                kasim.getId(),
                "[Sample] Epson Portable Full HD Projector with HDMI Cable",
                "3300 lumens brightness, HDMI and USB inputs, built-in speaker. Includes 5-meter HDMI cord and carrying case. Ideal for project presentations and club seminars.",
                "Electronics",
                "Good",
                "Room 212, 2nd Floor, Block A",
                today.minusDays(20),
                today.plusDays(60),
                BigDecimal.valueOf(28000.00)
        ));
        // Kasim's projector is currently active on loan to Prajwal
        projector.setStatus("LENT");
        itemListingRepository.save(projector);

        ItemListing rucksack = itemListingRepository.save(new ItemListing(
                cauvery.getId(),
                kasim.getId(),
                "[Sample] Wildcraft 65L Trekking Rucksack with Rain Cover",
                "Ergonomic internal frame backpack with lumbar support, multiple compartments, and waterproof bottom. Clean and washed.",
                "Travel Gear",
                "Good",
                "Room 212, 2nd Floor, Block A",
                today.minusDays(5),
                today.plusDays(60),
                BigDecimal.valueOf(3800.00)
        ));

        ItemListing speaker = itemListingRepository.save(new ItemListing(
                cauvery.getId(),
                prajwal.getId(),
                "[Sample] JBL Portable PA Speaker with Wireless Microphone",
                "Rechargeable battery speaker with bluetooth and VHF wireless handheld microphone. Useful for society meetings and hostel floor events.",
                "Event Equipment",
                "Good",
                "Room 304, 3rd Floor, Block A",
                today,
                today.plusDays(30),
                BigDecimal.valueOf(12500.00)
        ));

        // 4. Items in Green Glen Heights Apartment
        ItemListing wheelchair = itemListingRepository.save(new ItemListing(
                greenGlen.getId(),
                ananya.getId(),
                "[Sample] Foldable Adult Wheelchair with Removable Footrests",
                "Sturdy steel frame with padded vinyl upholstery and rear wheel brakes. Folds compactly for transport in car trunks. For recovery or visiting elderly relatives.",
                "Healthcare & Mobility",
                "Good",
                "Flat 402, Block B (Call before pickup)",
                today.minusDays(15),
                today.plusDays(180),
                BigDecimal.valueOf(6500.00)
        ));

        ItemListing bpMonitor = itemListingRepository.save(new ItemListing(
                greenGlen.getId(),
                ramesh.getId(),
                "[Sample] Omron Digital Blood Pressure Monitor with Medium Cuff",
                "Accurate upper arm blood pressure measurement device. Battery operated, easy one-touch start. Sanitized after every use.",
                "Healthcare & Mobility",
                "Like New",
                "Flat 105, Block A Ground Floor",
                today.minusDays(40),
                today.plusDays(180),
                BigDecimal.valueOf(2200.00)
        ));

        ItemListing ladder = itemListingRepository.save(new ItemListing(
                greenGlen.getId(),
                ramesh.getId(),
                "[Sample] 6-Step Heavy-Duty Aluminium Folding Ladder",
                "Anti-skid ribbed steps with safety top platform. Max load 150 kg. Lightweight and easy to carry for ceiling repairs and painting.",
                "Tools & Hardware",
                "Good",
                "Block A Basement Parking Bay 12",
                today.minusDays(10),
                today.plusDays(150),
                BigDecimal.valueOf(4200.00)
        ));

        ItemListing suitcase = itemListingRepository.save(new ItemListing(
                greenGlen.getId(),
                ananya.getId(),
                "[Sample] Large 28-inch Polycarbonate Hard Shell Spinner Suitcase",
                "TSA combination lock, 360-degree dual spinner wheels, expandable divider. Suitable for international relocation and long trips.",
                "Travel Gear",
                "Like New",
                "Flat 402, Block B",
                today.minusDays(5),
                today.plusDays(90),
                BigDecimal.valueOf(9000.00)
        ));

        // 5. Seed Borrow Requests & Handover Records demonstrating all workflows:

        // SCENARIO 1: Fulfilled Loan (Returned, Condition Logged, Avoided Expenditure Calculated)
        BorrowRequest req1 = new BorrowRequest(
                drill.getId(),
                cauvery.getId(),
                kasim.getId(),
                today.minusDays(10),
                today.minusDays(7),
                "Needed drill to mount wall organizer in hostel room"
        );
        req1.setStatus("RETURNED");
        req1.setCreatedAt(LocalDateTime.now().minusDays(12));
        req1 = borrowRequestRepository.save(req1);

        HandoverRecord hr1 = new HandoverRecord(req1.getId(), drill.getId(), today.minusDays(7));
        hr1.setHandedOverAt(LocalDateTime.now().minusDays(10));
        hr1.setInitialConditionNotes("Inspected chuck and 6 drill bits together in Room 304. Machine running smoothly.");
        hr1.setReturnedAt(LocalDateTime.now().minusDays(7));
        hr1.setReturnConditionNotes("Returned on time. Cleaned, all 6 bits present, motor tested.");
        hr1.setIssueReported(false);
        hr1.setConfirmedByOwner(true);
        hr1.setConfirmedByBorrower(true);
        handoverRecordRepository.save(hr1);

        // SCENARIO 2: Active Handed-Over Loan (Currently in progress)
        BorrowRequest req2 = new BorrowRequest(
                projector.getId(),
                cauvery.getId(),
                prajwal.getId(),
                today.minusDays(2),
                today.plusDays(3),
                "Mini project review presentation preparation"
        );
        req2.setStatus("ACTIVE");
        req2.setCreatedAt(LocalDateTime.now().minusDays(4));
        req2 = borrowRequestRepository.save(req2);

        HandoverRecord hr2 = new HandoverRecord(req2.getId(), projector.getId(), today.plusDays(3));
        hr2.setHandedOverAt(LocalDateTime.now().minusDays(2));
        hr2.setInitialConditionNotes("Tested projection with HDMI cord. Lamp output bright and clear. Remote working.");
        hr2.setConfirmedByOwner(true);
        hr2.setConfirmedByBorrower(true);
        handoverRecordRepository.save(hr2);

        // SCENARIO 3: Approved Confirmed Reservation (Demonstrating booked period on item)
        BorrowRequest req3 = new BorrowRequest(
                crutches.getId(),
                cauvery.getId(),
                kasim.getId(),
                today.plusDays(5),
                today.plusDays(12),
                "Ankle sprain rehabilitation support"
        );
        req3.setStatus("APPROVED");
        req3.setCreatedAt(LocalDateTime.now().minusDays(1));
        req3 = borrowRequestRepository.save(req3);

        HandoverRecord hr3 = new HandoverRecord(req3.getId(), crutches.getId(), today.plusDays(12));
        handoverRecordRepository.save(hr3);

        // SCENARIO 4: Conflicting Pending Request (Demonstrates warning for overlapping requested dates)
        // User Kasim requested speaker for upcoming weekend
        BorrowRequest req4 = new BorrowRequest(
                speaker.getId(),
                cauvery.getId(),
                kasim.getId(),
                today.plusDays(2),
                today.plusDays(4),
                "Floor sports celebration event"
        );
        req4.setStatus("PENDING");
        req4.setCreatedAt(LocalDateTime.now().minusHours(3));
        borrowRequestRepository.save(req4);

        // SCENARIO 5: Green Glen Apartment fulfilled borrowing
        BorrowRequest req5 = new BorrowRequest(
                wheelchair.getId(),
                greenGlen.getId(),
                ramesh.getId(),
                today.minusDays(14),
                today.minusDays(9),
                "Recovery support for visiting relative"
        );
        req5.setStatus("RETURNED");
        req5.setCreatedAt(LocalDateTime.now().minusDays(16));
        req5 = borrowRequestRepository.save(req5);

        HandoverRecord hr5 = new HandoverRecord(req5.getId(), wheelchair.getId(), today.minusDays(9));
        hr5.setHandedOverAt(LocalDateTime.now().minusDays(14));
        hr5.setInitialConditionNotes("Tires pumped, brakes engaging firmly, upholstery clean.");
        hr5.setReturnedAt(LocalDateTime.now().minusDays(9));
        hr5.setReturnConditionNotes("Returned in identical condition. Cleaned with sanitizer wipe.");
        hr5.setIssueReported(false);
        hr5.setConfirmedByOwner(true);
        hr5.setConfirmedByBorrower(true);
        handoverRecordRepository.save(hr5);

        // 6. Unmet Demand Requests (with deterministic normalization)
        unmetDemandRepository.save(new UnmetDemand(
                cauvery.getId(),
                kasim.getId(),
                "Healthcare & Mobility",
                "Adult Wheelchair (Foldable)",
                DemandService.normalizeItemName("Adult Wheelchair (Foldable)"),
                today.plusDays(3),
                today.plusDays(10),
                "Temporary mobility assistance for hostel ground floor transit."
        ));

        unmetDemandRepository.save(new UnmetDemand(
                cauvery.getId(),
                prajwal.getId(),
                "Healthcare & Mobility",
                "Foldable Wheelchair",
                DemandService.normalizeItemName("Foldable Wheelchair"),
                today.plusDays(5),
                today.plusDays(12),
                "Support needed for visiting parent."
        ));

        unmetDemandRepository.save(new UnmetDemand(
                cauvery.getId(),
                kasim.getId(),
                "Tools & Hardware",
                "Soldering Iron Station 60W",
                DemandService.normalizeItemName("Soldering Iron Station 60W"),
                today.plusDays(1),
                today.plusDays(3),
                "Hardware lab project circuit soldering."
        ));

        unmetDemandRepository.save(new UnmetDemand(
                greenGlen.getId(),
                ananya.getId(),
                "Healthcare & Mobility",
                "Digital Infant Weighing Scale",
                DemandService.normalizeItemName("Digital Infant Weighing Scale"),
                today.plusDays(2),
                today.plusDays(15),
                "Weekly infant checkup monitoring."
        ));

        unmetDemandRepository.save(new UnmetDemand(
                greenGlen.getId(),
                ramesh.getId(),
                "Tools & Hardware",
                "Car Battery Jump Starter Pack",
                DemandService.normalizeItemName("Car Battery Jump Starter Pack"),
                today,
                today.plusDays(2),
                "Car won't start in basement."
        ));

        // 7. Activity Logs
        activityLogRepository.save(new ActivityLog(
                cauvery.getId(),
                prajwal.getId(),
                "ITEM_LISTED",
                "Listed new item: [Sample] Bosch 13mm Impact Drill Kit"
        ));
        activityLogRepository.save(new ActivityLog(
                cauvery.getId(),
                kasim.getId(),
                "ITEM_RETURNED",
                "Item '[Sample] Bosch 13mm Impact Drill Kit' returned and confirmed."
        ));
        activityLogRepository.save(new ActivityLog(
                cauvery.getId(),
                prajwal.getId(),
                "ITEM_HANDED_OVER",
                "Handover completed for '[Sample] Epson Portable Full HD Projector'. Active loan started."
        ));
        activityLogRepository.save(new ActivityLog(
                cauvery.getId(),
                kasim.getId(),
                "REQUEST_APPROVED",
                "Reservation approved for '[Sample] Adjustable Aluminum Underarm Crutches'."
        ));
        activityLogRepository.save(new ActivityLog(
                cauvery.getId(),
                kasim.getId(),
                "DEMAND_REGISTERED",
                "New community demand logged in category: Healthcare & Mobility"
        ));

        System.out.println("OurThings sample community data successfully seeded!");
    }
}
