# Cannabis Booking Management - Testing Strategy

## Testing Framework Overview

The cannabis booking management system requires comprehensive testing across multiple domains: business logic, cannabis compliance, real-time tracking, microservices communication, and user experience validation.

### Testing Architecture

```typescript
interface TestingArchitecture {
  // Unit Testing
  unitTests: {
    framework: "Jest + TypeScript";
    coverage: "90%+ requirement";
    mockStrategy: "dependency_injection";
    testDataStrategy: "authentic_data_factories";
  };

  // Integration Testing
  integrationTests: {
    framework: "Jest + Supertest";
    microservicesTests: "Docker Compose";
    databaseTests: "TestContainers";
    eventBusTests: "Redis Test Instance";
  };

  // End-to-End Testing
  e2eTests: {
    framework: "Playwright";
    browsers: ["Chrome", "Firefox", "Safari", "Mobile"];
    scenarios: "cannabis_industry_workflows";
    dataManagement: "test_database_per_scenario";
  };

  // Cannabis Compliance Testing
  complianceTests: {
    framework: "Custom Compliance Engine";
    stateRegulations: "all_operational_states";
    regulatoryScenarios: "automated_validation";
    auditTrailVerification: "comprehensive_logging";
  };

  // Performance Testing
  performanceTests: {
    framework: "Artillery + K6";
    loadTesting: "realistic_cannabis_workloads";
    stressTesting: "peak_booking_periods";
    enduranceTests: "24_hour_continuous_operation";
  };
}
```

## Unit Testing Strategy

### Cannabis Business Logic Testing

```typescript
// tests/unit/services/CannabisBookingService.test.ts
describe("CannabisBookingService", () => {
  let service: CannabisBookingService;
  let mockComplianceChecker: jest.Mocked<ComplianceChecker>;
  let mockStateRegulationEngine: jest.Mocked<StateRegulationEngine>;
  let mockEventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(() => {
    mockComplianceChecker = createMockComplianceChecker();
    mockStateRegulationEngine = createMockStateRegulationEngine();
    mockEventPublisher = createMockEventPublisher();

    service = new CannabisBookingService(
      mockEventPublisher,
      mockComplianceChecker,
      mockStateRegulationEngine,
    );
  });

  describe("createCannabisBooking", () => {
    it("should create booking with valid california cannabis license", async () => {
      // Arrange
      const request = createCannabisBookingRequest({
        state: "california",
        cannabisBookingType: "product_demo",
        cannabisLicenseId: "ca-license-123e4567-e89b-12d3-a456-426614174000",
        cannabisProducts: [
          createCannabisProductRequest({
            productId: "prod-123e4567-e89b-12d3-a456-426614174001",
            category: "flower",
            thcPercentage: 22.5,
            usagePurpose: "display_only",
          }),
        ],
      });

      mockComplianceChecker.checkBookingCompliance.mockResolvedValue(
        createCompliantResult({
          state: "california",
          licenseValid: true,
          productApproved: true,
        }),
      );

      // Act
      const result = await service.createCannabisBooking(request);

      // Assert
      expect(result.booking.id).toMatch(UUID_REGEX);
      expect(result.booking.cannabisBookingType).toBe("product_demo");
      expect(result.booking.state).toBe("california");
      expect(result.booking.stateComplianceStatus).toBe("pending");
      expect(result.complianceStatus.isCompliant).toBe(true);

      expect(mockEventPublisher.publishBookingCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: result.booking.id,
          cannabisBookingType: "product_demo",
        }),
      );
    });

    it("should reject booking with expired cannabis license", async () => {
      // Arrange
      const request = createCannabisBookingRequest({
        state: "colorado",
        cannabisLicenseId: "co-license-expired-123",
      });

      mockComplianceChecker.checkBookingCompliance.mockResolvedValue(
        createNonCompliantResult({
          violations: ["Cannabis license expired on 2025-05-01"],
        }),
      );

      // Act & Assert
      await expect(service.createCannabisBooking(request)).rejects.toThrow(
        ComplianceError,
      );

      expect(mockEventPublisher.publishBookingCreated).not.toHaveBeenCalled();
    });

    it("should validate THC limits for recreational events", async () => {
      // Arrange
      const request = createCannabisBookingRequest({
        state: "washington",
        cannabisBookingType: "private_party",
        consumptionAllowed: true,
        cannabisProducts: [
          createCannabisProductRequest({
            category: "edibles",
            thcPercentage: 15.0, // Above WA recreational limit
            usagePurpose: "sampling",
          }),
        ],
      });

      mockStateRegulationEngine.getThcLimits.mockResolvedValue({
        recreational: { edibles: 10.0 },
        medical: { edibles: 100.0 },
      });

      // Act & Assert
      await expect(service.createCannabisBooking(request)).rejects.toThrow(
        "THC percentage exceeds state limits for recreational use",
      );
    });
  });

  describe("updateBookingStatus", () => {
    it("should transition from requested to under_review with compliance check", async () => {
      // Arrange
      const booking = createCannabisBooking({
        status: "requested",
        stage: "stage_1_request",
      });

      jest.spyOn(service, "getBookingById").mockResolvedValue(booking);
      mockComplianceChecker.scheduleCheck.mockResolvedValue(undefined);

      // Act
      const result = await service.updateBookingStatus(
        booking.id,
        "under_review",
        "stage_2_review",
        "admin-user-123",
      );

      // Assert
      expect(result.status).toBe("under_review");
      expect(result.stage).toBe("stage_2_review");
      expect(result.auditTrail).toHaveLength(2); // Original + status update
      expect(result.auditTrail[1].action).toBe("status_updated");

      expect(mockEventPublisher.publishStatusChanged).toHaveBeenCalledWith(
        result,
        "requested",
        "under_review",
        "stage_1_request",
        "stage_2_review",
        "admin-user-123",
      );
    });
  });
});
```

