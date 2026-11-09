package com.ourthings;

import com.ourthings.dto.BorrowRequestDtos.CreateBorrowRequest;
import com.ourthings.dto.DemandDtos.AggregatedDemandDto;
import com.ourthings.dto.DemandDtos.CreateDemandRequest;
import com.ourthings.dto.ItemDtos.CreateUpdateItemRequest;
import com.ourthings.dto.ItemDtos.ItemResponseDto;
import com.ourthings.dto.HandoverDtos.RecordHandoverRequest;
import com.ourthings.dto.HandoverDtos.RecordReturnRequest;
import com.ourthings.dto.DashboardDtos.DashboardResponseDto;
import com.ourthings.model.Community;
import com.ourthings.model.ItemListing;
import com.ourthings.model.User;
import com.ourthings.repository.CommunityRepository;
import com.ourthings.repository.ItemListingRepository;
import com.ourthings.repository.UserRepository;
import com.ourthings.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1")
public class OurThingsApplicationTests {

    @Autowired
    private CommunityService communityService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private HandoverService handoverService;

    @Autowired
    private DemandService demandService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemListingRepository itemListingRepository;

    private Community testCommunity;
    private User testOwner;
    private User testBorrower1;
    private User testBorrower2;

    @BeforeEach
    public void setup() {
        String uid = UUID.randomUUID().toString().substring(0, 8);

        testCommunity = communityRepository.save(new Community(
                "Test Student Wing " + uid, "HOSTEL", "Hostel Test Wing", "Block T"
        ));

        testOwner = userRepository.save(new User(
                "Test Owner", "owner_" + uid + "@test.local", "+91 99999 11111", "Room 101", testCommunity.getId(), "MEMBER"
        ));

        testBorrower1 = userRepository.save(new User(
                "Test Borrower 1", "b1_" + uid + "@test.local", "+91 99999 22222", "Room 102", testCommunity.getId(), "MEMBER"
        ));

        testBorrower2 = userRepository.save(new User(
                "Test Borrower 2", "b2_" + uid + "@test.local", "+91 99999 33333", "Room 103", testCommunity.getId(), "MEMBER"
        ));
    }

    @Test
    @DisplayName("1. Item Creation, Scoping, and Retrieval")
    public void testItemCreationAndScoping() {
        LocalDate today = LocalDate.now();
        CreateUpdateItemRequest req = new CreateUpdateItemRequest();
        req.setTitle("DeWalt Cordless Screwdriver");
        req.setDescription("Compact 12V screwdriver with bit set");
        req.setCategory("Tools & Hardware");
        req.setItemCondition("Good");
        req.setPickupLocation("Room 101");
        req.setAvailableFrom(today);
        req.setAvailableTo(today.plusDays(30));
        req.setEstimatedReplacementValueInr(BigDecimal.valueOf(2500));

        ItemResponseDto item = itemService.createItem(testCommunity.getId(), testOwner.getId(), req);
        assertNotNull(item.getId());
        assertEquals("DeWalt Cordless Screwdriver", item.getTitle());
        assertEquals("AVAILABLE", item.getStatus());

        List<ItemResponseDto> communityItems = itemService.getItemsByCommunity(testCommunity.getId());
        assertTrue(communityItems.stream().anyMatch(i -> i.getId().equals(item.getId())));
    }

