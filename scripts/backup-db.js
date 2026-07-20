/**
 * Dump every MongoDB collection to timestamped JSON files.
 *
 * Free alternative to Atlas Cloud Backups (which the M0 tier doesn't provide).
 *
 *   node scripts/backup-db.js                  -> ./backups/<timestamp>/
 *   node scripts/backup-db.js /path/to/folder  -> custom location
 *
 * Restore a single collection with scripts/restore-collection.js.
 *
 * Keeps the newest KEEP_LAST backups and prunes older ones.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const KEEP_LAST = 14;

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  const root = process.argv[2] || path.join(process.cwd(), "backups");
  // Safe for filenames on Windows (no colons).
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = path.join(root, stamp);
  fs.mkdirSync(dir, { recursive: true });

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collections = (await db.listCollections().toArray()).map((c) => c.name);

  let totalDocs = 0;
  const manifest = [];

  for (const name of collections) {
    const docs = await db.collection(name).find({}).toArray();
    fs.writeFileSync(
      path.join(dir, `${name}.json`),
      JSON.stringify(docs, null, 1)
    );
    totalDocs += docs.length;
    manifest.push({ collection: name, documents: docs.length });
    console.log(`  ${name.padEnd(28)} ${String(docs.length).padStart(6)} docs`);
  }

  fs.writeFileSync(
    path.join(dir, "_manifest.json"),
    JSON.stringify(
      { takenAt: new Date().toISOString(), database: db.databaseName, totalDocs, collections: manifest },
      null,
      1
    )
  );

  console.log(`\nBackup complete: ${collections.length} collections, ${totalDocs} documents`);
  console.log(`Saved to: ${dir}`);

  // Prune old backups, keeping the most recent KEEP_LAST.
  const all = fs
    .readdirSync(root)
    .filter((f) => fs.statSync(path.join(root, f)).isDirectory())
    .sort();
  const stale = all.slice(0, Math.max(0, all.length - KEEP_LAST));
  stale.forEach((old) => {
    fs.rmSync(path.join(root, old), { recursive: true, force: true });
    console.log(`Pruned old backup: ${old}`);
  });

  await mongoose.disconnect();
})().catch((err) => {
  console.error("Backup FAILED:", err.message);
  process.exit(1);
});