### Real-time Tracking Testing

```typescript
// tests/unit/services/RealTimeTrackingService.test.ts
describe("RealTimeTrackingService", () => {
  let service: RealTimeTrackingService;
  let mockGPSVerification: jest.Mocked<GPSVerificationService>;
  let mockWebSocketManager: jest.Mocked<WebSocketManager>;

  describe("processStaffCheckIn", () => {
    it("should verify GPS location within acceptable range", async () => {
      // Arrange
      const booking = createCannabisBooking({
        locationId: "location-123",
        state: "oregon",
      });

      const checkInRequest = createStaffCheckInRequest({
        bookingId: booking.id,
        gpsCoordinates: {
          latitude: 45.5152,
          longitude: -122.6784,
          accuracy: 5.0,
        },
      });

      mockGPSVerification.verifyLocation.mockResolvedValue({
        isValid: true,
        distanceMeters: 3.2,
        accuracyMeters: 5.0,
      });

      // Act
      const result = await service.processStaffCheckIn(checkInRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.locationVerified).toBe(true);
      expect(
        mockWebSocketManager.broadcastToBookingStakeholders,
      ).toHaveBeenCalledWith(booking.id, expect.any(Object));
    });

    it("should reject check-in with GPS coordinates too far from booking location", async () => {
      // Arrange
      const checkInRequest = createStaffCheckInRequest();

      mockGPSVerification.verifyLocation.mockResolvedValue({
        isValid: false,
        distanceMeters: 150.0, // Too far
        accuracyMeters: 5.0,
      });

      // Act & Assert
      await expect(service.processStaffCheckIn(checkInRequest)).rejects.toThrow(
        LocationVerificationError,
      );
    });

    it("should verify cannabis staff certification for regulated events", async () => {
      // Arrange
      const booking = createCannabisBooking({
        state: "california",
        cannabisBookingType: "dispensary_opening",
      });

      const checkInRequest = createStaffCheckInRequest({
        bookingId: booking.id,
        staffId: "staff-with-ca-cert-123",
      });

      jest
        .spyOn(service, "verifyCannabisStaffCertification")
        .mockResolvedValue(true);

      // Act
      const result = await service.processStaffCheckIn(checkInRequest);

      // Assert
      expect(result.complianceStatus).toBe("compliant");
      expect(service.verifyCannabisStaffCertification).toHaveBeenCalledWith(
        "staff-with-ca-cert-123",
        "california",
        "dispensary_opening",
      );
    });
  });

  describe("processStaffCheckOut", () => {
    it("should validate cannabis product return quantities", async () => {
      // Arrange
      const checkIn = createStaffCheckIn({
        cannabisProductsReceived: [
          { productId: "prod-1", quantity: 10.0, unitType: "grams" },
          { productId: "prod-2", quantity: 5.0, unitType: "grams" },
        ],
      });

      const checkOutRequest = createStaffCheckOutRequest({
        checkInId: checkIn.id,
        cannabisProductsReturned: [
          { productId: "prod-1", quantity: 9.5, unitType: "grams" }, // 0.5g consumed
          { productId: "prod-2", quantity: 5.0, unitType: "grams" }, // Fully returned
        ],
      });

      // Act
      const result = await service.processStaffCheckOut(checkOutRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.complianceStatus).toBe("compliant");
    });

    it("should flag compliance violation for unreturned cannabis products", async () => {
      // Arrange
      const checkIn = createStaffCheckIn({
        cannabisProductsReceived: [
          { productId: "prod-1", quantity: 10.0, unitType: "grams" },
        ],
      });

      const checkOutRequest = createStaffCheckOutRequest({
        checkInId: checkIn.id,
        cannabisProductsReturned: [], // No products returned
      });

      // Act & Assert
      await expect(
        service.processStaffCheckOut(checkOutRequest),
      ).rejects.toThrow(ComplianceError);
    });
  });
});
```

