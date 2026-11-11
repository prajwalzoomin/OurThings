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
    private final ReviewRepository reviewRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AppNotificationRepository notificationRepository;

    public DataInitializer(CommunityRepository communityRepository,
                           UserRepository userRepository,
                           CommunityMembershipRepository membershipRepository,
                           ItemListingRepository itemListingRepository,
                           BorrowRequestRepository borrowRequestRepository,
                           HandoverRecordRepository handoverRecordRepository,
                           UnmetDemandRepository unmetDemandRepository,
                           ActivityLogRepository activityLogRepository,
                           ReviewRepository reviewRepository,
                           ChatMessageRepository chatMessageRepository,
                           AppNotificationRepository notificationRepository) {
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.itemListingRepository = itemListingRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.handoverRecordRepository = handoverRecordRepository;
        this.unmetDemandRepository = unmetDemandRepository;
        this.activityLogRepository = activityLogRepository;
        this.reviewRepository = reviewRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) {
        if (communityRepository.count() > 0) {
            backfillAddressesIfMissing();
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
        User prajwal = new User("Prajwal B (Hostel Resident)", "prajwal@ourthings.local", "+91 98450 12345", "Hostel Room 304", cauvery.getId(), "MEMBER");
        prajwal.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Prajwal");
        prajwal.setAddress("Room 304, Block A, Cauvery Hostel, NHCE Campus, Marathahalli");
        prajwal = userRepository.save(prajwal);

        User kasim = new User("Mohammed Kasim (Hostel Resident)", "kasim@ourthings.local", "+91 98450 67890", "Hostel Room 212", cauvery.getId(), "MEMBER");
        kasim.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Kasim");
        kasim.setAddress("Room 212, Block A, Cauvery Hostel, NHCE Campus, Marathahalli");
        kasim = userRepository.save(kasim);

        User ananya = new User("Ananya Rao (Apartment Resident)", "ananya@ourthings.local", "+91 98450 44556", "Flat 402, Block B", greenGlen.getId(), "MEMBER");
        ananya.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Ananya");
        ananya.setAddress("Flat 402, Block B, Green Glen Heights, Bellandur");
        ananya = userRepository.save(ananya);

        User ramesh = new User("Ramesh Kumar (Apartment Resident)", "ramesh@ourthings.local", "+91 98450 77889", "Flat 105, Block A", greenGlen.getId(), "MEMBER");
        ramesh.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Ramesh");
        ramesh.setAddress("Flat 105, Block A, Green Glen Heights, Bellandur");
        ramesh = userRepository.save(ramesh);

        User suresh = new User("Dr. Suresh Hegde (Neighbourhood Lead)", "suresh@ourthings.local", "+91 98450 99001", "#14, 2nd Cross", kaikondrahalli.getId(), "MEMBER");
        suresh.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Suresh");
        suresh.setAddress("#14, 2nd Cross, Sarjapur Road, Kaikondrahalli");
        suresh = userRepository.save(suresh);

        // Memberships
        membershipRepository.save(new CommunityMembership(prajwal.getId(), cauvery.getId()));
        membershipRepository.save(new CommunityMembership(kasim.getId(), cauvery.getId()));
        membershipRepository.save(new CommunityMembership(ananya.getId(), greenGlen.getId()));
        membershipRepository.save(new CommunityMembership(ramesh.getId(), greenGlen.getId()));
        membershipRepository.save(new CommunityMembership(suresh.getId(), kaikondrahalli.getId()));

        LocalDate today = LocalDate.now();

        // 3. Items in Cauvery Hostel
        ItemListing drill = new ItemListing(
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
        );
        drill.setPricingType("RENTAL");
        drill.setDailyRateInr(BigDecimal.valueOf(150.00));
        drill.setSecurityDepositInr(BigDecimal.valueOf(500.00));
        drill.setLatitude(12.9345);
        drill.setLongitude(77.6912);
        drill.setPremise("Room 304, 3rd Floor");
        drill.setBuilding("Cauvery Boys Hostel (Block A)");
        drill.setLandmark("Near NHCE Central Library");
        drill.setLocality("Marathahalli");
        drill.setCity("Bengaluru");
        drill.setPincode("560103");
        drill.setFormattedAddress("Room 304, Block A, Cauvery Hostel, NHCE Campus, Marathahalli, Bengaluru 560103");
        drill = itemListingRepository.save(drill);

        ItemListing crutches = new ItemListing(
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
        );
        crutches.setPricingType("FREE");
        crutches.setDailyRateInr(BigDecimal.ZERO);
        crutches.setSecurityDepositInr(BigDecimal.ZERO);
        crutches.setLatitude(12.9348);
        crutches.setLongitude(77.6915);
        crutches.setPremise("Room 304, 3rd Floor");
        crutches.setBuilding("Cauvery Boys Hostel (Block A)");
        crutches.setLandmark("Near NHCE Central Library");
        crutches.setLocality("Marathahalli");
        crutches.setCity("Bengaluru");
        crutches.setPincode("560103");
        crutches.setFormattedAddress("Room 304, Block A, Cauvery Hostel, NHCE Campus, Marathahalli, Bengaluru 560103");
        crutches = itemListingRepository.save(crutches);

        ItemListing projector = new ItemListing(
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
        );
        projector.setPricingType("RENTAL");
        projector.setDailyRateInr(BigDecimal.valueOf(350.00));
        projector.setSecurityDepositInr(BigDecimal.valueOf(1500.00));
        projector.setLatitude(12.9342);
        projector.setLongitude(77.6910);
        projector.setPremise("Room 212, 2nd Floor");
        projector.setBuilding("Cauvery Boys Hostel (Block A)");
        projector.setLandmark("Near NHCE Hostel Gate 2");
        projector.setLocality("Marathahalli");
        projector.setCity("Bengaluru");
        projector.setPincode("560103");
        projector.setFormattedAddress("Room 212, Block A, Cauvery Hostel, NHCE Campus, Marathahalli, Bengaluru 560103");
        // Kasim's projector is currently active on loan to Prajwal
        projector.setStatus("LENT");
        projector = itemListingRepository.save(projector);

        ItemListing rucksack = new ItemListing(
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
        );
        rucksack.setPricingType("RENTAL");
        rucksack.setDailyRateInr(BigDecimal.valueOf(100.00));
        rucksack.setSecurityDepositInr(BigDecimal.valueOf(500.00));
        rucksack.setLatitude(12.9342);
        rucksack.setLongitude(77.6910);
        rucksack.setPremise("Room 212, 2nd Floor");
        rucksack.setBuilding("Cauvery Boys Hostel (Block A)");
        rucksack.setLandmark("Near NHCE Hostel Gate 2");
        rucksack.setLocality("Marathahalli");
        rucksack.setCity("Bengaluru");
        rucksack.setPincode("560103");
        rucksack.setFormattedAddress("Room 212, Block A, Cauvery Hostel, NHCE Campus, Marathahalli, Bengaluru 560103");
        rucksack = itemListingRepository.save(rucksack);

        ItemListing speaker = new ItemListing(
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
        );
        speaker.setPricingType("RENTAL");
        speaker.setDailyRateInr(BigDecimal.valueOf(250.00));
        speaker.setSecurityDepositInr(BigDecimal.valueOf(1000.00));
        speaker.setLatitude(12.9345);
        speaker.setLongitude(77.6912);
        speaker.setPremise("Room 304, 3rd Floor");
        speaker.setBuilding("Cauvery Boys Hostel (Block A)");
        speaker.setLandmark("Near NHCE Central Library");
        speaker.setLocality("Marathahalli");
        speaker.setCity("Bengaluru");
        speaker.setPincode("560103");
        speaker.setFormattedAddress("Room 304, Block A, Cauvery Hostel, NHCE Campus, Marathahalli, Bengaluru 560103");
        speaker = itemListingRepository.save(speaker);

        // 4. Items in Green Glen Heights Apartment
        ItemListing wheelchair = new ItemListing(
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
        );
        wheelchair.setPricingType("FREE");
        wheelchair.setDailyRateInr(BigDecimal.ZERO);
        wheelchair.setSecurityDepositInr(BigDecimal.ZERO);
        wheelchair.setLatitude(12.9260);
        wheelchair.setLongitude(77.6762);
        wheelchair.setPremise("Flat 402, 4th Floor");
        wheelchair.setBuilding("Green Glen Heights (Block B)");
        wheelchair.setLandmark("Near Green Glen Park & Club House");
        wheelchair.setLocality("Bellandur");
        wheelchair.setCity("Bengaluru");
        wheelchair.setPincode("560103");
        wheelchair.setFormattedAddress("Flat 402, Block B, Green Glen Heights, Bellandur, Bengaluru 560103");
        wheelchair = itemListingRepository.save(wheelchair);

        ItemListing bpMonitor = new ItemListing(
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
        );
        bpMonitor.setLatitude(12.9262);
        bpMonitor.setLongitude(77.6760);
        bpMonitor.setPremise("Flat 105, Ground Floor");
        bpMonitor.setBuilding("Green Glen Heights (Block A)");
        bpMonitor.setLandmark("Near Main Security Gate");
        bpMonitor.setLocality("Bellandur");
        bpMonitor.setCity("Bengaluru");
        bpMonitor.setPincode("560103");
        bpMonitor.setFormattedAddress("Flat 105, Block A, Green Glen Heights, Bellandur, Bengaluru 560103");
        bpMonitor = itemListingRepository.save(bpMonitor);

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
        req1.setPricingType("RENTAL");
        req1.setDailyRateInr(BigDecimal.valueOf(150.00));
        req1.setRentalDays(4);
        req1.setRentalTotalInr(BigDecimal.valueOf(600.00));
        req1.setSecurityDepositInr(BigDecimal.valueOf(500.00));
        req1.setTotalEstimatedCostInr(BigDecimal.valueOf(1100.00));
        req1.setPaymentStatus("REFUNDED");
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
        req2.setPricingType("RENTAL");
        req2.setDailyRateInr(BigDecimal.valueOf(350.00));
        req2.setRentalDays(6);
        req2.setRentalTotalInr(BigDecimal.valueOf(2100.00));
        req2.setSecurityDepositInr(BigDecimal.valueOf(1500.00));
        req2.setTotalEstimatedCostInr(BigDecimal.valueOf(3600.00));
        req2.setPaymentStatus("DEPOSIT_HELD");
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
        req3.setPricingType("FREE");
        req3.setDailyRateInr(BigDecimal.ZERO);
        req3.setRentalDays(8);
        req3.setRentalTotalInr(BigDecimal.ZERO);
        req3.setSecurityDepositInr(BigDecimal.ZERO);
        req3.setTotalEstimatedCostInr(BigDecimal.ZERO);
        req3.setPaymentStatus("FREE");
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
        req4.setPricingType("RENTAL");
        req4.setDailyRateInr(BigDecimal.valueOf(250.00));
        req4.setRentalDays(3);
        req4.setRentalTotalInr(BigDecimal.valueOf(750.00));
        req4.setSecurityDepositInr(BigDecimal.valueOf(1000.00));
        req4.setTotalEstimatedCostInr(BigDecimal.valueOf(1750.00));
        req4.setPaymentStatus("DEPOSIT_PENDING");
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
        req5.setPricingType("FREE");
        req5.setDailyRateInr(BigDecimal.ZERO);
        req5.setRentalDays(6);
        req5.setRentalTotalInr(BigDecimal.ZERO);
        req5.setSecurityDepositInr(BigDecimal.ZERO);
        req5.setTotalEstimatedCostInr(BigDecimal.ZERO);
        req5.setPaymentStatus("FREE");
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

        // 8. Seed Verified Community Reviews
        reviewRepository.save(new Review(
                drill.getId(),
                req1.getId(),
                kasim.getId(),
                kasim.getName(),
                kasim.getAvatarUrl(),
                prajwal.getId(),
                5,
                "The drill kit was in perfect working order! All 6 masonry bits were included, and Prajwal handed it over right on time at Room 304.",
                "BORROWER_TO_OWNER"
        ));

        reviewRepository.save(new Review(
                wheelchair.getId(),
                req5.getId(),
                ramesh.getId(),
                ramesh.getName(),
                ramesh.getAvatarUrl(),
                ananya.getId(),
                5,
                "Great condition, thoroughly sanitized, and folded easily into our car trunk. Ananya was exceptionally helpful when my father visited.",
                "BORROWER_TO_OWNER"
        ));

        reviewRepository.save(new Review(
                crutches.getId(),
                req3.getId(),
                kasim.getId(),
                kasim.getName(),
                kasim.getAvatarUrl(),
                prajwal.getId(),
                5,
                "Lightweight, push-button adjustment was smooth, and arm pads were spotless. Saved me from buying a pair for a 1-week ankle sprain.",
                "BORROWER_TO_OWNER"
        ));

        // 9. Seed Direct Peer-to-Peer Messages
        chatMessageRepository.save(new ChatMessage(
                speaker.getId(),
                req4.getId(),
                kasim.getId(),
                kasim.getName(),
                kasim.getAvatarUrl(),
                prajwal.getId(),
                "Hi Prajwal! Is the JBL speaker's wireless mic battery charged? We need it for our hostel floor celebration."
        ));
        chatMessageRepository.save(new ChatMessage(
                speaker.getId(),
                req4.getId(),
                prajwal.getId(),
                prajwal.getName(),
                prajwal.getAvatarUrl(),
                kasim.getId(),
                "Hey Kasim! Yes, fully charged and I kept 2 spare Duracell AA batteries in the bag as well."
        ));

        // 10. Seed Notifications for Primary User
        notificationRepository.save(new AppNotification(
                prajwal.getId(),
                "New Borrow Request Received",
                "Mohammed Kasim requested to borrow your JBL Portable PA Speaker for 3 days.",
                "NEW_REQUEST",
                req4.getId(),
                "REQUEST"
        ));
        notificationRepository.save(new AppNotification(
                prajwal.getId(),
                "Active Loan Underway",
                "Handover completed for Epson Portable Full HD Projector with Kasim.",
                "HANDOVER_READY",
                req2.getId(),
                "REQUEST"
        ));

        System.out.println("OurThings sample community data successfully seeded!");
    }

    private void backfillAddressesIfMissing() {
        // Backfill users with avatars & addresses if missing
        for (var u : userRepository.findAll()) {
            boolean changed = false;
            if (u.getAvatarUrl() == null || u.getAvatarUrl().isBlank()) {
                u.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + u.getId() + "&backgroundColor=0f172a,1e293b,334155");
                changed = true;
            }
            if (u.getCity() == null || u.getCity().isBlank()) {
                u.setCity("Bengaluru");
                u.setPincode("560103");
                changed = true;
            }
            if (changed) {
                userRepository.save(u);
            }
        }

        // Backfill item listings with GPS coordinates and structured Indian addresses
        var items = itemListingRepository.findAll();
        for (var item : items) {
            if (item.getLatitude() == null) {
                if (item.getTitle().contains("Drill") || item.getTitle().contains("Speaker")) {
                    item.setLatitude(12.9345);
                    item.setLongitude(77.6912);
                    item.setPremise("Room 304, 3rd Floor");
                    item.setBuilding("Cauvery Boys Hostel (Block A)");
                    item.setLandmark("Near NHCE Central Library");
                    item.setLocality("Marathahalli");
                    item.setCity("Bengaluru");
                    item.setPincode("560103");
                    item.setFormattedAddress("Room 304, Block A, Cauvery Hostel, NHCE Campus, Marathahalli, Bengaluru 560103");
                } else if (item.getTitle().contains("Crutches") || item.getTitle().contains("Projector") || item.getTitle().contains("Rucksack")) {
                    item.setLatitude(12.9342);
                    item.setLongitude(77.6910);
                    item.setPremise("Room 212, 2nd Floor");
                    item.setBuilding("Cauvery Boys Hostel (Block A)");
                    item.setLandmark("Near NHCE Hostel Gate 2");
                    item.setLocality("Marathahalli");
                    item.setCity("Bengaluru");
                    item.setPincode("560103");
                    item.setFormattedAddress("Room 212, Block A, Cauvery Hostel, NHCE Campus, Marathahalli, Bengaluru 560103");
                } else if (item.getTitle().contains("Wheelchair")) {
                    item.setLatitude(12.9260);
                    item.setLongitude(77.6762);
                    item.setPremise("Flat 402, Block B");
                    item.setBuilding("Green Glen Heights");
                    item.setLandmark("Near Green Glen Park & Club House");
                    item.setLocality("Bellandur");
                    item.setCity("Bengaluru");
                    item.setPincode("560103");
                    item.setFormattedAddress("Flat 402, Block B, Green Glen Heights, Bellandur, Bengaluru 560103");
                } else if (item.getTitle().contains("Blood Pressure") || item.getTitle().contains("Monitor")) {
                    item.setLatitude(12.9255);
                    item.setLongitude(77.6758);
                    item.setPremise("Flat 105, Ground Floor");
                    item.setBuilding("Green Glen Heights (Block A)");
                    item.setLandmark("Opposite Sobha Iris Gate");
                    item.setLocality("Bellandur");
                    item.setCity("Bengaluru");
                    item.setPincode("560103");
                    item.setFormattedAddress("Flat 105, Block A, Green Glen Heights, Bellandur, Bengaluru 560103");
                } else {
                    item.setLatitude(12.9310);
                    item.setLongitude(77.6850);
                    item.setPremise("Near Main Gate");
                    item.setBuilding("Campus Wing");
                    item.setLandmark("Near Outer Ring Road");
                    item.setLocality("Marathahalli");
                    item.setCity("Bengaluru");
                    item.setPincode("560103");
                    item.setFormattedAddress("Campus Wing, Marathahalli, Bengaluru, Karnataka 560103");
                }
                itemListingRepository.save(item);
            }

            // Backfill pricing if missing
            if (item.getPricingType() == null || item.getPricingType().isBlank() || "FREE".equals(item.getPricingType())) {
                if (item.getTitle().contains("Drill")) {
                    item.setPricingType("RENTAL");
                    item.setDailyRateInr(BigDecimal.valueOf(150.00));
                    item.setSecurityDepositInr(BigDecimal.valueOf(500.00));
                    itemListingRepository.save(item);
                } else if (item.getTitle().contains("Projector")) {
                    item.setPricingType("RENTAL");
                    item.setDailyRateInr(BigDecimal.valueOf(350.00));
                    item.setSecurityDepositInr(BigDecimal.valueOf(1500.00));
                    itemListingRepository.save(item);
                } else if (item.getTitle().contains("Speaker")) {
                    item.setPricingType("RENTAL");
                    item.setDailyRateInr(BigDecimal.valueOf(250.00));
                    item.setSecurityDepositInr(BigDecimal.valueOf(1000.00));
                    itemListingRepository.save(item);
                } else if (item.getTitle().contains("Rucksack")) {
                    item.setPricingType("RENTAL");
                    item.setDailyRateInr(BigDecimal.valueOf(100.00));
                    item.setSecurityDepositInr(BigDecimal.valueOf(500.00));
                    itemListingRepository.save(item);
                }
            }
        }

        // Backfill reviews if none exist
        if (reviewRepository.count() == 0) {
            var allItems = itemListingRepository.findAll();
            var allUsers = userRepository.findAll();
            if (!allItems.isEmpty() && allUsers.size() >= 2) {
                var it1 = allItems.get(0);
                var u1 = allUsers.get(0);
                var u2 = allUsers.get(1);
                reviewRepository.save(new Review(it1.getId(), null, u2.getId(), u2.getName(), u2.getAvatarUrl(), u1.getId(), 5, "Excellent condition! Exactly as described, and pickup was smooth and easy.", "BORROWER_TO_OWNER"));
            }
        }
    }
}

