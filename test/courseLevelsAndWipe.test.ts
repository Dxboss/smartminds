import test from "node:test";
import assert from "node:assert/strict";
import { courses } from "../src/content/courses";
import { getCourseRepo } from "../src/lib/repositories";
import {
  loadPersistedRecords,
  saveCohortSchedule,
  getCohortSchedule,
  wipeAllDemoData,
} from "../src/lib/persistedData";
import {
  updateCourseDetailsAction,
  wipeDemoDataAction,
} from "../src/app/admin/actions";
import { CourseLevel } from "../src/content/types";

test("4 Required CPD Courses Verification", async (t) => {
  await t.test("Phlebotomy CPD course is present, published, and type is cpd", () => {
    const phlebotomy = courses.find((c) => c.id === "course-phlebotomy");
    assert.ok(phlebotomy, "Phlebotomy course must exist");
    assert.equal(phlebotomy.type, "cpd");
    assert.equal(phlebotomy.published, true);
    assert.ok(phlebotomy.levels.length > 0, "Must have at least 1 level");
    assert.ok(phlebotomy.levels[0].price_gbp > 0, "Price must be > 0");
  });

  await t.test("Care Certificate CPD course is present, published, and type is cpd", () => {
    const careCert = courses.find((c) => c.id === "course-care-certificate");
    assert.ok(careCert, "Care certificate course must exist");
    assert.equal(careCert.type, "cpd");
    assert.equal(careCert.published, true);
    assert.ok(careCert.levels.length > 0);
  });

  await t.test("IT & Digital Office Skills CPD course is present, published, and type is cpd", () => {
    const itCourse = courses.find((c) => c.id === "course-it-cpd");
    assert.ok(itCourse, "IT CPD course must exist");
    assert.equal(itCourse.type, "cpd");
    assert.equal(itCourse.published, true);
    assert.ok(itCourse.levels.length > 0);
    assert.equal(itCourse.levels[0].level_label, "CPD Certificate");
  });

  await t.test("Job Skills & Workplace Employability CPD course is present, published, and type is cpd", () => {
    const jobSkill = courses.find((c) => c.id === "course-job-skills-cpd");
    assert.ok(jobSkill, "Job skill CPD course must exist");
    assert.equal(jobSkill.type, "cpd");
    assert.equal(jobSkill.published, true);
    assert.ok(jobSkill.levels.length > 0);
    assert.equal(jobSkill.levels[0].level_label, "CPD Certificate");
  });
});

test("Course Level Addition, Modification and Removal", async (t) => {
  const repo = getCourseRepo();
  const testCourseId = "course-adult-care";
  let initial = await repo.getCourseById(testCourseId);
  assert.ok(initial, "Adult care course must exist");

  // Clean up any test artifact from prior test runs
  if (initial.levels.some((l) => l.level_label === "Level 4 Higher Diploma")) {
    const cleaned = initial.levels.filter((l) => l.level_label !== "Level 4 Higher Diploma");
    await updateCourseDetailsAction(testCourseId, { levels: cleaned });
    initial = (await repo.getCourseById(testCourseId))!;
  }
  const initialLevelCount = initial.levels.length;

  await t.test("Admin can add a new level to an existing course", async () => {
    const newLevel: CourseLevel = {
      course_id: testCourseId,
      level_label: "Level 4 Higher Diploma",
      price_gbp: 1850,
      full_pay_discount_percent: 10,
      duration_text: "6 – 9 months",
      guided_learning_hours: 420,
      entry_requirements: ["Level 3 Diploma or equivalent care experience"],
      units: [
        { code: "AC4-01", title: "Advanced Safeguarding and Clinical Governance" },
      ],
      plans: [],
    };

    const updatedLevels = [...initial.levels, newLevel];
    const res = await updateCourseDetailsAction(testCourseId, {
      levels: updatedLevels,
    });

    assert.equal(res.success, true);
    assert.equal(res.course.levels.length, initialLevelCount + 1);
    const addedLvl = res.course.levels.find((l: CourseLevel) => l.level_label === "Level 4 Higher Diploma");
    assert.ok(addedLvl);
    assert.equal(addedLvl.price_gbp, 1850);
  });

  await t.test("Admin can remove a level from a multi-level course", async () => {
    const current = await repo.getCourseById(testCourseId);
    assert.ok(current);
    assert.ok(current.levels.length > 1);

    // Remove the newly added level
    const filteredLevels = current.levels.filter((l) => l.level_label !== "Level 4 Higher Diploma");
    const res = await updateCourseDetailsAction(testCourseId, {
      levels: filteredLevels,
    });

    assert.equal(res.success, true);
    assert.equal(res.course.levels.length, initialLevelCount);
    const exists = res.course.levels.some((l: CourseLevel) => l.level_label === "Level 4 Higher Diploma");
    assert.equal(exists, false);
  });
});