## Integration Testing Strategy

### Microservices Integration Tests

```typescript
// tests/integration/microservices/booking-staff-assignment.test.ts
describe("Booking and Staff Assignment Integration", () => {
  let app: TestApplication;
  let bookingService: CannabisBookingService;
  let staffAssignmentService: StaffAssignmentService;

  beforeEach(async () => {
    app = await createTestApplication();
    bookingService = app.get(CannabisBookingService);
    staffAssignmentService = app.get(StaffAssignmentService);
  });

  it("should automatically trigger staff assignment when booking reaches stage 4", async () => {
    // Arrange
    const booking = await createTestBooking({
      state: "nevada",
      cannabisBookingType: "brand_activation",
      estimatedAttendees: 50,
    });

    const eventSpy = jest.spyOn(app.eventBus, "publish");

    // Act
    await bookingService.updateBookingStatus(
      booking.id,
      "approved",
      "stage_4_assignment",
      "manager-123",
    );

    // Wait for event processing
    await waitForEventProcessing();

    // Assert
    expect(eventSpy).toHaveBeenCalledWith(
      "booking.status_changed",
      expect.objectContaining({
        bookingId: booking.id,
        newStage: "stage_4_assignment",
      }),
    );

    const assignments = await staffAssignmentService.getAssignmentsByBooking(
      booking.id,
    );
    expect(assignments.length).toBeGreaterThan(0);
  });

  it("should handle staff assignment failures gracefully", async () => {
    // Arrange
    const booking = await createTestBooking({
      state: "remote_area",
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    });

    // Simulate no available staff
    jest
      .spyOn(staffAssignmentService, "findAvailableStaff")
      .mockResolvedValue([]);

    // Act
    const result = await bookingService.updateBookingStatus(
      booking.id,
      "approved",
      "stage_4_assignment",
      "manager-123",
    );

    await waitForEventProcessing();

    // Assert
    expect(result.status).toBe("on_hold");
    expect(result.stage).toBe("stage_4_assignment");

    const notifications =
      await app.notificationService.getNotificationsByBooking(booking.id);
    expect(
      notifications.some((n) => n.type === "staff_assignment_failed"),
    ).toBe(true);
  });
});
```

### Database Integration Tests