    @Test
    @DisplayName("2. Deterministic Booking Conflict Prevention")
    public void testBookingConflictPrevention() {
        LocalDate today = LocalDate.now();

        // 1. Create an item
        CreateUpdateItemRequest itemReq = new CreateUpdateItemRequest();
        itemReq.setTitle("Orthopedic Knee Brace");
        itemReq.setCategory("Healthcare & Mobility");
        itemReq.setItemCondition("Like New");
        itemReq.setPickupLocation("Room 101");
        itemReq.setAvailableFrom(today);
        itemReq.setAvailableTo(today.plusDays(60));
        itemReq.setEstimatedReplacementValueInr(BigDecimal.valueOf(1800));

        ItemResponseDto item = itemService.createItem(testCommunity.getId(), testOwner.getId(), itemReq);

        // 2. Borrower 1 submits request for day +5 to day +10
        CreateBorrowRequest b1Req = new CreateBorrowRequest();
        b1Req.setItemId(item.getId());
        b1Req.setStartDate(today.plusDays(5));
        b1Req.setEndDate(today.plusDays(10));
        b1Req.setBorrowPurpose("Ligament rehabilitation");

        var req1 = bookingService.submitRequest(testCommunity.getId(), testBorrower1.getId(), b1Req);
        assertEquals("PENDING", req1.getStatus());

        // 3. Owner approves Borrower 1 request -> Status APPROVED, locks dates
        var approved1 = bookingService.approveRequest(req1.getId(), testCommunity.getId(), testOwner.getId());
        assertEquals("APPROVED", approved1.getStatus());

        // 4. Borrower 2 attempts to request overlapping dates (day +8 to day +14)
        CreateBorrowRequest b2Req = new CreateBorrowRequest();
        b2Req.setItemId(item.getId());
        b2Req.setStartDate(today.plusDays(8));
        b2Req.setEndDate(today.plusDays(14));
        b2Req.setBorrowPurpose("Post-marathon recovery");

        // Server MUST deterministically reject overlapping request with IllegalStateException (409 Conflict)
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            bookingService.submitRequest(testCommunity.getId(), testBorrower2.getId(), b2Req);
        });

        assertTrue(exception.getMessage().contains("conflict"), "Error message must state scheduling conflict");
    }

    @Test
    @DisplayName("3. Handover and Return Workflow with Issue Reporting")
    public void testHandoverAndReturnWithIssue() {
        LocalDate today = LocalDate.now();

        CreateUpdateItemRequest itemReq = new CreateUpdateItemRequest();
        itemReq.setTitle("Audio Technica Studio Mic");
        itemReq.setCategory("Electronics");
        itemReq.setItemCondition("Like New");
        itemReq.setPickupLocation("Room 101");
        itemReq.setAvailableFrom(today);
        itemReq.setAvailableTo(today.plusDays(30));
        itemReq.setEstimatedReplacementValueInr(BigDecimal.valueOf(7500));

        ItemResponseDto item = itemService.createItem(testCommunity.getId(), testOwner.getId(), itemReq);

        CreateBorrowRequest bReq = new CreateBorrowRequest();
        bReq.setItemId(item.getId());
        bReq.setStartDate(today.plusDays(1));
        bReq.setEndDate(today.plusDays(3));
        bReq.setBorrowPurpose("College podcast recording");

        var req = bookingService.submitRequest(testCommunity.getId(), testBorrower1.getId(), bReq);
        bookingService.approveRequest(req.getId(), testCommunity.getId(), testOwner.getId());

        // Handover
        RecordHandoverRequest hReq = new RecordHandoverRequest();
        hReq.setInitialConditionNotes("Inspected mic capsule and XLR cable. Pristine condition.");
        hReq.setPlannedReturnDate(today.plusDays(3));

        var handover = handoverService.recordHandover(req.getId(), testCommunity.getId(), testOwner.getId(), hReq);
        assertNotNull(handover.getHandedOverAt());
        assertTrue(handover.getConfirmedByOwner());

        // Return with issue reported
        RecordReturnRequest rReq = new RecordReturnRequest();
        rReq.setReturnConditionNotes("Returned on time. Foam pop filter missing.");
        rReq.setIssueReported(true);
        rReq.setIssueDetails("Pop filter was lost during transport. Microphone electronics functional.");
        rReq.setConfirmedByOwner(true);
        rReq.setConfirmedByBorrower(true);

        var returnRecord = handoverService.recordReturn(req.getId(), testCommunity.getId(), testOwner.getId(), rReq);
        assertNotNull(returnRecord.getReturnedAt());
        assertTrue(returnRecord.getIssueReported());
        assertEquals("Pop filter was lost during transport. Microphone electronics functional.", returnRecord.getIssueDetails());

        // Verify request transitioned to RETURNED
        var closedReq = bookingService.getRequestById(req.getId(), testCommunity.getId());
        assertEquals("RETURNED", closedReq.getStatus());
    }

    @Test
    @DisplayName("4. Deterministic Demand Aggregation and Normalization")
    public void testDemandAggregation() {
        LocalDate today = LocalDate.now();

        CreateDemandRequest d1 = new CreateDemandRequest();
        d1.setCategory("Healthcare & Mobility");
        d1.setItemName("Adult Foldable Wheelchair!");
        d1.setNeededFrom(today.plusDays(2));
        d1.setNeededTo(today.plusDays(7));
        d1.setNotes("Private medical need");

        CreateDemandRequest d2 = new CreateDemandRequest();
        d2.setCategory("Healthcare & Mobility");
        d2.setItemName("adult   foldable wheelchair");
        d2.setNeededFrom(today.plusDays(5));
        d2.setNeededTo(today.plusDays(10));
        d2.setNotes("Private post-surgery requirement");

        demandService.submitDemand(testCommunity.getId(), testBorrower1.getId(), d1);
        demandService.submitDemand(testCommunity.getId(), testBorrower2.getId(), d2);

        List<AggregatedDemandDto> aggregated = demandService.getAggregatedDemands(testCommunity.getId());
        assertFalse(aggregated.isEmpty());

        AggregatedDemandDto wheelchairAgg = aggregated.stream()
                .filter(a -> "adult foldable wheelchair".equalsIgnoreCase(a.getNormalizedName()))
                .findFirst()
                .orElse(null);

        assertNotNull(wheelchairAgg);
        assertEquals(2L, wheelchairAgg.getDemandCount(), "Demands must be deterministically aggregated into 2 count");
    }

    @Test
    @DisplayName("5. Dashboard Metrics and Traceable Avoided Expenditure")
    public void testDashboardAvoidedExpenditure() {
        DashboardResponseDto dash = dashboardService.getCommunityDashboard(testCommunity.getId());
        assertNotNull(dash);
        assertNotNull(dash.getAvoidedExpenditureExplanation());
        assertTrue(dash.getAvoidedExpenditureExplanation().contains("Formula:"));
    }
}
