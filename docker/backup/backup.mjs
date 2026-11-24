#!/usr/bin/env node
/**
 * Dump Postgres → gzip → Cloudinary (resource_type: raw).
 * Puis purge des dumps plus vieux que BACKUP_KEEP_DAYS.
 */
import { spawnSync } from "node:child_process";
import { unlinkSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { v2 as cloudinary } from "cloudinary";

const databaseUrl = process.env.DATABASE_URL;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder =
  process.env.CLOUDINARY_BACKUP_FOLDER ||
  `${process.env.CLOUDINARY_FOLDER || "ksmile"}/backups`;
const keepDays = Math.max(1, Number(process.env.BACKUP_KEEP_DAYS || 14));

function fail(msg) {
  console.error(`[backup] ${msg}`);
  process.exit(1);
}

if (!databaseUrl) fail("DATABASE_URL manquant.");
if (!cloudName || !apiKey || !apiSecret) {
  fail("Cloudinary non configuré (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-")
  .replace("T", "_")
  .replace("Z", "");
const publicId = `ksmile-db_${stamp}`;
const localPath = join(tmpdir(), `${publicId}.sql.gz`);

console.log(`[backup] Dump Postgres…`);
const dump = spawnSync(
  "bash",
  [
    "-c",
    `pg_dump --no-owner --no-acl --format=plain "$DATABASE_URL" | gzip -9 > "${localPath}"`,
  ],
  {
    env: process.env,
    encoding: "utf8",
  },
);

if (dump.status !== 0) {
  fail(`pg_dump a échoué: ${dump.stderr || dump.stdout || "code " + dump.status}`);
}

const sizeMb = (statSync(localPath).size / (1024 * 1024)).toFixed(2);
console.log(`[backup] Archive locale ${sizeMb} Mo → Cloudinary ${folder}/${publicId}`);

try {
  const uploaded = await cloudinary.uploader.upload(localPath, {
    resource_type: "raw",
    folder,
    public_id: publicId,
    overwrite: false,
    unique_filename: false,
    use_filename: false,
  });

  console.log(`[backup] OK: ${uploaded.secure_url}`);
} catch (err) {
  const message =
    err && typeof err === "object" && "message" in err
      ? String(err.message)
      : String(err);
  fail(`Upload Cloudinary: ${message}`);
} finally {
  try {
    unlinkSync(localPath);
  } catch {
    /* ignore */
  }
}

console.log(`[backup] Rétention: garder ${keepDays} jour(s)…`);
try {
  const listed = await cloudinary.api.resources({
    type: "upload",
    resource_type: "raw",
    prefix: `${folder}/`,
    max_results: 500,
  });

  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  const stale = (listed.resources || []).filter((r) => {
    const created = Date.parse(r.created_at);
    return Number.isFinite(created) && created < cutoff;
  });

  for (const resource of stale) {
    await cloudinary.uploader.destroy(resource.public_id, {
      resource_type: "raw",
      invalidate: true,
    });
    console.log(`[backup] Supprimé: ${resource.public_id}`);
  }

  if (!stale.length) {
    console.log("[backup] Aucun vieux dump à purger.");
  }
} catch (err) {
  console.warn(
    "[backup] Purge rétention impossible (droits Admin API ?):",
    err && typeof err === "object" && "message" in err ? err.message : err,
  );
}

console.log("[backup] Terminé.");