```typescript
// tests/integration/database/cannabis-compliance.test.ts
describe("Cannabis Compliance Database Integration", () => {
  let db: TestDatabase;
  let complianceRepository: CannabisComplianceRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    complianceRepository = new CannabisComplianceRepository(db);
  });

  it("should store and retrieve state-specific compliance requirements", async () => {
    // Arrange
    const californiaRequirements = createStateComplianceRequirements({
      state: "california",
      licensing: {
        businessLicenseRequired: true,
        cannabisLicenseRequired: true,
        validLicenseTypes: ["dispensary", "event_organizer"],
      },
      ageVerification: {
        minimumAge: 21,
        acceptedIdTypes: ["drivers_license", "passport", "state_id"],
      },
    });

    // Act
    await complianceRepository.saveStateRequirements(californiaRequirements);
    const retrieved =
      await complianceRepository.getStateRequirements("california");

    // Assert
    expect(retrieved.state).toBe("california");
    expect(retrieved.licensing.businessLicenseRequired).toBe(true);
    expect(retrieved.ageVerification.minimumAge).toBe(21);
    expect(retrieved.licensing.validLicenseTypes).toContain("dispensary");
  });

  it("should maintain audit trail for compliance checks", async () => {
    // Arrange
    const booking = await createTestBooking();
    const complianceCheck = createComplianceCheck({
      bookingId: booking.id,
      checkType: "license_verification",
      status: "compliant",
    });

    // Act
    await complianceRepository.saveComplianceCheck(complianceCheck);

    const auditTrail = await complianceRepository.getAuditTrailByBooking(
      booking.id,
    );

    // Assert
    expect(auditTrail.length).toBe(1);
    expect(auditTrail[0].checkType).toBe("license_verification");
    expect(auditTrail[0].bookingId).toBe(booking.id);
  });

  it("should handle cannabis license expiration tracking", async () => {
    // Arrange
    const expiringLicense = createCannabisLicense({
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      state: "colorado",
    });

    // Act
    await complianceRepository.saveCannabisLicense(expiringLicense);

    const expiringLicenses = await complianceRepository.getExpiringLicenses(60); // 60 days

    // Assert
    expect(expiringLicenses).toHaveLength(1);
    expect(expiringLicenses[0].id).toBe(expiringLicense.id);
  });
});
```

## End-to-End Testing Strategy

### Cannabis Workflow E2E Tests

