package com.ourthings.config;

import com.ourthings.model.*;
import com.ourthings.repository.*;
import com.ourthings.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
        boolean hasCauvery = communityRepository.findAll().stream()
                .anyMatch(c -> c.getName() != null && c.getName().toLowerCase().contains("cauvery"));

        // Reseed if database is empty, contains outdated "Cauvery" records, or has fewer than 10 unmet demands
        if (communityRepository.count() == 0 || hasCauvery || communityRepository.count() < 5 || itemListingRepository.count() < 75 || unmetDemandRepository.count() < 10) {
            System.out.println(">>> Initializing complete real-world demo dataset for OurThings (7 Communities, 79 Users, 85+ Items)...");
            reseedFullDemoData();
            System.out.println(">>> Real-world demo dataset seeded successfully!");
        } else {
            backfillAddressesIfMissing();
        }
    }

    private void reseedFullDemoData() {
        // 1. Clean out old data in strict foreign-key order
        try {
            activityLogRepository.deleteAll();
            reviewRepository.deleteAll();
            chatMessageRepository.deleteAll();
            notificationRepository.deleteAll();
            handoverRecordRepository.deleteAll();
            borrowRequestRepository.deleteAll();
            unmetDemandRepository.deleteAll();
            itemListingRepository.deleteAll();
            membershipRepository.deleteAll();
            userRepository.deleteAll();
            communityRepository.deleteAll();
        } catch (Exception e) {
            System.err.println("Warning during cleanup: " + e.getMessage());
        }

        // Default password for all demo accounts
        String demoPasswordHash = AuthService.hashPassword("Demo@1234");
        LocalDate today = LocalDate.now();

        // 2. Communities (7 real-world communities within 0 - 4.5 km of NHCE)
        Community cNhce = communityRepository.save(new Community(
                "New Horizon College of Engineering (NHCE Campus Circle)",
                "COLLEGE",
                "Campus sharing circle for students, researchers, and faculty across engineering departments and campus residences.",
                "NHCE Campus, Ring Road, Near Marathahalli, Bellandur, Bengaluru 560103"
        ));

        Community cGreenGlen = communityRepository.save(new Community(
                "Green Glen Layout & Heights",
                "APARTMENT",
                "Gated residential complex sharing infrequently needed domestic tools, mobility aids, and travel gear.",
                "Green Glen Layout, Bellandur, Bengaluru 560103"
        ));

        Community cPrestige = communityRepository.save(new Community(
                "Prestige Tech Enclave & Gear Road",
                "RESIDENTIAL",
                "Neighbourhood resource collective for tech professionals and families around Gear School Road and Doddakannelli.",
                "Gear School Road, Doddakannelli, Bengaluru 560035"
        ));

        Community cAdarsh = communityRepository.save(new Community(
                "Adarsh Palm Retreat Society",
                "GATED_COMMUNITY",
                "Villas and towers resource collective sharing power tools, party projectors, travel gear, and sports equipment.",
                "Outer Ring Road, Devarabisanahalli, Bellandur, Bengaluru 560103"
        ));

        Community cMarathahalli = communityRepository.save(new Community(
                "Marathahalli Silver Springs & Spice Garden",
                "NEIGHBOURHOOD",
                "Student and young professional neighbourhood circle sharing study materials, mobility equipment, and DIY gear.",
                "Spice Garden Layout, Marathahalli, Bengaluru 560037"
        ));

        Community cKaikondrahalli = communityRepository.save(new Community(
                "Kaikondrahalli Lake View Residents Circle",
                "NEIGHBOURHOOD",
                "Community resource collective for sustainable living, gardening, power tools, and community events around Kaikondrahalli Lake.",
                "Sarjapur Main Road, Kaikondrahalli, Bengaluru 560035"
        ));

        Community cPanathur = communityRepository.save(new Community(
                "Panathur Balagere Green Meadows",
                "APARTMENT",
                "Modern residential apartment community actively lending appliances, projectors, ladders, and automotive tools.",
                "Panathur Main Road, Near Embassy TechVillage, Bengaluru 560087"
        ));

        // 3. Seed Users per Community (11-12 accounts per community = 79 verified accounts)
        // --- Community 1: NHCE Campus (12 users) ---
        User uPrajwal = seedUser("Prajwal B", "prajwal@ourthings.local", "+91 98450 12345", "Room 304, Campus Hostel A", cNhce.getId(), "Room 304, Campus Hostel A, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 99);
        User uKasim = seedUser("Mohammed Kasim", "kasim@ourthings.local", "+91 98450 67890", "Room 212, Campus Hostel A", cNhce.getId(), "Room 212, Campus Hostel A, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 98);
        User uPriya = seedUser("Priya Sharma", "priya.sharma@ourthings.local", "+91 98450 11223", "Room 108, Campus Girls Hostel", cNhce.getId(), "Room 108, Campus Girls Hostel, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 97);
        User uRohan = seedUser("Rohan Verma", "rohan.verma@ourthings.local", "+91 98450 22334", "Room 415, Campus Hostel B", cNhce.getId(), "Room 415, Campus Hostel B, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 98);
        User uSneha = seedUser("Sneha Kulkarni", "sneha.k@ourthings.local", "+91 98450 33445", "Faculty Flat F-3", cNhce.getId(), "Faculty Flat F-3, Staff Quarters, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 99);
        User uArvind = seedUser("Dr. Arvind Swaminathan", "arvind.s@ourthings.local", "+91 98450 44556", "Staff Residence Q-12", cNhce.getId(), "Staff Residence Q-12, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 100);
        User uVikram = seedUser("Vikram Malhotra", "vikram.m@ourthings.local", "+91 98450 55667", "Room 205, Campus Hostel B", cNhce.getId(), "Room 205, Campus Hostel B, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 96);
        User uDeepa = seedUser("Deepa Iyer", "deepa.iyer@ourthings.local", "+91 98450 66778", "Room 310, Campus Girls Hostel", cNhce.getId(), "Room 310, Campus Girls Hostel, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 98);
        User uRahul = seedUser("Rahul Deshmukh", "rahul.d@ourthings.local", "+91 98450 77889", "Room 114, Campus Hostel A", cNhce.getId(), "Room 114, Campus Hostel A, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 97);
        User uTanvi = seedUser("Tanvi Joshi", "tanvi.j@ourthings.local", "+91 98450 88990", "Room 220, Campus Girls Hostel", cNhce.getId(), "Room 220, Campus Girls Hostel, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 96);
        User uKarthik = seedUser("Karthik Nair", "karthik.n@ourthings.local", "+91 98450 99001", "Room 402, Campus Hostel A", cNhce.getId(), "Room 402, Campus Hostel A, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 98);
        User uAnanyaD = seedUser("Ananya Deshpande", "ananya.d@ourthings.local", "+91 98450 10101", "Room 118, Campus Girls Hostel", cNhce.getId(), "Room 118, Campus Girls Hostel, NHCE Campus, Outer Ring Road, Bengaluru", demoPasswordHash, 99);

        // --- Community 2: Green Glen Layout & Heights (12 users) ---
        User uAnanyaRao = seedUser("Ananya Rao", "ananya.rao@ourthings.local", "+91 98451 12345", "Flat 402, Block B", cGreenGlen.getId(), "Flat 402, Block B, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 99);
        User uRamesh = seedUser("Ramesh Kumar", "ramesh.k@ourthings.local", "+91 98451 23456", "Flat 105, Block A", cGreenGlen.getId(), "Flat 105, Block A, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 98);
        User uSunita = seedUser("Sunita Hegde", "sunita.h@ourthings.local", "+91 98451 34567", "Flat 301, Block C", cGreenGlen.getId(), "Flat 301, Block C, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 97);
        User uRajesh = seedUser("Rajesh Patel", "rajesh.p@ourthings.local", "+91 98451 45678", "Flat 604, Block D", cGreenGlen.getId(), "Flat 604, Block D, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 96);
        User uMeera = seedUser("Meera Krishnan", "meera.k@ourthings.local", "+91 98451 56789", "Flat 202, Block B", cGreenGlen.getId(), "Flat 202, Block B, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 99);
        User uAmitav = seedUser("Amitav Ghosh", "amitav.g@ourthings.local", "+91 98451 67890", "Flat 503, Block A", cGreenGlen.getId(), "Flat 503, Block A, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 97);
        User uPooja = seedUser("Pooja Singhania", "pooja.s@ourthings.local", "+91 98451 78901", "Flat 702, Block C", cGreenGlen.getId(), "Flat 702, Block C, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 98);
        User uVivek = seedUser("Vivek Shenoy", "vivek.s@ourthings.local", "+91 98451 89012", "Flat 108, Block B", cGreenGlen.getId(), "Flat 108, Block B, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 96);
        User uRitu = seedUser("Ritu Bharadwaj", "ritu.b@ourthings.local", "+91 98451 90123", "Flat 405, Block D", cGreenGlen.getId(), "Flat 405, Block D, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 99);
        User uDeepak = seedUser("Deepak Choudhury", "deepak.c@ourthings.local", "+91 98451 01234", "Flat 303, Block A", cGreenGlen.getId(), "Flat 303, Block A, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 97);
        User uShalini = seedUser("Shalini Menon", "shalini.m@ourthings.local", "+91 98451 11223", "Flat 801, Block C", cGreenGlen.getId(), "Flat 801, Block C, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 98);
        User uHarish = seedUser("Harish Gowda", "harish.g@ourthings.local", "+91 98451 22334", "Flat 204, Block B", cGreenGlen.getId(), "Flat 204, Block B, Green Glen Heights, Bellandur, Bengaluru", demoPasswordHash, 96);

        // --- Community 3: Prestige Tech Enclave (11 users) ---
        User uNikhil = seedUser("Nikhil Kamath", "nikhil.k@ourthings.local", "+91 98452 12345", "Tower 3, Flat 902", cPrestige.getId(), "Tower 3, Flat 902, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 98);
        User uDivya = seedUser("Divya Nambiar", "divya.n@ourthings.local", "+91 98452 23456", "Tower 1, Flat 404", cPrestige.getId(), "Tower 1, Flat 404, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 99);
        User uSandeep = seedUser("Sandeep Reddy", "sandeep.r@ourthings.local", "+91 98452 34567", "Tower 2, Flat 1102", cPrestige.getId(), "Tower 2, Flat 1102, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 97);
        User uKavita = seedUser("Kavita Bansal", "kavita.b@ourthings.local", "+91 98452 45678", "Tower 4, Flat 301", cPrestige.getId(), "Tower 4, Flat 301, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 98);
        User uManish = seedUser("Manish Tiwari", "manish.t@ourthings.local", "+91 98452 56789", "Tower 1, Flat 803", cPrestige.getId(), "Tower 1, Flat 803, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 96);
        User uSwati = seedUser("Swati Agarwal", "swati.a@ourthings.local", "+91 98452 67890", "Tower 3, Flat 505", cPrestige.getId(), "Tower 3, Flat 505, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 99);
        User uPradeep = seedUser("Pradeep Saxena", "pradeep.s@ourthings.local", "+91 98452 78901", "Tower 2, Flat 204", cPrestige.getId(), "Tower 2, Flat 204, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 97);
        User uArchana = seedUser("Archana Pillai", "archana.p@ourthings.local", "+91 98452 89012", "Tower 4, Flat 602", cPrestige.getId(), "Tower 4, Flat 602, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 98);
        User uGaurav = seedUser("Gaurav Sen", "gaurav.s@ourthings.local", "+91 98452 90123", "Tower 1, Flat 1001", cPrestige.getId(), "Tower 1, Flat 1001, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 96);
        User uNeha = seedUser("Neha Chawla", "neha.c@ourthings.local", "+91 98452 01234", "Tower 3, Flat 703", cPrestige.getId(), "Tower 3, Flat 703, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 99);
        User uTarun = seedUser("Tarun Bhatt", "tarun.b@ourthings.local", "+91 98452 11223", "Tower 2, Flat 401", cPrestige.getId(), "Tower 2, Flat 401, Prestige Enclave, Gear School Road, Doddakannelli", demoPasswordHash, 97);

        // --- Community 4: Adarsh Palm Retreat (11 users) ---
        User uSiddharth = seedUser("Siddharth Roy", "siddharth.r@ourthings.local", "+91 98453 12345", "Villa 42, Palm Meadows", cAdarsh.getId(), "Villa 42, Palm Meadows, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 99);
        User uPreeti = seedUser("Preeti Narang", "preeti.n@ourthings.local", "+91 98453 23456", "Villa 88, Lake View", cAdarsh.getId(), "Villa 88, Lake View, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 98);
        User uAlok = seedUser("Alok Bhattacharya", "alok.b@ourthings.local", "+91 98453 34567", "Tower Jasmine, Flat 1201", cAdarsh.getId(), "Tower Jasmine, Flat 1201, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 97);
        User uShruti = seedUser("Shruti Venkatesh", "shruti.v@ourthings.local", "+91 98453 45678", "Villa 19, Boulevard", cAdarsh.getId(), "Villa 19, Boulevard, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 99);
        User uJayant = seedUser("Jayant Kashyap", "jayant.k@ourthings.local", "+91 98453 56789", "Tower Orchid, Flat 502", cAdarsh.getId(), "Tower Orchid, Flat 502, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 96);
        User uMalini = seedUser("Malini Sen", "malini.s@ourthings.local", "+91 98453 67890", "Villa 105, Avenue 3", cAdarsh.getId(), "Villa 105, Avenue 3, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 98);
        User uKunal = seedUser("Kunal Vohra", "kunal.v@ourthings.local", "+91 98453 78901", "Tower Lotus, Flat 804", cAdarsh.getId(), "Tower Lotus, Flat 804, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 97);
        User uGayatri = seedUser("Gayatri Namboodiri", "gayatri.n@ourthings.local", "+91 98453 89012", "Villa 63, Palm Grove", cAdarsh.getId(), "Villa 63, Palm Grove, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 98);
        User uSameer = seedUser("Sameer Merchant", "sameer.m@ourthings.local", "+91 98453 90123", "Tower Jasmine, Flat 303", cAdarsh.getId(), "Tower Jasmine, Flat 303, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 96);
        User uVarun = seedUser("Varun Kapoor", "varun.k@ourthings.local", "+91 98453 01234", "Villa 71, Phase 2", cAdarsh.getId(), "Villa 71, Phase 2, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 99);
        User uRashmi = seedUser("Rashmi Sundaram", "rashmi.s@ourthings.local", "+91 98453 11223", "Tower Orchid, Flat 901", cAdarsh.getId(), "Tower Orchid, Flat 901, Adarsh Palm Retreat, Devarabisanahalli, Bellandur", demoPasswordHash, 97);

        // --- Community 5: Marathahalli Silver Springs & Spice Garden (11 users) ---
        User uAbhinav = seedUser("Abhinav Shukla", "abhinav.s@ourthings.local", "+91 98454 12345", "House #45, 1st Cross", cMarathahalli.getId(), "#45, 1st Cross, Spice Garden Layout, Marathahalli, Bengaluru", demoPasswordHash, 98);
        User uNidhi = seedUser("Nidhi Jain", "nidhi.j@ourthings.local", "+91 98454 23456", "Flat 202, Silver Springs", cMarathahalli.getId(), "Flat 202, Silver Springs, Spice Garden, Marathahalli, Bengaluru", demoPasswordHash, 99);
        User uFarhan = seedUser("Farhan Qureshi", "farhan.q@ourthings.local", "+91 98454 34567", "#12, 3rd Main Road", cMarathahalli.getId(), "#12, 3rd Main Road, Near Kalamandir, Marathahalli, Bengaluru", demoPasswordHash, 97);
        User uPallavi = seedUser("Pallavi Joshi", "pallavi.j@ourthings.local", "+91 98454 45678", "Flat 101, Raghavendra Nilaya", cMarathahalli.getId(), "Flat 101, Raghavendra Nilaya, Spice Garden, Marathahalli, Bengaluru", demoPasswordHash, 98);
        User uChetan = seedUser("Chetan Anand", "chetan.a@ourthings.local", "+91 98454 56789", "House #88, Near Bridge", cMarathahalli.getId(), "#88, Near Marathahalli Multiplex & Bridge, Bengaluru", demoPasswordHash, 96);
        User uSmriti = seedUser("Smriti Saxena", "smriti.s@ourthings.local", "+91 98454 67890", "Flat 403, Sri Krishna Residency", cMarathahalli.getId(), "Flat 403, Sri Krishna Residency, Spice Garden, Marathahalli, Bengaluru", demoPasswordHash, 99);
        User uVignesh = seedUser("Vignesh Iyer", "vignesh.i@ourthings.local", "+91 98454 78901", "House #19, Anand Nagar", cMarathahalli.getId(), "#19, Anand Nagar Main Road, Marathahalli, Bengaluru", demoPasswordHash, 97);
        User uMonali = seedUser("Monali Roy", "monali.r@ourthings.local", "+91 98454 89012", "Flat 302, Green View Apts", cMarathahalli.getId(), "Flat 302, Green View Apts, Spice Garden, Marathahalli, Bengaluru", demoPasswordHash, 98);
        User uHemanth = seedUser("Hemanth Gowda", "hemanth.g@ourthings.local", "+91 98454 90123", "House #56, 4th Cross", cMarathahalli.getId(), "#56, 4th Cross, Spice Garden Layout, Marathahalli, Bengaluru", demoPasswordHash, 96);
        User uBhavana = seedUser("Bhavana Prasad", "bhavana.p@ourthings.local", "+91 98454 01234", "Flat 501, Sai Krupa Enclave", cMarathahalli.getId(), "Flat 501, Sai Krupa Enclave, Marathahalli, Bengaluru", demoPasswordHash, 99);
        User uRakesh = seedUser("Rakesh Menon", "rakesh.m@ourthings.local", "+91 98454 11223", "House #73, Ring Road Lane", cMarathahalli.getId(), "#73, Ring Road Lane, Marathahalli, Bengaluru", demoPasswordHash, 97);

        // --- Community 6: Kaikondrahalli Lake View (11 users) ---
        User uSuresh = seedUser("Dr. Suresh Hegde", "suresh.h@ourthings.local", "+91 98455 12345", "House #14, 2nd Cross", cKaikondrahalli.getId(), "#14, 2nd Cross, Kaikondrahalli Lake Road, Sarjapur Main Road, Bengaluru", demoPasswordHash, 100);
        User uLeela = seedUser("Leela Nambiar", "leela.n@ourthings.local", "+91 98455 23456", "House #8, Lakeview Crescent", cKaikondrahalli.getId(), "#8, Lakeview Crescent, Kaikondrahalli, Sarjapur Road, Bengaluru", demoPasswordHash, 98);
        User uJagdish = seedUser("Jagdish Prasad", "jagdish.p@ourthings.local", "+91 98455 34567", "House #27, 4th Main", cKaikondrahalli.getId(), "#27, 4th Main, Kaikondrahalli, Sarjapur Road, Bengaluru", demoPasswordHash, 97);
        User uMaya = seedUser("Maya Sreedhar", "maya.s@ourthings.local", "+91 98455 45678", "House #5, Lake Mist Lane", cKaikondrahalli.getId(), "#5, Lake Mist Lane, Kaikondrahalli, Sarjapur Road, Bengaluru", demoPasswordHash, 99);
        User uGirish = seedUser("Girish Kulkarni", "girish.k@ourthings.local", "+91 98455 56789", "House #92, Outer Enclave", cKaikondrahalli.getId(), "#92, Sarjapur Outer Enclave, Kaikondrahalli, Bengaluru", demoPasswordHash, 96);
        User uAnupama = seedUser("Anupama Varma", "anupama.v@ourthings.local", "+91 98455 67890", "House #18, 1st Cross", cKaikondrahalli.getId(), "#18, 1st Cross, Lake Road, Kaikondrahalli, Bengaluru", demoPasswordHash, 98);
        User uVenkat = seedUser("Venkat Ramani", "venkat.r@ourthings.local", "+91 98455 78901", "House #33, Main Road", cKaikondrahalli.getId(), "#33, Kaikondrahalli Main Road, Sarjapur Road, Bengaluru", demoPasswordHash, 97);
        User uUsha = seedUser("Usha Murthy", "usha.m@ourthings.local", "+91 98455 89012", "House #41, Lake Mist Lane", cKaikondrahalli.getId(), "#41, Lake Mist Lane, Kaikondrahalli, Bengaluru", demoPasswordHash, 99);
        User uBalaji = seedUser("Balaji Srinivasan", "balaji.s@ourthings.local", "+91 98455 90123", "House #67, Green Field Cross", cKaikondrahalli.getId(), "#67, Green Field Cross, Kaikondrahalli, Bengaluru", demoPasswordHash, 96);
        User uNalini = seedUser("Nalini Chari", "nalini.c@ourthings.local", "+91 98455 01234", "House #11, 3rd Main", cKaikondrahalli.getId(), "#11, 3rd Main, Kaikondrahalli, Bengaluru", demoPasswordHash, 98);
        User uArvindKR = seedUser("Arvind K. Rao", "arvind.kr@ourthings.local", "+91 98455 11223", "House #22, Lakeview Crescent", cKaikondrahalli.getId(), "#22, Lakeview Crescent, Kaikondrahalli, Bengaluru", demoPasswordHash, 97);

        // --- Community 7: Panathur Balagere Green Meadows (11 users) ---
        User uManoj = seedUser("Manoj Pillai", "manoj.p@ourthings.local", "+91 98456 12345", "Flat A-402, Green Meadows", cPanathur.getId(), "Flat A-402, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 98);
        User uShilpa = seedUser("Shilpa Rao", "shilpa.r@ourthings.local", "+91 98456 23456", "Flat B-703, Green Meadows", cPanathur.getId(), "Flat B-703, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 99);
        User uAshwin = seedUser("Ashwin Joseph", "ashwin.j@ourthings.local", "+91 98456 34567", "Flat C-201, Green Meadows", cPanathur.getId(), "Flat C-201, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 97);
        User uGeetika = seedUser("Geetika Singhal", "geetika.s@ourthings.local", "+91 98456 45678", "Flat A-904, Green Meadows", cPanathur.getId(), "Flat A-904, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 98);
        User uPraveen = seedUser("Praveen Nair", "praveen.n@ourthings.local", "+91 98456 56789", "Flat D-102, Green Meadows", cPanathur.getId(), "Flat D-102, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 96);
        User uMeenakshi = seedUser("Meenakshi Sundaram", "meenakshi.s@ourthings.local", "+91 98456 67890", "Flat B-505, Green Meadows", cPanathur.getId(), "Flat B-505, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 99);
        User uSanjay = seedUser("Sanjay Dutt Sharma", "sanjay.s@ourthings.local", "+91 98456 78901", "Flat C-802, Green Meadows", cPanathur.getId(), "Flat C-802, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 97);
        User uNandini = seedUser("Nandini Kamath", "nandini.k@ourthings.local", "+91 98456 89012", "Flat A-303, Green Meadows", cPanathur.getId(), "Flat A-303, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 98);
        User uRohit = seedUser("Rohit Khandelwal", "rohit.k@ourthings.local", "+91 98456 90123", "Flat D-604, Green Meadows", cPanathur.getId(), "Flat D-604, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 96);
        User uMadhavi = seedUser("Madhavi Reddy", "madhavi.r@ourthings.local", "+91 98456 01234", "Flat B-1101, Green Meadows", cPanathur.getId(), "Flat B-1101, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 99);
        User uSriram = seedUser("Sriram Subramanian", "sriram.s@ourthings.local", "+91 98456 11223", "Flat C-404, Green Meadows", cPanathur.getId(), "Flat C-404, Green Meadows, Panathur Main Road, Bengaluru", demoPasswordHash, 97);

        // 4. Products / Items across 7 Communities (50+ diverse, realistic items)
        List<ItemListing> items = new ArrayList<>();

        // === Community 1: NHCE Campus Items (10 items) ===
        ItemListing itDrill = seedItem(cNhce.getId(), uPrajwal.getId(),
                "Bosch 13mm Impact Drill Kit with Masonry Bits",
                "Complete electric drill kit with 13mm chuck, forward/reverse, chuck key, and 6-piece masonry drill bit set. Ideal for room shelves and wall mountings.",
                "Tools & Hardware", "Good", "Room 304, Campus Hostel A", "Campus Hostel A", "Near Central Library", "Marathahalli", "Bengaluru", "560103",
                12.9345, 77.6912, "RENTAL", 150.0, 500.0, 3499.0,
                "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itDrill);

        ItemListing itCrutches = seedItem(cNhce.getId(), uPrajwal.getId(),
                "Adjustable Aluminum Underarm Crutches (Adult Pair)",
                "Lightweight push-button adjustable crutches suited for heights 5'2\" to 6'0\". Padded arm rests and heavy-duty rubber tips. Thoroughly sanitized.",
                "Healthcare & Mobility", "Like New", "Room 304, Campus Hostel A", "Campus Hostel A", "Near Central Library", "Marathahalli", "Bengaluru", "560103",
                12.9348, 77.6915, "FREE", 0.0, 0.0, 1400.0,
                "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itCrutches);

        ItemListing itProjector = seedItem(cNhce.getId(), uKasim.getId(),
                "Epson Portable Full HD Projector with HDMI Cable",
                "3300 lumens brightness, HDMI and USB inputs, built-in speaker. Includes 5-meter HDMI cord and carrying case. Ideal for project presentations and club seminars.",
                "Electronics", "Good", "Room 212, Campus Hostel A", "Campus Hostel A", "Near Hostel Gate 2", "Marathahalli", "Bengaluru", "560103",
                12.9342, 77.6910, "RENTAL", 350.0, 1500.0, 28000.0,
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80", "LENT");
        items.add(itProjector);

        ItemListing itRucksack = seedItem(cNhce.getId(), uKasim.getId(),
                "Wildcraft 65L Trekking Rucksack with Rain Cover",
                "Ergonomic internal frame backpack with lumbar support, multiple compartments, and waterproof bottom. Clean and washed.",
                "Travel Gear", "Good", "Room 212, Campus Hostel A", "Campus Hostel A", "Near Hostel Gate 2", "Marathahalli", "Bengaluru", "560103",
                12.9342, 77.6910, "RENTAL", 100.0, 500.0, 3800.0,
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itRucksack);

        ItemListing itSpeaker = seedItem(cNhce.getId(), uPrajwal.getId(),
                "JBL Portable PA Speaker with Wireless Microphone",
                "Rechargeable battery speaker with bluetooth and VHF wireless handheld microphone. Useful for society meetings and campus events.",
                "Event Equipment", "Good", "Room 304, Campus Hostel A", "Campus Hostel A", "Near Central Library", "Marathahalli", "Bengaluru", "560103",
                12.9345, 77.6912, "RENTAL", 250.0, 1000.0, 12500.0,
                "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itSpeaker);

        ItemListing itDSLR = seedItem(cNhce.getId(), uRohan.getId(),
                "Canon EOS 1500D DSLR Camera with 18-55mm Kit",
                "24.1 MP APS-C sensor with EF-S 18-55mm IS II lens, battery charger, 64GB high speed SD card, and padded shoulder bag. Great for department fests and photo shoots.",
                "Electronics", "Like New", "Room 415, Campus Hostel B", "Campus Hostel B", "Mechanical Block", "Marathahalli", "Bengaluru", "560103",
                12.9338, 77.6918, "RENTAL", 400.0, 2000.0, 36000.0,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itDSLR);

        ItemListing itRobotics = seedItem(cNhce.getId(), uRahul.getId(),
                "Arduino Uno & Raspberry Pi IoT Robotics Learning Kit",
                "Complete starter kit with Arduino Uno R3, Raspberry Pi 4 4GB, motor drivers, ultrasonic sensors, jumper wires, breadboards, and servo motors.",
                "Electronics", "Like New", "Room 114, Campus Hostel A", "Campus Hostel A", "Robotics Club Lab", "Marathahalli", "Bengaluru", "560103",
                12.9335, 77.6925, "FREE", 0.0, 300.0, 8500.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itRobotics);

        ItemListing itCalc = seedItem(cNhce.getId(), uPriya.getId(),
                "Texas Instruments TI-84 Plus CE Color Graphing Calculator",
                "High-resolution backlit color display with rechargeable battery. Preloaded with math and engineering apps. Permitted in university entrance and engineering exams.",
                "Electronics", "Like New", "Room 108, Campus Girls Hostel", "Campus Girls Hostel", "Near Admission Office", "Marathahalli", "Bengaluru", "560103",
                12.9328, 77.6930, "RENTAL", 75.0, 500.0, 11500.0,
                "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itCalc);

        ItemListing itMic = seedItem(cNhce.getId(), uAnanyaD.getId(),
                "Blue Yeti USB Studio Condenser Microphone with Pop Filter",
                "Tri-capsule array for cardioid, omni, bidirectional pickup. Heavy desk stand and shock mount included. Perfect for podcasting, seminars, and club presentations.",
                "Electronics", "Good", "Room 118, Campus Girls Hostel", "Campus Girls Hostel", "Near Canteen", "Marathahalli", "Bengaluru", "560103",
                12.9330, 77.6922, "RENTAL", 200.0, 800.0, 9999.0,
                "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itMic);

        ItemListing itGuitar = seedItem(cNhce.getId(), uVikram.getId(),
                "Yamaha F280 Acoustic Guitar with Padded Gig Bag & Tuner",
                "Rich spruce top dreadnought guitar with new D'Addario phosphor bronze strings. Includes digital clip-on tuner, capo, and picks.",
                "Event Equipment", "Good", "Room 205, Campus Hostel B", "Campus Hostel B", "Near Basketball Court", "Marathahalli", "Bengaluru", "560103",
                12.9340, 77.6914, "RENTAL", 120.0, 600.0, 7500.0,
                "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itGuitar);

        ItemListing itDrone = seedItem(cNhce.getId(), uTanvi.getId(),
                "DJI Mini 3 Lightweight 4K HDR Camera Drone with Remote",
                "Under 249g ultralight drone with 4K HDR video, True Vertical Shooting for social feeds, 38-minute flight time, and spare intelligent battery. For campus events and video projects.",
                "Electronics", "Like New", "Room 220, Campus Girls Hostel", "Campus Girls Hostel", "Near Admission Office", "Marathahalli", "Bengaluru", "560103",
                12.9332, 77.6926, "RENTAL", 450.0, 2000.0, 48000.0,
                "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itDrone);

        ItemListing itMonitor = seedItem(cNhce.getId(), uSneha.getId(),
                "Dell 27-inch 4K UHD IPS Designer Monitor with USB-C Hub",
                "Color-accurate IPS panel with 99% sRGB, 65W USB-C power delivery, HDMI and DisplayPort inputs, and height-adjustable stand. Great for code reviews, editing, and dual-display setups.",
                "Electronics", "Like New", "Faculty Flat F-3", "Staff Quarters", "Outer Ring Road", "Marathahalli", "Bengaluru", "560103",
                12.9344, 77.6916, "RENTAL", 250.0, 1000.0, 29990.0,
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itMonitor);

        ItemListing itSoldering = seedItem(cNhce.getId(), uArvind.getId(),
                "60W Digital Soldering Station & SMD Hot Air Rework Kit",
                "Precision temperature control (200°C-480°C) with hot air rework gun, ESD-safe tweezers, desoldering pump, lead-free solder wire, and 5 interchangeable iron tips.",
                "Tools & Hardware", "Like New", "Staff Residence Q-12", "Campus Research Block", "Central Lab Wing", "Marathahalli", "Bengaluru", "560103",
                12.9338, 77.6920, "FREE", 0.0, 300.0, 5600.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itSoldering);

        ItemListing itScanner = seedItem(cNhce.getId(), uDeepa.getId(),
                "BenQ Professional 16MP Book & Document Overhead Scanner",
                "Fast overhead book scanner with flattening curve technology, auto-page turn detection, OCR text extraction, and foot pedal trigger. Scans bound textbooks in seconds.",
                "Electronics", "Like New", "Room 310, Campus Girls Hostel", "Campus Girls Hostel", "Near Central Library", "Marathahalli", "Bengaluru", "560103",
                12.9330, 77.6924, "RENTAL", 150.0, 600.0, 18500.0,
                "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itScanner);

        ItemListing itBicycle = seedItem(cNhce.getId(), uKarthik.getId(),
                "Decathlon Riverside 21-Speed Hybrid Commuter Bicycle",
                "Lightweight aluminum frame with Shimano 21-speed gears, front suspension fork, double-wall rims, LED safety lights, helmet, and heavy-duty U-lock.",
                "Travel Gear", "Good", "Room 402, Campus Hostel A", "Campus Hostel A", "Near Parking Stand", "Marathahalli", "Bengaluru", "560103",
                12.9342, 77.6911, "RENTAL", 100.0, 500.0, 14999.0,
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBicycle);

        // === Community 2: Green Glen Layout & Heights Items (8 items) ===
        ItemListing itWheelchair = seedItem(cGreenGlen.getId(), uAnanyaRao.getId(),
                "Foldable Adult Wheelchair with Removable Footrests",
                "Sturdy steel frame with padded vinyl upholstery and rear wheel brakes. Folds compactly for transport in car trunks. For recovery or visiting elderly relatives.",
                "Healthcare & Mobility", "Good", "Flat 402, Block B", "Green Glen Heights (Block B)", "Near Green Glen Park", "Bellandur", "Bengaluru", "560103",
                12.9260, 77.6762, "FREE", 0.0, 0.0, 6500.0,
                "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itWheelchair);

        ItemListing itBPMonitor = seedItem(cGreenGlen.getId(), uRamesh.getId(),
                "Omron Digital Blood Pressure Monitor with Medium Cuff",
                "Accurate upper arm blood pressure measurement device. Battery operated, easy one-touch start. Sanitized after every use.",
                "Healthcare & Mobility", "Like New", "Flat 105, Block A", "Green Glen Heights (Block A)", "Near Main Security Gate", "Bellandur", "Bengaluru", "560103",
                12.9262, 77.6760, "FREE", 0.0, 0.0, 2200.0,
                "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBPMonitor);

        ItemListing itLadder = seedItem(cGreenGlen.getId(), uRamesh.getId(),
                "6-Step Heavy-Duty Aluminium Folding Ladder",
                "Anti-skid ribbed steps with safety top platform. Max load 150 kg. Lightweight and easy to carry for ceiling repairs and painting.",
                "Tools & Hardware", "Good", "Basement Parking Bay 12", "Green Glen Heights (Block A)", "Near Main Security Gate", "Bellandur", "Bengaluru", "560103",
                12.9265, 77.6764, "FREE", 0.0, 0.0, 4200.0,
                "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itLadder);

        ItemListing itSuitcase = seedItem(cGreenGlen.getId(), uAnanyaRao.getId(),
                "Large 28-inch Polycarbonate Hard Shell Spinner Suitcase",
                "TSA combination lock, 360-degree dual spinner wheels, expandable divider. Suitable for international relocation and long trips.",
                "Travel Gear", "Like New", "Flat 402, Block B", "Green Glen Heights (Block B)", "Near Green Glen Park", "Bellandur", "Bengaluru", "560103",
                12.9260, 77.6762, "RENTAL", 120.0, 800.0, 5500.0,
                "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itSuitcase);

        ItemListing itTent = seedItem(cGreenGlen.getId(), uSunita.getId(),
                "Quechua 3-Person Waterproof Camping Tent with Carry Bag",
                "Fresh & Black patented fabric for heat insulation and blackout sleep. Wind resistant up to 50 km/h, waterproof PU coating. Includes ground pegs and poles.",
                "Travel Gear", "Good", "Flat 301, Block C", "Green Glen Heights (Block C)", "Clubhouse Wing", "Bellandur", "Bengaluru", "560103",
                12.9270, 77.6770, "RENTAL", 200.0, 1000.0, 4999.0,
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itTent);

        ItemListing itPressureWasher = seedItem(cGreenGlen.getId(), uRajesh.getId(),
                "Karcher K2 Universal High Pressure Washer (110 Bar)",
                "Compact pressure washer with 3m high-pressure hose, dirt blaster lance, and detergent suction tube. Excellent for car wash and terrace tile cleaning.",
                "Tools & Hardware", "Like New", "Flat 604, Block D", "Green Glen Heights (Block D)", "Near Swimming Pool", "Bellandur", "Bengaluru", "560103",
                12.9275, 77.6775, "RENTAL", 250.0, 1200.0, 7899.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itPressureWasher);

        ItemListing itDumbbells = seedItem(cGreenGlen.getId(), uAmitav.getId(),
                "Decathlon 20kg Adjustable Cast Iron Dumbbell Set in Case",
                "Threaded spinlock collars, 2x 2kg bars, 4x 2kg plates, 8x 1kg plates. Compact plastic storage case. Ideal for home workout regimes.",
                "Event Equipment", "Good", "Flat 503, Block A", "Green Glen Heights (Block A)", "Near Gym", "Bellandur", "Bengaluru", "560103",
                12.9263, 77.6761, "RENTAL", 100.0, 500.0, 4499.0,
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itDumbbells);

        ItemListing itAirFryer = seedItem(cGreenGlen.getId(), uMeera.getId(),
                "Philips Rapid Air Technology Air Fryer (4.1 Litre)",
                "Healthy frying with up to 90% less fat. Easy clean basket, analog temperature control, and quick timer. Perfect for festive family snack prep.",
                "Tools & Hardware", "Like New", "Flat 202, Block B", "Green Glen Heights (Block B)", "Near Green Glen Park", "Bellandur", "Bengaluru", "560103",
                12.9260, 77.6762, "RENTAL", 150.0, 800.0, 6999.0,
                "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itAirFryer);

        ItemListing itStroller = seedItem(cGreenGlen.getId(), uPooja.getId(),
                "Chicco Lightweight Foldable Baby Stroller & Buggy",
                "One-hand umbrella fold stroller with multi-position reclining seat, 5-point safety harness, expandable sun canopy, and bottom shopping basket. For visiting families and toddlers.",
                "Healthcare & Mobility", "Like New", "Flat 702, Block C", "Green Glen Heights (Block C)", "Clubhouse Wing", "Bellandur", "Bengaluru", "560103",
                12.9272, 77.6772, "RENTAL", 120.0, 500.0, 6990.0,
                "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itStroller);

        ItemListing itPS5 = seedItem(cGreenGlen.getId(), uVivek.getId(),
                "Sony PlayStation 5 Console with 2 DualSense Controllers & Games",
                "PS5 Disc Edition console with 2 wireless haptic controllers, HDMI 2.1 cable, and 4 top multiplayer games (FIFA 24, Spider-Man 2, Gran Turismo 7, Overcooked).",
                "Electronics", "Like New", "Flat 108, Block B", "Green Glen Heights (Block B)", "Near Green Glen Park", "Bellandur", "Bengaluru", "560103",
                12.9261, 77.6763, "RENTAL", 450.0, 2000.0, 54990.0,
                "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itPS5);

        ItemListing itSewing = seedItem(cGreenGlen.getId(), uRitu.getId(),
                "Usha Janome Wonder Stitch Automatic Zig-Zag Sewing Machine",
                "Compact free-arm sewing machine with 13 built-in stitch patterns, automatic needle threader, triple strength stitch, and accessories kit. For altering dresses and home fabrics.",
                "Tools & Hardware", "Good", "Flat 405, Block D", "Green Glen Heights (Block D)", "Near Swimming Pool", "Bellandur", "Bengaluru", "560103",
                12.9274, 77.6774, "RENTAL", 120.0, 500.0, 11500.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itSewing);

        ItemListing itDyson = seedItem(cGreenGlen.getId(), uDeepak.getId(),
                "Dyson V12 Detect Slim Cordless Stick Vacuum Cleaner",
                "Laser Slim Fluffy cleaner head reveals invisible dust. Hyperdymium motor, HEPA filtration, click-in battery, hair screw tool, and wall dock. Deep cleans floors and sofas.",
                "Tools & Hardware", "Like New", "Flat 303, Block A", "Green Glen Heights (Block A)", "Near Main Security Gate", "Bellandur", "Bengaluru", "560103",
                12.9264, 77.6765, "RENTAL", 280.0, 1200.0, 47900.0,
                "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itDyson);

        ItemListing itGuestBed = seedItem(cGreenGlen.getId(), uHarish.getId(),
                "Foldable Steel Rollaway Guest Bed with 4-inch Mattress",
                "Heavy-duty tubular steel frame with smooth caster wheels and high-resilience foam mattress. Easily unfolds for overnight guests and folds flat into wardrobes.",
                "Event Equipment", "Good", "Flat 204, Block B", "Green Glen Heights (Block B)", "Near Green Glen Park", "Bellandur", "Bengaluru", "560103",
                12.9262, 77.6761, "RENTAL", 150.0, 600.0, 6800.0,
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itGuestBed);

        // === Community 3: Prestige Tech Enclave Items (7 items) ===
        ItemListing itDewaltDrill = seedItem(cPrestige.getId(), uNikhil.getId(),
                "DeWalt 20V Max Cordless Hammer Drill & Driver Set",
                "Brushless motor with 2x 2.0Ah lithium ion batteries, high speed charger, belt clip, and tough storage case. Professional grade drill for heavy masonry.",
                "Tools & Hardware", "Like New", "Tower 3, Flat 902", "Prestige Tech Enclave (Tower 3)", "Gear School Road", "Doddakannelli", "Bengaluru", "560035",
                12.9205, 77.6980, "RENTAL", 250.0, 1500.0, 16500.0,
                "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itDewaltDrill);

        ItemListing itTelescope = seedItem(cPrestige.getId(), uDivya.getId(),
                "Celestron PowerSeeker 70AZ Refractor Telescope",
                "70mm aperture with 700mm focal length, pan handle alt-azimuth mount, 3x Barlow lens, and full height aluminum tripod. Great for moon and planet watching.",
                "Electronics", "Good", "Tower 1, Flat 404", "Prestige Tech Enclave (Tower 1)", "Near Gear Road Junction", "Doddakannelli", "Bengaluru", "560035",
                12.9210, 77.6975, "RENTAL", 300.0, 1200.0, 9500.0,
                "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itTelescope);

        ItemListing itBoardGames = seedItem(cPrestige.getId(), uSandeep.getId(),
                "Settlers of Catan & Ticket to Ride Board Games Bundle",
                "Complete base games with all resource cards, custom dice, colored train cars, and large maps. Clean cards with protective sleeves. Fun family evening bundle.",
                "Event Equipment", "Like New", "Tower 2, Flat 1102", "Prestige Tech Enclave (Tower 2)", "Near Central Park", "Doddakannelli", "Bengaluru", "560035",
                12.9208, 77.6982, "RENTAL", 150.0, 500.0, 6800.0,
                "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBoardGames);

        ItemListing itAirCast = seedItem(cPrestige.getId(), uKavita.getId(),
                "Aircast SP Walker Orthopedic Boot (Size Medium)",
                "Rigid semi-pneumatic shell with overlapping aircells for targeted pneumatic compression. Rocker sole preserves natural gait during ankle injury recovery.",
                "Healthcare & Mobility", "Like New", "Tower 4, Flat 301", "Prestige Tech Enclave (Tower 4)", "Clubhouse Gate", "Doddakannelli", "Bengaluru", "560035",
                12.9202, 77.6985, "FREE", 0.0, 0.0, 4800.0,
                "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itAirCast);

        ItemListing itBadminton = seedItem(cPrestige.getId(), uSwati.getId(),
                "Yonex Carbonex Badminton Kit (4 Rackets + Portable Net)",
                "Full graphite shaft rackets with high tension stringing, 6-pack Mavis 350 nylon shuttles, and easy pop-up 3-meter outdoor net.",
                "Event Equipment", "Good", "Tower 3, Flat 505", "Prestige Tech Enclave (Tower 3)", "Near Badminton Courts", "Doddakannelli", "Bengaluru", "560035",
                12.9205, 77.6980, "RENTAL", 120.0, 500.0, 5200.0,
                "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBadminton);

        ItemListing itCarStarter = seedItem(cPrestige.getId(), uManish.getId(),
                "12V Heavy Duty Car Jump Starter & Digital Tire Inflator",
                "1000A peak portable lithium battery jump starter pack for petrol/diesel engines with 150 PSI digital tire air compressor and bright LED emergency light.",
                "Tools & Hardware", "Like New", "Tower 1, Flat 803", "Prestige Tech Enclave (Tower 1)", "Near Gear Road Junction", "Doddakannelli", "Bengaluru", "560035",
                12.9210, 77.6975, "RENTAL", 200.0, 1000.0, 7200.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itCarStarter);

        ItemListing itKeyboard = seedItem(cPrestige.getId(), uGaurav.getId(),
                "Casio CT-S300 61-Key Touch Sensitive Portable Keyboard",
                "Pitch bend wheel, dance music mode, headphone jack, sustain pedal, and adjustable double-X keyboard stand. Great for kids practice and family gatherings.",
                "Event Equipment", "Good", "Tower 1, Flat 1001", "Prestige Tech Enclave (Tower 1)", "Near Gear Road Junction", "Doddakannelli", "Bengaluru", "560035",
                12.9210, 77.6975, "RENTAL", 200.0, 800.0, 10500.0,
                "https://images.unsplash.com/photo-1520523839898-507127054976?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itKeyboard);

        ItemListing itNebulizer = seedItem(cPrestige.getId(), uPradeep.getId(),
                "Philips Respironics Compressor Nebulizer with Dual Masks",
                "Fast, efficient aerosol medication delivery with SideStream technology. Includes both child and adult soft silicone masks, tubing, and carry case. Sanitized medical grade.",
                "Healthcare & Mobility", "Like New", "Tower 2, Flat 204", "Prestige Tech Enclave (Tower 2)", "Near Central Park", "Doddakannelli", "Bengaluru", "560035",
                12.9207, 77.6981, "FREE", 0.0, 0.0, 2400.0,
                "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itNebulizer);

        ItemListing itGoPro = seedItem(cPrestige.getId(), uArchana.getId(),
                "GoPro HERO12 Black Action Camera with Chest Strap & Mounts",
                "5.3K60 Ultra HD video, HyperSmooth 6.0 stabilization, HDR photo/video, 10m waterproof without housing, dual LCD screens, and Enduro battery with 128GB extreme SD card.",
                "Electronics", "Like New", "Tower 4, Flat 602", "Prestige Tech Enclave (Tower 4)", "Clubhouse Gate", "Doddakannelli", "Bengaluru", "560035",
                12.9203, 77.6984, "RENTAL", 320.0, 1500.0, 39990.0,
                "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itGoPro);

        ItemListing itGimbal = seedItem(cPrestige.getId(), uNeha.getId(),
                "DJI Ronin-SC 3-Axis Camera Gimbal Stabilizer",
                "Lightweight stabilizer designed for mirrorless cameras. ActiveTrack 3.0, 360-degree roll, automated panorama/timelapse, and quick-release plate. Perfect for smooth event video.",
                "Electronics", "Like New", "Tower 3, Flat 703", "Prestige Tech Enclave (Tower 3)", "Near Badminton Courts", "Doddakannelli", "Bengaluru", "560035",
                12.9206, 77.6979, "RENTAL", 300.0, 1200.0, 26900.0,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itGimbal);

        ItemListing itLevels = seedItem(cPrestige.getId(), uTarun.getId(),
                "Stanley FatMax 3-Piece Magnetic Spirit Level & Stud Finder Set",
                "Includes 24-inch and 48-inch heavy-duty box beam levels with amplified rare earth magnets, 9-inch torpedo level, and digital multi-surface stud finder for drywall.",
                "Tools & Hardware", "Good", "Tower 2, Flat 401", "Prestige Tech Enclave (Tower 2)", "Near Central Park", "Doddakannelli", "Bengaluru", "560035",
                12.9209, 77.6983, "FREE", 0.0, 200.0, 4200.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itLevels);

        ItemListing itIceCooler = seedItem(cPrestige.getId(), uSandeep.getId(),
                "Coleman 50L Heavy-Duty Wheeled Camping Ice Cooler Box",
                "Keeps ice frozen up to 5 days at 32°C. Heavy-duty all-terrain wheels, telescoping locking handle, leak-resistant drain channel, and molded cup holders on lid.",
                "Travel Gear", "Like New", "Tower 2, Flat 1102", "Prestige Tech Enclave (Tower 2)", "Near Central Park", "Doddakannelli", "Bengaluru", "560035",
                12.9208, 77.6982, "RENTAL", 120.0, 600.0, 6500.0,
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itIceCooler);

        // === Community 4: Adarsh Palm Retreat Items (7 items) ===
        ItemListing itProjectorScreen = seedItem(cAdarsh.getId(), uSiddharth.getId(),
                "100-Inch HD 16:9 Portable Tripod Projector Screen",
                "Wrinkle-free matte white screen with 1.1 gain, stable aluminum tripod stand, and nylon carrying bag. Ideal for lawn movie nights and birthday slides.",
                "Event Equipment", "Like New", "Villa 42, Palm Meadows", "Adarsh Palm Retreat (Villa 42)", "Boulevard Avenue", "Devarabisanahalli", "Bengaluru", "560103",
                12.9240, 77.6890, "RENTAL", 180.0, 800.0, 6500.0,
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itProjectorScreen);

        ItemListing itTrekPoles = seedItem(cAdarsh.getId(), uPreeti.getId(),
                "Forclaz Anti-Shock Carbon Fiber Trekking Poles (Pair)",
                "Quick-lock lever adjustment from 105cm to 135cm with ergonomic EVA grip and padded wrist strap. Includes rubber road tips and snow baskets.",
                "Travel Gear", "Like New", "Villa 88, Lake View", "Adarsh Palm Retreat (Villa 88)", "Lake Avenue", "Devarabisanahalli", "Bengaluru", "560103",
                12.9245, 77.6895, "RENTAL", 80.0, 400.0, 3200.0,
                "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itTrekPoles);

        ItemListing itSteamer = seedItem(cAdarsh.getId(), uMalini.getId(),
                "Agaro Handheld Garment Steamer (1200W)",
                "Continuous steam output with detachable 260ml water tank, ceramic soleplate, and fabric lint brush. Removes wrinkles from blazers and delicate sarees in minutes.",
                "Tools & Hardware", "Like New", "Villa 105, Avenue 3", "Adarsh Palm Retreat (Villa 105)", "Palm View Avenue", "Devarabisanahalli", "Bengaluru", "560103",
                12.9248, 77.6888, "RENTAL", 100.0, 500.0, 2999.0,
                "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itSteamer);

        ItemListing itSleepingBag = seedItem(cAdarsh.getId(), uVarun.getId(),
                "Forclaz -5°C Mummy Sleeping Bag with Compression Sack",
                "Warm synthetic hollow fiber filling with thermal draft collar and two-way zip. Machine washable and packs compactly into 12L volume.",
                "Travel Gear", "Like New", "Villa 71, Phase 2", "Adarsh Palm Retreat (Villa 71)", "Retreat Park Gate", "Devarabisanahalli", "Bengaluru", "560103",
                12.9238, 77.6885, "RENTAL", 150.0, 800.0, 4200.0,
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itSleepingBag);

        ItemListing itTennisRackets = seedItem(cAdarsh.getId(), uShruti.getId(),
                "Wilson US Open Tennis Racket Set with Can of 3 Balls",
                "AirLite alloy lightweight frame for effortless power and durability. 2 rackets with zipped head covers and new unopened Wilson tournament balls.",
                "Event Equipment", "Good", "Villa 19, Boulevard", "Adarsh Palm Retreat (Villa 19)", "Boulevard Avenue", "Devarabisanahalli", "Bengaluru", "560103",
                12.9242, 77.6892, "RENTAL", 150.0, 600.0, 5800.0,
                "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itTennisRackets);

        ItemListing itStanleyTools = seedItem(cAdarsh.getId(), uAlok.getId(),
                "Stanley 142-Piece Home & Auto Mechanic Tool Set",
                "Chrome vanadium steel sockets, ratchet handle, combination wrenches, precision screwdrivers, hex keys, and sturdy blow-molded case.",
                "Tools & Hardware", "Good", "Tower Jasmine, Flat 1201", "Adarsh Palm Retreat (Tower Jasmine)", "High Rise Cluster", "Devarabisanahalli", "Bengaluru", "560103",
                12.9246, 77.6898, "RENTAL", 200.0, 1000.0, 8900.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itStanleyTools);

        ItemListing itYogaKit = seedItem(cAdarsh.getId(), uPreeti.getId(),
                "Manduka PRO 6mm High Density Yoga Mat & Cork Blocks Set",
                "Superior joint cushioning and lifetime durability non-slip mat with 2 high density sustainable cork blocks and cotton stretching strap.",
                "Event Equipment", "Like New", "Villa 88, Lake View", "Adarsh Palm Retreat (Villa 88)", "Lake Avenue", "Devarabisanahalli", "Bengaluru", "560103",
                12.9245, 77.6895, "FREE", 0.0, 200.0, 7500.0,
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itYogaKit);

        ItemListing itPowerStation = seedItem(cAdarsh.getId(), uJayant.getId(),
                "EcoFlow River 2 Pro 768Wh Portable Power Station (800W AC)",
                "Fast 70-minute AC recharge, long-lasting LiFePO4 battery, 3x pure sine wave AC outlets, 100W USB-C, and solar charging input. Powers laptops, mini fridges, and CPAP machines.",
                "Electronics", "Like New", "Tower Orchid, Flat 502", "Adarsh Palm Retreat (Tower Orchid)", "Central Boulevard", "Devarabisanahalli", "Bengaluru", "560103",
                12.9247, 77.6894, "RENTAL", 500.0, 2500.0, 59999.0,
                "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itPowerStation);

        ItemListing itBoat = seedItem(cAdarsh.getId(), uKunal.getId(),
                "Intex Excursion 4-Person Heavy-Duty Inflatable Raft Boat",
                "Rugged vinyl construction with 3 air chambers, inflatable I-beam floor, 2 deluxe inflatable seats with backrests, 54-inch aluminum oars, and high-output manual pump.",
                "Travel Gear", "Good", "Tower Lotus, Flat 804", "Adarsh Palm Retreat (Tower Lotus)", "Near Tennis Courts", "Devarabisanahalli", "Bengaluru", "560103",
                12.9243, 77.6891, "RENTAL", 250.0, 1000.0, 12500.0,
                "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBoat);

        ItemListing itPartyLights = seedItem(cAdarsh.getId(), uGayatri.getId(),
                "Chauvet DJ GigBAR Party Stage Lighting System with Tripod",
                "4-in-1 portable lighting bar with 2 LED RGB derbies, 2 RGB PAR cans, 4 strobe lights, and laser. Includes wireless wireless foot switch, tripod stand, and carry bags.",
                "Event Equipment", "Like New", "Villa 63, Palm Grove", "Adarsh Palm Retreat (Villa 63)", "Palm Grove Lane", "Devarabisanahalli", "Bengaluru", "560103",
                12.9244, 77.6893, "RENTAL", 400.0, 1500.0, 34000.0,
                "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itPartyLights);

        ItemListing itCpap = seedItem(cAdarsh.getId(), uSameer.getId(),
                "ResMed AirSense 10 AutoSet CPAP Machine with Humidifier",
                "Whisper-quiet motor with integrated HumidAir heated humidifier, ClimateLineAir heated tube, and sanitized medium mask. Medical-grade sanitized after every borrow.",
                "Healthcare & Mobility", "Like New", "Tower Jasmine, Flat 303", "Adarsh Palm Retreat (Tower Jasmine)", "High Rise Cluster", "Devarabisanahalli", "Bengaluru", "560103",
                12.9246, 77.6897, "FREE", 0.0, 0.0, 48000.0,
                "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itCpap);

        ItemListing itHedgeTrimmer = seedItem(cAdarsh.getId(), uRashmi.getId(),
                "Black+Decker 20V Cordless Dual-Action Electric Hedge Trimmer",
                "22-inch laser cut dual-action steel blades cut branches with 40% less vibration. Wrap-around front handle with battery and fast charger included.",
                "Tools & Hardware", "Good", "Tower Orchid, Flat 901", "Adarsh Palm Retreat (Tower Orchid)", "Central Boulevard", "Devarabisanahalli", "Bengaluru", "560103",
                12.9248, 77.6896, "RENTAL", 140.0, 600.0, 6200.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itHedgeTrimmer);

        // === Community 5: Marathahalli Silver Springs Items (7 items) ===
        ItemListing itRingLight = seedItem(cMarathahalli.getId(), uNidhi.getId(),
                "Neewer 18-inch Bi-Color LED Ring Light Kit with 2m Stand",
                "Adjustable color temperature 3200K-5600K with rotating smartphone holder, hot shoe adapter, wireless shutter remote, and heavy duty light stand.",
                "Electronics", "Like New", "Flat 202, Silver Springs", "Silver Springs Apartments", "Spice Garden", "Marathahalli", "Bengaluru", "560037",
                12.9525, 77.7018, "RENTAL", 180.0, 800.0, 6900.0,
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itRingLight);

        ItemListing itLaserLevel = seedItem(cMarathahalli.getId(), uAbhinav.getId(),
                "Bosch Professional 50m Laser Distance Meter & Measure Tool",
                "Accurate measurement of distance, area, and volume with Bluetooth connectivity to export blueprints. Backlit display and shockproof rubber housing.",
                "Tools & Hardware", "Like New", "#45, 1st Cross", "Spice Garden Layout", "Near Spice Garden Bus Stop", "Marathahalli", "Bengaluru", "560037",
                12.9520, 77.7015, "RENTAL", 150.0, 600.0, 5200.0,
                "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itLaserLevel);

        ItemListing itSteamInhaler = seedItem(cMarathahalli.getId(), uSmriti.getId(),
                "3-in-1 Facial Steamer & Medical Vaporizer with Inhaler Mask",
                "Automatic power cut off, copper heating element, sanitized dual masks for nasal congestion and steam therapy. Helpful for monsoon colds.",
                "Healthcare & Mobility", "Like New", "Flat 403, Sri Krishna Residency", "Sri Krishna Residency", "Spice Garden", "Marathahalli", "Bengaluru", "560037",
                12.9522, 77.7012, "FREE", 0.0, 0.0, 850.0,
                "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itSteamInhaler);

        ItemListing itGasStove = seedItem(cMarathahalli.getId(), uFarhan.getId(),
                "Portable Single Burner Butane Camping Stove with Cookware",
                "Built-in piezo ignition system with safety gas shut-off mechanism, windshield ring, non-stick cooking pot, and compact plastic carry case.",
                "Travel Gear", "Good", "#12, 3rd Main Road", "Marathahalli 3rd Main", "Near Kalamandir", "Marathahalli", "Bengaluru", "560037",
                12.9515, 77.7025, "RENTAL", 100.0, 500.0, 3100.0,
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itGasStove);

        ItemListing itPulseOx = seedItem(cMarathahalli.getId(), uMonali.getId(),
                "Dr. Trust Fingertip Pulse Oximeter with OLED Display",
                "Instant SpO2, pulse rate, and perfusion index readout with audio alarm. Sanitized with alcohol wipes between every borrow.",
                "Healthcare & Mobility", "Like New", "Flat 302, Green View Apts", "Green View Apartments", "Spice Garden", "Marathahalli", "Bengaluru", "560037",
                12.9528, 77.7010, "FREE", 0.0, 0.0, 1500.0,
                "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itPulseOx);

        ItemListing itVacuum = seedItem(cMarathahalli.getId(), uChetan.getId(),
                "Black+Decker Dustbuster Cordless Handheld Vacuum (12V)",
                "Cyclonic action keeps the filter clean. Lightweight cordless convenience with pull-out crevice tool for couch cushions and car interior cleaning.",
                "Tools & Hardware", "Good", "#88, Near Multiplex", "Marathahalli Ring Road", "Near Marathahalli Bridge", "Marathahalli", "Bengaluru", "560037",
                12.9510, 77.7030, "RENTAL", 120.0, 500.0, 3999.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itVacuum);

        ItemListing itTableTennis = seedItem(cMarathahalli.getId(), uBhavana.getId(),
                "Retractable Table Tennis Net with 4 Bats & Balls Set",
                "Fits any table up to 5cm thick and 170cm wide in seconds. 4 ITTF regulation bats with flared handle and 8 orange 3-star ping pong balls.",
                "Event Equipment", "Like New", "Flat 501, Sai Krupa Enclave", "Sai Krupa Enclave", "Spice Garden", "Marathahalli", "Bengaluru", "560037",
                12.9526, 77.7020, "RENTAL", 80.0, 300.0, 2200.0,
                "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itTableTennis);

        ItemListing itCommode = seedItem(cMarathahalli.getId(), uPallavi.getId(),
                "Foldable Commode Toilet Chair with Padded Cushion & Bucket",
                "Corrosion-resistant steel frame with removable bucket, splash shield, and padded comfort seat. Folds completely flat for storage or travel. Sanitized medical aid.",
                "Healthcare & Mobility", "Like New", "Flat 101, Raghavendra Nilaya", "Raghavendra Nilaya", "Spice Garden", "Marathahalli", "Bengaluru", "560037",
                12.9521, 77.7014, "FREE", 0.0, 0.0, 2800.0,
                "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itCommode);

        ItemListing itMarshall = seedItem(cMarathahalli.getId(), uVignesh.getId(),
                "Marshall Kilburn II Portable Bluetooth Speaker with Strap",
                "Multi-directional 36W stereo sound with 20+ hours portable playtime. IPX2 water-resistant design, custom bass and treble analog knobs, and guitar-inspired carry strap.",
                "Event Equipment", "Like New", "#19, Anand Nagar", "Anand Nagar Main Road", "Near Marathahalli Market", "Marathahalli", "Bengaluru", "560037",
                12.9518, 77.7022, "RENTAL", 220.0, 800.0, 19999.0,
                "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itMarshall);

        ItemListing itTileCutter = seedItem(cMarathahalli.getId(), uHemanth.getId(),
                "Bosch GDC 120 Professional Marble, Tile & Granite Cutter",
                "Powerful 1200W motor with 110mm diamond blade, ergonomic grip, and adjustable base plate for angle cuts. For bathroom tiling and balcony renovations.",
                "Tools & Hardware", "Good", "#56, 4th Cross", "Spice Garden Layout", "Near Spice Garden Bus Stop", "Marathahalli", "Bengaluru", "560037",
                12.9523, 77.7016, "RENTAL", 160.0, 600.0, 4800.0,
                "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itTileCutter);

        ItemListing itGazebo = seedItem(cMarathahalli.getId(), uRakesh.getId(),
                "Cosco 10x10ft Waterproof Pop-Up Canopy Gazebo Tent",
                "Heavy-duty rust resistant powder-coated steel frame with 100% waterproof UV50+ canopy top, 4 sand weight bags, guy ropes, and wheeled roller bag.",
                "Event Equipment", "Like New", "#73, Ring Road Lane", "Spice Garden Layout", "Ring Road Lane", "Marathahalli", "Bengaluru", "560037",
                12.9512, 77.7028, "RENTAL", 300.0, 1200.0, 11800.0,
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itGazebo);

        ItemListing itOsprey = seedItem(cMarathahalli.getId(), uChetan.getId(),
                "Osprey Farpoint 40 Travel Backpack (Cabin Luggage Approved)",
                "LightWire frame suspension with breathable mesh backpanel, stowable harness, lockable main compartment, padded laptop/tablet sleeve, and external compression straps.",
                "Travel Gear", "Like New", "#88, Near Multiplex", "Marathahalli Ring Road", "Near Marathahalli Bridge", "Marathahalli", "Bengaluru", "560037",
                12.9510, 77.7030, "RENTAL", 120.0, 500.0, 11500.0,
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itOsprey);

        // === Community 6: Kaikondrahalli Lake View Items (6 items) ===
        ItemListing itLawnMower = seedItem(cKaikondrahalli.getId(), uSuresh.getId(),
                "Bosch ARM 32 Electric Lawn Mower & Grass Trimmer",
                "1200W Powerdrive motor, 32cm cutting diameter, 31-litre grass collection box, and 3-step axle height adjustment. Great for maintaining society gardens.",
                "Tools & Hardware", "Good", "#14, 2nd Cross", "Lake Road Residential Sector", "Near Kaikondrahalli Lake Park", "Kaikondrahalli", "Bengaluru", "560035",
                12.9142, 77.6785, "RENTAL", 250.0, 1500.0, 11500.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itLawnMower);

        ItemListing itTrolley = seedItem(cKaikondrahalli.getId(), uJagdish.getId(),
                "Heavy-Duty Foldable Platform Hand Truck (150kg Capacity)",
                "Non-slip vinyl deck surface with 4 smooth TPR swivel casters and foldable push handle. Essential for moving heavy cartons, plants, and appliances.",
                "Tools & Hardware", "Good", "#27, 4th Main", "Kaikondrahalli 4th Main", "Sarjapur Road Junction", "Kaikondrahalli", "Bengaluru", "560035",
                12.9148, 77.6790, "FREE", 0.0, 200.0, 3400.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itTrolley);

        ItemListing itPowerBank = seedItem(cKaikondrahalli.getId(), uMaya.getId(),
                "Anker 24,000mAh Power Bank (65W Power Delivery)",
                "Ultra-fast laptop and phone charging with digital smart screen showing battery percentage and wattage. Charges MacBook Pro and smartphones multiple times.",
                "Electronics", "Like New", "#5, Lake Mist Lane", "Lake Mist Lane", "Near Lake Promenade", "Kaikondrahalli", "Bengaluru", "560035",
                12.9140, 77.6782, "RENTAL", 100.0, 500.0, 6500.0,
                "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itPowerBank);

        ItemListing itDuffel = seedItem(cKaikondrahalli.getId(), uGirish.getId(),
                "Quechua 70L Heavy-Duty Water-Repellent Travel Duffel Bag",
                "Rugged coated canvas with hideaway ergonomic backpack straps, lockable zips, and compression webbing. Perfect for hiking expeditions and road trips.",
                "Travel Gear", "Good", "#92, Outer Enclave", "Sarjapur Outer Enclave", "Near Total Mall Old Location", "Kaikondrahalli", "Bengaluru", "560035",
                12.9150, 77.6795, "RENTAL", 90.0, 400.0, 3800.0,
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itDuffel);

        ItemListing itAudioMixer = seedItem(cKaikondrahalli.getId(), uVenkat.getId(),
                "Yamaha MG06X 6-Channel Analog Audio Mixer with Effects",
                "Studio grade D-PRE mic preamps, SPX digital multi-effects, balanced XLR outputs, and rugged metal chassis. For acoustic gigs, podcasts, and community festivals.",
                "Event Equipment", "Like New", "#33, Main Road", "Kaikondrahalli Main Road", "Near Kaikondrahalli Lake", "Kaikondrahalli", "Bengaluru", "560035",
                12.9145, 77.6788, "RENTAL", 300.0, 1500.0, 14200.0,
                "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itAudioMixer);

        ItemListing itGardeningSet = seedItem(cKaikondrahalli.getId(), uLeela.getId(),
                "Falcon Garden Tools Master Set (Pruner, Trowel, Rake, Gloves)",
                "High carbon steel bypass pruner shears, cast aluminum hand trowel, 5-tine cultivator rake, and puncture resistant rubber gardening gloves.",
                "Tools & Hardware", "Good", "#8, Lakeview Crescent", "Lakeview Crescent", "Near Kaikondrahalli Lake", "Kaikondrahalli", "Bengaluru", "560035",
                12.9138, 77.6780, "FREE", 0.0, 0.0, 2600.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itGardeningSet);

        ItemListing itWalker = seedItem(cKaikondrahalli.getId(), uAnupama.getId(),
                "Senior Folding Mobility Rollator Walker with Seat & Hand Brakes",
                "Lightweight aluminum walker with 8-inch smooth wheels, ergonomic hand loop-lock brakes, padded seat and backrest, and under-seat storage basket. Folds with one hand.",
                "Healthcare & Mobility", "Like New", "#18, 1st Cross", "Lake Road Residential Sector", "Near Kaikondrahalli Lake", "Kaikondrahalli", "Bengaluru", "560035",
                12.9141, 77.6784, "FREE", 0.0, 0.0, 5800.0,
                "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itWalker);

        ItemListing itBinoculars = seedItem(cKaikondrahalli.getId(), uUsha.getId(),
                "Nikon Monarch M5 8x42 Waterproof Bird Watching Binoculars",
                "Extra-low dispersion (ED) glass corrects chromatic aberrations, multilayer dielectric prism coatings, waterproof and fogproof O-ring sealed with turn-and-slide eyecups.",
                "Travel Gear", "Like New", "#41, Lake Mist Lane", "Lake Mist Lane", "Near Lake Promenade", "Kaikondrahalli", "Bengaluru", "560035",
                12.9139, 77.6781, "RENTAL", 180.0, 800.0, 24500.0,
                "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBinoculars);

        ItemListing itBBQ = seedItem(cKaikondrahalli.getId(), uBalaji.getId(),
                "Weber Go-Anywhere Portable Charcoal Barbecue Grill",
                "Porcelain-enameled bowl and lid retain heat, plated steel cooking grate, rust-resistant aluminum dampers, and pivoting plated steel legs that lock the lid for carrying.",
                "Event Equipment", "Good", "#67, Green Field Cross", "Green Field Cross", "Sarjapur Road Junction", "Kaikondrahalli", "Bengaluru", "560035",
                12.9146, 77.6789, "RENTAL", 180.0, 600.0, 8990.0,
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBBQ);

        ItemListing itFloodlights = seedItem(cKaikondrahalli.getId(), uNalini.getId(),
                "Havells 200W High-Lumen Outdoor Floodlight Twin Kit with Stands",
                "Two 100W waterproof IP65 LED floodlights mounted on heavy-duty telescoping steel tripod with 10m heavy gauge power cable. Bright illumination for night events.",
                "Event Equipment", "Like New", "#11, 3rd Main", "Kaikondrahalli 3rd Main", "Near Kaikondrahalli Lake", "Kaikondrahalli", "Bengaluru", "560035",
                12.9144, 77.6786, "RENTAL", 150.0, 600.0, 6800.0,
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itFloodlights);

        ItemListing itBrushcutter = seedItem(cKaikondrahalli.getId(), uArvindKR.getId(),
                "Stihl 2-Stroke Gas-Powered Garden Grass Trimmer & Brushcutter",
                "Lightweight grass trimmer with Easy2Start technology, TapAction bump feed dual line head, steel brushcutter blade, and padded shoulder harness. Cleans overgrown yards.",
                "Tools & Hardware", "Good", "#22, Lakeview Crescent", "Lakeview Crescent", "Near Lake Road", "Kaikondrahalli", "Bengaluru", "560035",
                12.9137, 77.6779, "RENTAL", 200.0, 1000.0, 16900.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBrushcutter);

        // === Community 7: Panathur Balagere Green Meadows Items (6 items) ===
        ItemListing itGarmin = seedItem(cPanathur.getId(), uManoj.getId(),
                "Garmin Forerunner 55 GPS Sports & Running Smartwatch",
                "Built-in GPS tracks where you run with precise pace and distance stats. Wrist-based heart rate monitor and up to 2 weeks battery life in smartwatch mode.",
                "Electronics", "Like New", "Flat A-402, Green Meadows", "Green Meadows (Tower A)", "Near Embassy TechVillage Backgate", "Panathur", "Bengaluru", "560087",
                12.9412, 77.7125, "RENTAL", 150.0, 800.0, 17990.0,
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itGarmin);

        ItemListing itColemanTent = seedItem(cPanathur.getId(), uAshwin.getId(),
                "Coleman Sundome 4-Person WeatherTec Camping Tent",
                "Snag-free, continuous pole sleeves for setup in under 10 minutes. WeatherTec system with patented welded floors and inverted seams to keep rain out.",
                "Travel Gear", "Like New", "Flat C-201, Green Meadows", "Green Meadows (Tower C)", "Near Balagere Circle", "Panathur", "Bengaluru", "560087",
                12.9415, 77.7128, "RENTAL", 250.0, 1200.0, 7500.0,
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itColemanTent);

        ItemListing itSpannerSet = seedItem(cPanathur.getId(), uPraveen.getId(),
                "Taparia Heavy Duty 12-Piece Combination Spanner Set (6-24mm)",
                "Drop forged from high grade chrome vanadium steel, heat treated to give maximum strength and wear resistance. Cleanly organized in branded roll-up pouch.",
                "Tools & Hardware", "Good", "Flat D-102, Green Meadows", "Green Meadows (Tower D)", "Near Parking Basement", "Panathur", "Bengaluru", "560087",
                12.9408, 77.7118, "FREE", 0.0, 100.0, 1950.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itSpannerSet);

        ItemListing itMultimeter = seedItem(cPanathur.getId(), uRohit.getId(),
                "Fluke 101 Pocket Digital Multimeter with Probes & Case",
                "Basic DC accuracy 0.5%, CAT III 600 V safety rated, diode and continuity test with buzzer. Rugged and reliable for all home electrical checks.",
                "Tools & Hardware", "Like New", "Flat D-604, Green Meadows", "Green Meadows (Tower D)", "Near Clubhouse", "Panathur", "Bengaluru", "560087",
                12.9410, 77.7120, "RENTAL", 90.0, 400.0, 3999.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itMultimeter);

        ItemListing itExtender = seedItem(cPanathur.getId(), uGeetika.getId(),
                "TP-Link RE305 AC1200 Dual-Band Wi-Fi Range Extender",
                "Brings Wi-Fi dead zones to life with strong Wi-Fi expansion at combined speed of up to 1.2Gbps. Intelligent signal indicator helps find the best location.",
                "Electronics", "Like New", "Flat A-904, Green Meadows", "Green Meadows (Tower A)", "Near Embassy TechVillage", "Panathur", "Bengaluru", "560087",
                12.9412, 77.7125, "RENTAL", 60.0, 300.0, 2299.0,
                "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itExtender);

        ItemListing itFoamRoller = seedItem(cPanathur.getId(), uShilpa.getId(),
                "Deep Tissue Grid Foam Roller & 5 Loop Resistance Bands Set",
                "High density EVA foam roller for myofascial release and muscle recovery, with 5 color-coded latex loop resistance bands (X-Light to X-Heavy).",
                "Event Equipment", "Like New", "Flat B-703, Green Meadows", "Green Meadows (Tower B)", "Near Gym Complex", "Panathur", "Bengaluru", "560087",
                12.9414, 77.7122, "FREE", 0.0, 0.0, 1800.0,
                "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itFoamRoller);

        ItemListing itBabyScale = seedItem(cPanathur.getId(), uMeenakshi.getId(),
                "Equinox Digital Weighing Scale with Infant Baby Curved Tray",
                "High precision load sensors with tare function, hold function, and detachable ergonomic curved infant tray. Measures infants up to 20kg and adults up to 150kg.",
                "Healthcare & Mobility", "Like New", "Flat B-505, Green Meadows", "Green Meadows (Tower B)", "Near Gym Complex", "Panathur", "Bengaluru", "560087",
                12.9413, 77.7124, "FREE", 0.0, 0.0, 2600.0,
                "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBabyScale);

        ItemListing itCompressor = seedItem(cPanathur.getId(), uSanjay.getId(),
                "Xiaomi Mi Portable Electric Air Compressor 2 (150 PSI)",
                "Digital tire pressure detection with auto shut-off, high-precision cylinder block inflates car and bicycle tires in minutes. Built-in LED light and 6 preset inflation modes.",
                "Tools & Hardware", "Like New", "Flat C-802, Green Meadows", "Green Meadows (Tower C)", "Near Balagere Circle", "Panathur", "Bengaluru", "560087",
                12.9416, 77.7129, "RENTAL", 90.0, 400.0, 3999.0,
                "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itCompressor);

        ItemListing itPackingCubes = seedItem(cPanathur.getId(), uNandini.getId(),
                "Samsonite 4-Piece Compression Packing Cubes & Luggage Scale",
                "Ultralight water-resistant ripstop nylon with dual zipper compression system and backlit digital electronic luggage hanging scale (up to 50kg) to avoid airport excess baggage fees.",
                "Travel Gear", "Like New", "Flat A-303, Green Meadows", "Green Meadows (Tower A)", "Near Embassy TechVillage", "Panathur", "Bengaluru", "560087",
                12.9411, 77.7123, "FREE", 0.0, 100.0, 3200.0,
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itPackingCubes);

        ItemListing itStudioLight = seedItem(cPanathur.getId(), uMadhavi.getId(),
                "Godox SL60W 5600K Continuous Studio LED Light with Softbox",
                "High CRI 95+ 60W LED video light with Bowens mount, 60cm octabox softbox with diffuser, 2m light stand, and wireless remote control. For crisp product video and live streaming.",
                "Electronics", "Like New", "Flat B-1101, Green Meadows", "Green Meadows (Tower B)", "Near Gym Complex", "Panathur", "Bengaluru", "560087",
                12.9415, 77.7126, "RENTAL", 250.0, 1000.0, 13900.0,
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itStudioLight);

        ItemListing itBench = seedItem(cPanathur.getId(), uSriram.getId(),
                "Domyos Foldable Multi-Position Incline / Decline Weight Bench",
                "Supports up to 220kg with 4 backrest incline angles and 2 seat positions. High density foam padding with sweat-resistant vinyl upholstery. Folds compact in 30 seconds.",
                "Event Equipment", "Good", "Flat C-404, Green Meadows", "Green Meadows (Tower C)", "Near Balagere Circle", "Panathur", "Bengaluru", "560087",
                12.9413, 77.7121, "RENTAL", 120.0, 500.0, 6999.0,
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80", "AVAILABLE");
        items.add(itBench);

        // 5. Seed Realistic Borrow Requests, Handover Records, and Verified Reviews
        // Scenario A: Active Loan in NHCE Campus (Projector lent from Kasim to Prajwal)
        BorrowRequest brActive = new BorrowRequest(
                itProjector.getId(), cNhce.getId(), uPrajwal.getId(),
                today.minusDays(1), today.plusDays(3), "Societal Project Presentation & Demo Preparation"
        );
        brActive.setPricingType("RENTAL");
        brActive.setDailyRateInr(BigDecimal.valueOf(350.00));
        brActive.setRentalDays(4);
        brActive.setRentalTotalInr(BigDecimal.valueOf(1400.00));
        brActive.setSecurityDepositInr(BigDecimal.valueOf(1500.00));
        brActive.setTotalEstimatedCostInr(BigDecimal.valueOf(2900.00));
        brActive.setPaymentStatus("DEPOSIT_HELD");
        brActive.setStatus("ACTIVE");
        brActive.setCreatedAt(LocalDateTime.now().minusDays(2));
        brActive = borrowRequestRepository.save(brActive);

        HandoverRecord hrActive = new HandoverRecord(brActive.getId(), itProjector.getId(), today.plusDays(3));
        hrActive.setHandedOverAt(LocalDateTime.now().minusDays(1));
        hrActive.setInitialConditionNotes("Item handed over in excellent working condition with 5m HDMI cord and power brick.");
        hrActive.setDepositRefunded(false);
        handoverRecordRepository.save(hrActive);

        // Scenario B: Completed Past Loan with 5-Star Review (Drill lent from Prajwal to Kasim)
        BorrowRequest brCompleted = new BorrowRequest(
                itDrill.getId(), cNhce.getId(), uKasim.getId(),
                today.minusDays(12), today.minusDays(10), "Mounting study bookshelf in hostel room"
        );
        brCompleted.setPricingType("RENTAL");
        brCompleted.setDailyRateInr(BigDecimal.valueOf(150.00));
        brCompleted.setRentalDays(2);
        brCompleted.setRentalTotalInr(BigDecimal.valueOf(300.00));
        brCompleted.setSecurityDepositInr(BigDecimal.valueOf(500.00));
        brCompleted.setTotalEstimatedCostInr(BigDecimal.valueOf(800.00));
        brCompleted.setPaymentStatus("PAID");
        brCompleted.setStatus("RETURNED");
        brCompleted.setCreatedAt(LocalDateTime.now().minusDays(14));
        brCompleted = borrowRequestRepository.save(brCompleted);

        HandoverRecord hrCompleted = new HandoverRecord(brCompleted.getId(), itDrill.getId(), today.minusDays(10));
        hrCompleted.setHandedOverAt(LocalDateTime.now().minusDays(12));
        hrCompleted.setInitialConditionNotes("Drill clean with complete masonry bit set.");
        hrCompleted.setReturnedAt(LocalDateTime.now().minusDays(10));
        hrCompleted.setReturnConditionNotes("Returned promptly in perfect condition, all bits verified.");
        hrCompleted.setDepositRefunded(true);
        handoverRecordRepository.save(hrCompleted);

        reviewRepository.save(new Review(
                itDrill.getId(), brCompleted.getId(), uKasim.getId(), uKasim.getName(), uKasim.getAvatarUrl(),
                uPrajwal.getId(), 5,
                "Drill kit was in top-notch shape and Prajwal even included wall plugs. Super smooth handover!",
                "BORROWER_TO_OWNER"
        ));

        // Scenario C: Approved upcoming reservation for Crutches
        BorrowRequest brApproved = new BorrowRequest(
                itCrutches.getId(), cNhce.getId(), uRohan.getId(),
                today.plusDays(1), today.plusDays(7), "Post-sprain knee support during campus lab sessions"
        );
        brApproved.setPricingType("FREE");
        brApproved.setDailyRateInr(BigDecimal.ZERO);
        brApproved.setRentalDays(6);
        brApproved.setRentalTotalInr(BigDecimal.ZERO);
        brApproved.setSecurityDepositInr(BigDecimal.ZERO);
        brApproved.setTotalEstimatedCostInr(BigDecimal.ZERO);
        brApproved.setPaymentStatus("FREE");
        brApproved.setStatus("APPROVED");
        brApproved.setCreatedAt(LocalDateTime.now().minusDays(1));
        borrowRequestRepository.save(brApproved);

        // Scenario D: Completed loan in Green Glen with review
        BorrowRequest brGreenGlen = new BorrowRequest(
                itWheelchair.getId(), cGreenGlen.getId(), uRamesh.getId(),
                today.minusDays(20), today.minusDays(14), "Support for visiting elderly relative"
        );
        brGreenGlen.setPricingType("FREE");
        brGreenGlen.setDailyRateInr(BigDecimal.ZERO);
        brGreenGlen.setRentalDays(6);
        brGreenGlen.setRentalTotalInr(BigDecimal.ZERO);
        brGreenGlen.setSecurityDepositInr(BigDecimal.ZERO);
        brGreenGlen.setTotalEstimatedCostInr(BigDecimal.ZERO);
        brGreenGlen.setPaymentStatus("FREE");
        brGreenGlen.setStatus("RETURNED");
        brGreenGlen.setCreatedAt(LocalDateTime.now().minusDays(22));
        brGreenGlen = borrowRequestRepository.save(brGreenGlen);

        reviewRepository.save(new Review(
                itWheelchair.getId(), brGreenGlen.getId(), uRamesh.getId(), uRamesh.getName(), uRamesh.getAvatarUrl(),
                uAnanyaRao.getId(), 5,
                "The wheelchair was exceptionally clean, sturdy, and comfortable. Huge blessing for our family!",
                "BORROWER_TO_OWNER"
        ));

        // 6. Seed Realistic Unmet Demand Requests across demo communities and accounts
        // Community 1: NHCE Campus
        seedDemand(cNhce.getId(), uSneha.getId(), "Healthcare & Mobility",
                "Foldable Lightweight Wheelchair", "Foldable Wheelchair",
                today.plusDays(2), today.plusDays(10), "Needed for visiting grandparents during engineering convocation ceremony.");

        seedDemand(cNhce.getId(), uRohan.getId(), "Tools & Hardware",
                "Soldering Iron Station with Desoldering Pump", "Soldering Iron Kit",
                today.plusDays(1), today.plusDays(4), "Urgent for mini-project hardware circuit prototyping.");

        seedDemand(cNhce.getId(), uPrajwal.getId(), "Electronics",
                "High-Speed USB-C Gigabit Ethernet Hub & Multiport Adapter", "USB-C Multiport Hub",
                today.plusDays(1), today.plusDays(5), "Needed for lab evaluation and local network debugging.");

        seedDemand(cNhce.getId(), uKasim.getId(), "Event Equipment",
                "Wireless Dual Handheld Microphone Set with Receiver", "Wireless Microphones",
                today.plusDays(3), today.plusDays(5), "Needed for department student club orientation ceremony.");

        seedDemand(cNhce.getId(), uPriya.getId(), "Travel Gear",
                "Waterproof 2-Person Trekking Tent & Sleeping Bag", "Camping Tent",
                today.plusDays(6), today.plusDays(8), "Weekend hiking trip to Savandurga.");

        // Community 2: Green Glen Layout & Heights
        seedDemand(cGreenGlen.getId(), uRajesh.getId(), "Tools & Hardware",
                "High-Pressure Drain Snake / Pipe Unblocker", "Drain Pipe Cleaner",
                today.plusDays(1), today.plusDays(3), "For balcony rainwater drain clearing before heavy rains.");

        seedDemand(cGreenGlen.getId(), uAnanyaRao.getId(), "Healthcare & Mobility",
                "Blood Glucose Monitor Kit with Fresh Lancets", "Glucometer",
                today.plusDays(1), today.plusDays(7), "Temporary health check for elderly parents visiting for 1 week.");

        seedDemand(cGreenGlen.getId(), uRamesh.getId(), "Tools & Hardware",
                "Heavy-Duty Cordless Rotary Hammer Drill (SDS Plus)", "Hammer Drill",
                today.plusDays(2), today.plusDays(4), "Installing heavy balcony safety mesh and planter wall brackets.");

        // Community 3: Prestige Tech Enclave
        seedDemand(cPrestige.getId(), uKavita.getId(), "Travel Gear",
                "Dual-Suspension 26-inch Mountain Bike for Weekend Trail", "Mountain Bicycle",
                today.plusDays(4), today.plusDays(6), "For Saturday Sarjapur cycle track ride.");

        seedDemand(cPrestige.getId(), uNikhil.getId(), "Electronics",
                "4K HDMI Capture Card for Live Streaming", "HDMI Video Capture Card",
                today.plusDays(1), today.plusDays(3), "Community tech talk presentation recording.");

        // Community 4: Adarsh Palm Retreat
        seedDemand(cAdarsh.getId(), uMalini.getId(), "Event Equipment",
                "Outdoor Lawn Gazebo / Canopy Tent (10x10ft)", "Pop-up Canopy Tent",
                today.plusDays(5), today.plusDays(7), "Children's birthday garden tea party.");

        seedDemand(cAdarsh.getId(), uSiddharth.getId(), "Tools & Hardware",
                "Electric Lawn Grass Trimmer & Edge Cutter", "Lawn Trimmer",
                today.plusDays(1), today.plusDays(2), "Weekend garden trimming and maintenance.");

        // Community 5: Marathahalli Silver Springs
        seedDemand(cMarathahalli.getId(), uAbhinav.getId(), "Electronics",
                "Portable Document & Book Scanner (A4 Overhead)", "Document Scanner",
                today.plusDays(2), today.plusDays(5), "Digitizing college lecture notes and semester reference books.");

        // Community 6: Kaikondrahalli Lake View
        seedDemand(cKaikondrahalli.getId(), uSuresh.getId(), "Healthcare & Mobility",
                "Lightweight Aluminum Rollator Walker with Seat and Hand Brakes", "Rollator Walker",
                today.plusDays(2), today.plusDays(14), "Post-knee surgery rehab walking assistance.");

        // Community 7: Panathur Balagere Green Meadows
        seedDemand(cPanathur.getId(), uManoj.getId(), "Tools & Hardware",
                "Automotive 12V Digital Car Tyre Inflator & Jump Starter", "Car Tyre Inflator",
                today.plusDays(1), today.plusDays(3), "Preparing for family long-distance road trip.");
    }

    private User seedUser(String name, String email, String phone, String roomOrFlat, Long communityId, String fullAddress, String passwordHash, int trustScore) {
        User u = new User(name, email, phone, roomOrFlat, communityId, "MEMBER");
        u.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + name.replaceAll("[^a-zA-Z0-9]", ""));
        u.setAddress(fullAddress);
        u.setCity("Bengaluru");
        u.setPincode("560103");
        u.setPasswordHash(passwordHash);
        u.setTrustScorePercent(trustScore);
        u.setIsIdVerified(true);
        u.setBadges("VERIFIED_RESIDENT");
        u = userRepository.save(u);
        membershipRepository.save(new CommunityMembership(u.getId(), communityId));
        return u;
    }

    private ItemListing seedItem(Long communityId, Long ownerId, String title, String description,
                                 String category, String condition, String premise, String building,
                                 String landmark, String locality, String city, String pincode,
                                 double lat, double lng, String pricingType, double dailyRate,
                                 double deposit, double repValue, String imageUrl, String status) {
        LocalDate today = LocalDate.now();
        ItemListing it = new ItemListing(
                communityId, ownerId, title, description, category, condition,
                premise + ", " + building,
                today.minusDays(15), today.plusDays(180),
                BigDecimal.valueOf(repValue)
        );
        it.setPremise(premise);
        it.setBuilding(building);
        it.setLandmark(landmark);
        it.setLocality(locality);
        it.setCity(city);
        it.setPincode(pincode);
        it.setFormattedAddress(premise + ", " + building + ", " + locality + ", " + city + " " + pincode);
        it.setLatitude(lat);
        it.setLongitude(lng);
        it.setPricingType(pricingType);
        it.setDailyRateInr(BigDecimal.valueOf(dailyRate));
        it.setSecurityDepositInr(BigDecimal.valueOf(deposit));
        it.setImageUrl(imageUrl);
        it.setStatus(status != null ? status : "AVAILABLE");
        return itemListingRepository.save(it);
    }

    private void seedDemand(Long communityId, Long requesterId, String category, String itemName,
                            String normName, LocalDate from, LocalDate to, String notes) {
        UnmetDemand d = new UnmetDemand();
        d.setCommunityId(communityId);
        d.setRequesterId(requesterId);
        d.setCategory(category);
        d.setItemName(itemName);
        d.setNormalizedName(normName);
        d.setNeededFrom(from);
        d.setNeededTo(to);
        d.setNotes(notes);
        d.setStatus("OPEN");
        unmetDemandRepository.save(d);
    }

    private void backfillAddressesIfMissing() {
        var users = userRepository.findAll();
        for (var u : users) {
            boolean changed = false;
            if (u.getPasswordHash() == null || u.getPasswordHash().isEmpty()) {
                u.setPasswordHash(AuthService.hashPassword("Demo@1234"));
                changed = true;
            }
            if (u.getAvatarUrl() == null || u.getAvatarUrl().isBlank()) {
                u.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + u.getId());
                changed = true;
            }
            if (changed) {
                userRepository.save(u);
            }
        }
    }
}
