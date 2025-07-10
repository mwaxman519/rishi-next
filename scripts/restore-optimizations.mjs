#!/usr/bin/env node
import fs from "fs";

console.log("Restoring original files...");

const backups = [
  "app/admin/roles/page.tsx.backup",
  "components/ui/data-table.tsx.backup",
  "middleware.ts.backup",
];

backups.forEach((backup) => {
  const original = backup.replace(".backup", "");
  if (fs.existsSync(backup)) {
    fs.copyFileSync(backup, original);
    fs.unlinkSync(backup);
    console.log("Restored", original);
  }
});

console.log("Restoration completed");