```typescript
// tests/e2e/cannabis-booking-workflow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Cannabis Booking Complete Workflow", () => {
  test("should complete full booking lifecycle for california dispensary opening", async ({
    page,
  }) => {
    // Setup authenticated session
    await loginAsInternalAdmin(page);

    // Navigate to booking creation
    await page.goto("/bookings/new");

    // Fill cannabis booking form
    await page.selectOption(
      "[data-testid=cannabis-booking-type]",
      "dispensary_opening",
    );
    await page.fill(
      "[data-testid=booking-title]",
      "MedMen Grand Opening - Beverly Hills",
    );
    await page.selectOption("[data-testid=state-select]", "california");
    await page.selectOption("[data-testid=region-select]", "los_angeles");

    // Set cannabis-specific requirements
    await page.check("[data-testid=age-verification-required]");
    await page.uncheck("[data-testid=consumption-allowed]"); // Not allowed for grand opening
    await page.selectOption(
      "[data-testid=cannabis-license]",
      "ca-retail-license-123",
    );

    // Add cannabis products for display
    await page.click("[data-testid=add-cannabis-product]");
    await page.selectOption("[data-testid=product-category]", "flower");
    await page.fill("[data-testid=product-quantity]", "50");
    await page.selectOption("[data-testid=usage-purpose]", "display_only");

    // Submit booking
    await page.click("[data-testid=submit-booking]");

    // Verify booking creation
    await expect(
      page.locator("[data-testid=booking-success-message]"),
    ).toContainText("Booking created successfully");

    const bookingId = await page
      .locator("[data-testid=booking-id]")
      .textContent();

    // Navigate to booking details
    await page.goto(`/bookings/${bookingId}`);

    // Verify compliance status
    await expect(page.locator("[data-testid=compliance-status]")).toContainText(
      "Pending Review",
    );

    // Stage 2: Compliance Review
    await page.click("[data-testid=run-compliance-check]");
    await page.waitForSelector("[data-testid=compliance-results]");

    await expect(
      page.locator("[data-testid=license-check-status]"),
    ).toContainText("Passed");
    await expect(
      page.locator("[data-testid=age-verification-check]"),
    ).toContainText("Passed");

    // Advance to approval stage
    await page.click("[data-testid=advance-to-approval]");
    await expect(page.locator("[data-testid=booking-stage]")).toContainText(
      "Pending Approval",
    );

    // Stage 3: Approval Process
    await page.fill(
      "[data-testid=approval-notes]",
      "All compliance requirements met. Approved for dispensary opening.",
    );
    await page.click("[data-testid=approve-booking]");

    await expect(page.locator("[data-testid=booking-status]")).toContainText(
      "Approved",
    );

    // Stage 4: Staff Assignment
    await page.click("[data-testid=assign-staff]");

    // Set staff requirements
    await page.selectOption(
      "[data-testid=cannabis-expertise-level]",
      "experienced",
    );
    await page.check("[data-testid=certification-budtender]");
    await page.check("[data-testid=certification-compliance-trained]");

    await page.click("[data-testid=find-matching-staff]");
    await page.waitForSelector("[data-testid=staff-matches]");

    // Select staff members
    await page.check("[data-testid=select-staff-1]"); // Lead brand agent
    await page.check("[data-testid=select-staff-2]"); // Support agent

    await page.click("[data-testid=assign-selected-staff]");

    await expect(
      page.locator("[data-testid=staff-assignment-success]"),
    ).toBeVisible();

    // Stage 5: Kit Assignment
    await page.click("[data-testid=assign-equipment]");

    await page.check("[data-testid=cannabis-display-cases]");
    await page.check("[data-testid=age-verification-scanner]");
    await page.check("[data-testid=product-scales]");

    await page.click("[data-testid=assign-equipment-submit]");

    // Stage 6: Day of Event - Staff Check-in Simulation
    await simulateEventDay(page, bookingId);

    // Verify booking completion
    await expect(page.locator("[data-testid=booking-status]")).toContainText(
      "Completed",
    );
    await expect(page.locator("[data-testid=booking-stage]")).toContainText(
      "Data Collection",
    );
  });

  async function simulateEventDay(page: Page, bookingId: string) {
    // Simulate GPS check-in for staff
    await page.goto(`/bookings/${bookingId}/live-tracking`);

    // Mock GPS coordinates for the dispensary location
    await page.evaluate(() => {
      const mockGeolocation = {
        getCurrentPosition: (success: any) => {
          success({
            coords: {
              latitude: 34.0522,
              longitude: -118.2437,
              accuracy: 5,
            },
          });
        },
      };
      Object.defineProperty(navigator, "geolocation", {
        value: mockGeolocation,
      });
    });

    // Staff 1 check-in
    await page.click("[data-testid=staff-1-check-in]");
    await page.check("[data-testid=cannabis-certification-verified]");
    await page.check("[data-testid=compliance-briefing-completed]");
    await page.click("[data-testid=confirm-check-in]");

    await expect(page.locator("[data-testid=staff-1-status]")).toContainText(
      "Checked In",
    );

    // Staff 2 check-in
    await page.click("[data-testid=staff-2-check-in]");
    await page.check("[data-testid=cannabis-certification-verified]");
    await page.check("[data-testid=compliance-briefing-completed]");
    await page.click("[data-testid=confirm-check-in]");

    // Simulate event completion and check-out
    await page.click("[data-testid=staff-1-check-out]");
    await page.fill("[data-testid=attendee-count]", "85");
    await page.fill("[data-testid=leads-generated]", "23");
    await page.fill("[data-testid=age-verifications-performed]", "85");
    await page.click("[data-testid=confirm-check-out]");

    await page.click("[data-testid=staff-2-check-out]");
    await page.fill(
      "[data-testid=equipment-returned-notes]",
      "All equipment returned in good condition",
    );
    await page.click("[data-testid=confirm-check-out]");
  }

  test("should handle compliance violation during event", async ({ page }) => {
    await loginAsInternalAdmin(page);

    const bookingId = await createActiveBooking(page, {
      state: "california",
      type: "private_party",
      consumptionAllowed: true,
    });

    await page.goto(`/bookings/${bookingId}/live-tracking`);

    // Simulate compliance violation
    await page.click("[data-testid=report-compliance-issue]");
    await page.selectOption(
      "[data-testid=violation-type]",
      "age_verification_failure",
    );
    await page.fill(
      "[data-testid=violation-description]",
      "Attempted entry by individual under 21",
    );
    await page.click("[data-testid=submit-violation-report]");

    // Verify immediate response
    await expect(page.locator("[data-testid=compliance-alert]")).toContainText(
      "Critical Violation Reported",
    );
    await expect(page.locator("[data-testid=suggested-actions]")).toContainText(
      "Stop event activities",
    );

    // Verify notification sent to compliance team
    await expect(page.locator("[data-testid=notification-sent]")).toContainText(
      "Compliance team notified",
    );
  });
});
```