test("Data Wipe & Production Clean State", async (t) => {
  await t.test("wipeAllDemoData resets transactional records while keeping schedules", async () => {
    // Backup in-memory seed records and persisted file so later tests aren't starved of test fixtures
    const fs = await import("fs");
    const path = await import("path");
    const seedData = await import("../src/lib/repositories/seedData");
    const { resetRepositoriesForTest } = await import("../src/lib/repositories");

    const storePath = path.join(process.cwd(), "data", "persisted_records.json");
    const storeBackup = fs.existsSync(storePath) ? fs.readFileSync(storePath, "utf-8") : null;

    const backupLearners = [...seedData.seedLearners];
    const backupEnrolments = [...seedData.seedEnrolments];
    const backupPaymentRecords = [...seedData.seedPaymentRecords];
    const backupPaymentSchedules = [...seedData.seedPaymentSchedules];
    const backupBookings = [...seedData.seedBookings];
    const backupEnquiries = [...seedData.seedEnquiries];
    const backupUsers = [...seedData.seedUsers];
    const backupOutbox = [...seedData.demoOutbox];

    try {
      // Ensure cohort schedules exist
      saveCohortSchedule({
        afternoon: {
          timeLabel: "13:30 – 15:30",
          startTime: "13:30",
          endTime: "15:30",
          description: "Interactive live daytime seminar",
          zoomUrl: "https://zoom.us/j/smartminds-pro-afternoon-account-1",
        },
        evening: {
          timeLabel: "19:00 – 21:00",
          startTime: "19:00",
          endTime: "21:00",
          description: "Interactive live evening seminar",
          zoomUrl: "https://zoom.us/j/smartminds-pro-evening-account-2",
        },
      });

      const res = await wipeDemoDataAction();
      assert.equal(res.success, true);

      const store = loadPersistedRecords();
      assert.equal(store.learners.length, 0, "Learners must be wiped");
      assert.equal(store.enrolments.length, 0, "Enrolments must be wiped");
      assert.equal(store.paymentRecords.length, 0, "Payment records must be wiped");
      assert.equal(store.bookings?.length || 0, 0, "Bookings must be wiped");

      // Cohort schedule configuration should remain intact
      const schedule = getCohortSchedule();
      assert.equal(schedule.afternoon.zoomUrl, "https://zoom.us/j/smartminds-pro-afternoon-account-1");
      assert.equal(schedule.evening.zoomUrl, "https://zoom.us/j/smartminds-pro-evening-account-2");
    } finally {
      // Restore in-memory fixtures and persisted file for downstream test isolation
      seedData.seedLearners.length = 0;
      seedData.seedLearners.push(...backupLearners);
      seedData.seedEnrolments.length = 0;
      seedData.seedEnrolments.push(...backupEnrolments);
      seedData.seedPaymentRecords.length = 0;
      seedData.seedPaymentRecords.push(...backupPaymentRecords);
      seedData.seedPaymentSchedules.length = 0;
      seedData.seedPaymentSchedules.push(...backupPaymentSchedules);
      seedData.seedBookings.length = 0;
      seedData.seedBookings.push(...backupBookings);
      seedData.seedEnquiries.length = 0;
      seedData.seedEnquiries.push(...backupEnquiries);
      seedData.seedUsers.length = 0;
      seedData.seedUsers.push(...backupUsers);
      seedData.demoOutbox.length = 0;
      seedData.demoOutbox.push(...backupOutbox);

      if (storeBackup !== null) {
        fs.writeFileSync(storePath, storeBackup, "utf-8");
      }
      resetRepositoriesForTest();
    }
  });
});

