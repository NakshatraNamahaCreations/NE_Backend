/**
 * Restore ONE collection from a backup made by scripts/backup-db.js.
 *
 *   node scripts/restore-collection.js <backupDir> <collection> [--wipe]
 *
 * e.g. node scripts/restore-collection.js backups/2026-07-20T12-00-00 users
 *
 * By default this INSERTS documents and skips any whose _id already exists,
 * so it is safe to re-run. Pass --wipe to delete the collection's current
 * contents first (destructive - it prints the count and pauses 5s).
 */
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

(async () => {
  const [backupDir, collection] = process.argv.slice(2);
  const wipe = process.argv.includes("--wipe");

  if (!backupDir || !collection) {
    console.error(
      "Usage: node scripts/restore-collection.js <backupDir> <collection> [--wipe]"
    );
    process.exit(1);
  }

  const file = path.join(backupDir, `${collection}.json`);
  if (!fs.existsSync(file)) {
    console.error(`Not found: ${file}`);
    process.exit(1);
  }

  const docs = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`${docs.length} documents in backup for "${collection}"`);

  // Revive the extended-JSON forms that JSON.stringify produced.
  const revive = (d) => {
    const out = { ...d };
    if (typeof out._id === "string" && /^[0-9a-fA-F]{24}$/.test(out._id)) {
      out._id = new mongoose.Types.ObjectId(out._id);
    }
    ["createdAt", "updatedAt", "ordered_date"].forEach((k) => {
      if (typeof out[k] === "string" && !isNaN(Date.parse(out[k]))) {
        out[k] = new Date(out[k]);
      }
    });
    return out;
  };

  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection(collection);
  const before = await col.countDocuments();
  console.log(`currently in database: ${before}`);

  if (wipe) {
    console.log(`--wipe given: deleting all ${before} existing documents in 5s...`);
    await new Promise((r) => setTimeout(r, 5000));
    const del = await col.deleteMany({});
    console.log(`deleted ${del.deletedCount}`);
  }

  let inserted = 0;
  let skipped = 0;
  // ordered:false so one duplicate _id doesn't abort the whole restore.
  try {
    const res = await col.insertMany(docs.map(revive), { ordered: false });
    inserted = res.insertedCount;
  } catch (err) {
    inserted = err.result?.nInserted ?? 0;
    skipped = (err.writeErrors || []).length;
  }

  console.log(`inserted: ${inserted} | skipped (already present): ${skipped}`);
  console.log(`now in database: ${await col.countDocuments()}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error("Restore FAILED:", err.message);
  process.exit(1);
});