### Mobile App E2E Tests

```typescript
// tests/e2e/mobile/staff-check-in.spec.ts
test.describe("Mobile Staff Check-in Flow", () => {
  test("should complete staff check-in on mobile device", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginAsStaffMember(page, "brand-agent-123");

    // Navigate to assigned bookings
    await page.goto("/mobile/my-bookings");

    // Select today's booking
    await page.click("[data-testid=todays-booking]");

    // Verify booking details
    await expect(page.locator("[data-testid=booking-title]")).toBeVisible();
    await expect(
      page.locator("[data-testid=cannabis-requirements]"),
    ).toContainText("Budtender Certification Required");

    // Start check-in process
    await page.click("[data-testid=start-check-in]");

    // GPS location verification
    await mockGPSLocation(page, { latitude: 34.0522, longitude: -118.2437 });
    await page.click("[data-testid=verify-location]");

    await expect(page.locator("[data-testid=location-verified]")).toContainText(
      "Location verified",
    );

    // Cannabis compliance checks
    await page.check("[data-testid=cannabis-cert-verified]");
    await page.check("[data-testid=age-verification-trained]");
    await page.check("[data-testid=compliance-briefing-attended]");

    // Equipment receipt confirmation
    await page.check("[data-testid=equipment-received]");
    await page.fill(
      "[data-testid=equipment-notes]",
      "All equipment received in good condition",
    );

    // Photo documentation
    await uploadMockPhoto(page, "[data-testid=check-in-photo]");

    // Complete check-in
    await page.click("[data-testid=complete-check-in]");

    await expect(page.locator("[data-testid=check-in-success]")).toContainText(
      "Check-in completed successfully",
    );

    // Verify real-time status update
    await expect(page.locator("[data-testid=current-status]")).toContainText(
      "On Site",
    );
  });
});
```

## Cannabis Compliance Testing

### State Regulation Testing

```typescript
// tests/compliance/state-regulations.test.ts
describe("State Cannabis Regulations Compliance", () => {
  const testStates = [
    "california",
    "colorado",
    "washington",
    "oregon",
    "nevada",
  ];

  testStates.forEach((state) => {
    describe(`${state.toUpperCase()} Cannabis Regulations`, () => {
      let stateEngine: StateComplianceEngine;

      beforeEach(() => {
        stateEngine = new StateComplianceEngine();
      });

      it(`should enforce ${state} age verification requirements`, async () => {
        const booking = createCannabisBooking({
          state,
          cannabisBookingType: "private_party",
          ageVerificationRequired: true,
          estimatedAttendees: 50,
        });

        const compliance =
          await stateEngine.checkAgeVerificationCompliance(booking);

        expect(compliance.status).toBe("compliant");
        expect(compliance.requirements.minimumAge).toBeGreaterThanOrEqual(18);
        expect(compliance.requirements.verificationMethods).toContain(
          "government_id",
        );
      });

      it(`should validate ${state} cannabis license requirements`, async () => {
        const license = createCannabisLicense({
          state,
          licenseType: "event_organizer",
          status: "active",
          expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        });

        const validation = await stateEngine.validateLicense(
          license,
          "brand_activation",
        );

        expect(validation.isValid).toBe(true);
        expect(validation.allowedEventTypes).toContain("brand_activation");
      });

      it(`should enforce ${state} THC limits for recreational use`, async () => {
        const products = [
          createCannabisProduct({
            category: "edibles",
            thcPercentage:
              getStateThcLimit(state, "edibles", "recreational") + 5, // Over limit
          }),
        ];

        const booking = createCannabisBooking({
          state,
          medicalOnly: false,
          cannabisProducts: products,
          consumptionAllowed: true,
        });

        const compliance = await stateEngine.checkProductCompliance(booking);

        expect(compliance.status).toBe("non_compliant");
        expect(compliance.violations).toContain(
          expect.stringContaining("THC limit exceeded"),
        );
      });

      it(`should validate ${state} consumption area requirements`, async () => {
        const booking = createCannabisBooking({
          state,
          cannabisBookingType: "private_party",
          consumptionAllowed: true,
          locationId: "public-park-location", // Should be rejected
        });

        const compliance = await stateEngine.checkLocationCompliance(booking);

        if (getStateConsumptionRules(state).publicConsumptionAllowed) {
          expect(compliance.status).toBe("compliant");
        } else {
          expect(compliance.status).toBe("non_compliant");
          expect(compliance.violations).toContain(
            expect.stringContaining("public consumption"),
          );
        }
      });
    });
  });

  it("should handle multi-state events with different regulations", async () => {
    const multiStateBooking = createCannabisBooking({
      state: "california",
      additionalStates: ["nevada", "oregon"],
      cannabisBookingType: "trade_show",
    });

    const compliance =
      await stateEngine.checkMultiStateCompliance(multiStateBooking);

    expect(compliance.overallStatus).toBeDefined();
    expect(compliance.stateSpecificResults).toHaveLength(3);

    compliance.stateSpecificResults.forEach((result) => {
      expect(["california", "nevada", "oregon"]).toContain(result.state);
      expect(result.complianceStatus).toBeDefined();
    });
  });
});
```

