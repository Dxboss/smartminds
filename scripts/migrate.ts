import { runMigrations, getMigrationStatus } from "../src/lib/migrations";

async function main() {
  const args = process.argv.slice(2);
  const isStatusOnly = args.includes("--status");

  console.log("=== Smartminds Training College Database Migration Tool ===");

  if (isStatusOnly) {
    console.log("Checking migration status...");
    const status = await getMigrationStatus();
    if (!status.configured) {
      console.log("Status: DATABASE_URL not configured. (Demo/in-memory mode)");
      process.exit(0);
    }
    if (status.error) {
      console.error("Status error:", status.error);
      process.exit(1);
    }
    console.log("Migration status:");
    for (const m of status.status) {
      console.log(`  [${m.applied ? "APPLIED" : "PENDING"}] v${m.version}: ${m.name} ${m.appliedAt ? `(${m.appliedAt})` : ""}`);
    }
    process.exit(0);
  }

  console.log("Executing pending migrations...");
  const result = await runMigrations();
  if (!result.success) {
    console.error("Migration failed:", result.error);
    process.exit(1);
  }

  if (result.appliedCount === 0) {
    console.log("Database schema is already up to date. No pending migrations.");
  } else {
    console.log(`Successfully applied ${result.appliedCount} migration(s):`);
    for (const name of result.appliedNames) {
      console.log(`  - ${name}`);
    }
  }
}

main().catch((err) => {
  console.error("Migration script exception:", err);
  process.exit(1);
});