### Audit Trail Testing

```typescript
// tests/compliance/audit-trail.test.ts
describe("Cannabis Compliance Audit Trail", () => {
  let auditService: CannabisAuditService;

  beforeEach(() => {
    auditService = new CannabisAuditService();
  });

  it("should maintain complete audit trail for cannabis booking lifecycle", async () => {
    const booking = await createCannabisBookingWithFullLifecycle();

    const auditTrail = await auditService.getCompleteAuditTrail(booking.id);

    // Verify all required audit entries
    const requiredEvents = [
      "booking_created",
      "compliance_check_initiated",
      "license_verified",
      "staff_assigned",
      "equipment_assigned",
      "staff_checked_in",
      "cannabis_products_verified",
      "age_verification_completed",
      "staff_checked_out",
      "products_returned",
      "booking_completed",
      "data_submitted",
    ];

    requiredEvents.forEach((event) => {
      expect(auditTrail.some((entry) => entry.action === event)).toBe(true);
    });

    // Verify audit entry completeness
    auditTrail.forEach((entry) => {
      expect(entry.id).toMatch(UUID_REGEX);
      expect(entry.timestamp).toBeDefined();
      expect(entry.userId).toMatch(UUID_REGEX);
      expect(entry.action).toBeDefined();
      expect(entry.details).toBeDefined();
    });
  });

  it("should record cannabis product tracking throughout event", async () => {
    const booking = createCannabisBooking({
      cannabisProducts: [
        { productId: "prod-1", quantity: 10.0, unitType: "grams" },
      ],
    });

    // Simulate product lifecycle
    await auditService.recordProductReceived(
      booking.id,
      "prod-1",
      10.0,
      "staff-1",
    );
    await auditService.recordProductDisplayed(booking.id, "prod-1", 10.0);
    await auditService.recordProductSampled(
      booking.id,
      "prod-1",
      0.5,
      "customer-age-verified",
    );
    await auditService.recordProductReturned(
      booking.id,
      "prod-1",
      9.5,
      "staff-1",
    );

    const productTrail = await auditService.getProductAuditTrail(
      booking.id,
      "prod-1",
    );

    expect(productTrail).toHaveLength(4);
    expect(productTrail[0].action).toBe("product_received");
    expect(productTrail[3].action).toBe("product_returned");

    // Verify quantity tracking
    const totalReceived = productTrail
      .filter((e) => e.action === "product_received")
      .reduce((sum, e) => sum + e.quantity, 0);
    const totalReturned = productTrail
      .filter((e) => e.action === "product_returned")
      .reduce((sum, e) => sum + e.quantity, 0);
    const totalSampled = productTrail
      .filter((e) => e.action === "product_sampled")
      .reduce((sum, e) => sum + e.quantity, 0);

    expect(totalReceived).toBe(10.0);
    expect(totalReturned + totalSampled).toBe(10.0);
  });
});
```

## Performance Testing Strategy

### Load Testing for Cannabis Peak Periods

```typescript
// tests/performance/peak-booking-load.js
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  scenarios: {
    cannabis_peak_booking_period: {
      executor: "ramping-vus",
      stages: [
        { duration: "2m", target: 100 }, // Ramp up
        { duration: "5m", target: 500 }, // Peak cannabis booking hours
        { duration: "2m", target: 0 }, // Ramp down
      ],
    },

    real_time_staff_tracking: {
      executor: "constant-vus",
      vus: 50,
      duration: "10m",
      exec: "staffTrackingScenario",
    },

    compliance_checking_load: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      preAllocatedVUs: 50,
      stages: [
        { duration: "2m", target: 50 }, // Compliance check surge
        { duration: "5m", target: 50 },
        { duration: "2m", target: 10 },
      ],
      exec: "complianceCheckScenario",
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests under 2s
    http_req_failed: ["rate<0.01"], // Less than 1% errors
    "http_req_duration{scenario:real_time_staff_tracking}": ["p(95)<500"],
    "http_req_duration{scenario:compliance_checking_load}": ["p(95)<1000"],
  },
};

export default function () {
  const baseUrl = "https://api.cannabis-booking-platform.com/v1";
  const authToken = getAuthToken();

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  // Create cannabis booking
  const bookingPayload = {
    title: `Load Test Booking ${Date.now()}`,
    cannabisBookingType: "product_demo",
    state: "california",
    startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
    ).toISOString(),
    estimatedAttendees: Math.floor(Math.random() * 100) + 10,
    cannabisLicenseId: "ca-license-load-test-123",
  };

  const createResponse = http.post(
    `${baseUrl}/bookings`,
    JSON.stringify(bookingPayload),
    { headers },
  );

  check(createResponse, {
    "booking creation status is 201": (r) => r.status === 201,
    "booking has valid UUID": (r) => {
      const booking = JSON.parse(r.body);
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        booking.booking.id,
      );
    },
  });

  if (createResponse.status === 201) {
    const booking = JSON.parse(createResponse.body);

    // Get booking details
    const getResponse = http.get(`${baseUrl}/bookings/${booking.booking.id}`, {
      headers,
    });

    check(getResponse, {
      "get booking status is 200": (r) => r.status === 200,
      "response time < 500ms": (r) => r.timings.duration < 500,
    });
  }

  sleep(1);
}

export function staffTrackingScenario() {
  const baseUrl = "https://api.cannabis-booking-platform.com/v1";
  const authToken = getStaffAuthToken();

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  // Simulate staff check-in
  const checkInPayload = {
    staffAssignmentId: "assignment-load-test-123",
    gpsCoordinates: {
      latitude: 34.0522 + (Math.random() - 0.5) * 0.01,
      longitude: -118.2437 + (Math.random() - 0.5) * 0.01,
      accuracy: Math.random() * 10 + 5,
      timestamp: new Date().toISOString(),
    },
    verificationMethod: "gps_verified",
    cannabisCertificationVerified: true,
  };

  const checkInResponse = http.post(
    `${baseUrl}/bookings/booking-load-test-123/check-in`,
    JSON.stringify(checkInPayload),
    { headers },
  );

  check(checkInResponse, {
    "check-in status is 200": (r) => r.status === 200,
    "check-in response time < 200ms": (r) => r.timings.duration < 200,
  });

  sleep(0.5);
}

export function complianceCheckScenario() {
  const baseUrl = "https://api.cannabis-booking-platform.com/v1";
  const authToken = getAdminAuthToken();

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  const compliancePayload = {
    checkTypes: [
      "license_verification",
      "age_verification_system",
      "product_tracking",
    ],
    automated: true,
  };

  const complianceResponse = http.post(
    `${baseUrl}/bookings/booking-load-test-123/compliance-check`,
    JSON.stringify(compliancePayload),
    { headers },
  );

  check(complianceResponse, {
    "compliance check status is 200": (r) => r.status === 200,
    "compliance check time < 1s": (r) => r.timings.duration < 1000,
    "compliance result is valid": (r) => {
      const result = JSON.parse(r.body);
      return result.overallStatus && result.complianceScore !== undefined;
    },
  });

  sleep(2);
}
```

This comprehensive testing strategy ensures the cannabis booking management system meets all requirements for reliability, compliance, performance, and user experience while maintaining strict adherence to cannabis industry regulations and authentic data practices.
