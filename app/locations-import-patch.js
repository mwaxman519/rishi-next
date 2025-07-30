const fs = require("fs");

// Update the locations service import in the API route
const apiLocationRoute = "./api/locations/route.ts";
if (fs.existsSync(apiLocationRoute)) {
  let content = fs.readFileSync(apiLocationRoute, "utf8");
  content = content.replace(
    'import { locationsService } from "@/services/locations";',
    'import { locationsService } from "@/services/locations_core";',
  );
  fs.writeFileSync(apiLocationRoute, content);
  console.log("Updated locations import in API route");
}

// Update client-side service imports if needed
const clientLocationService = "./client/services/locations.ts";
if (fs.existsSync(clientLocationService)) {
  let content = fs.readFileSync(clientLocationService, "utf8");
  if (content.includes("@/services/locations")) {
    content = content.replace(
      /@\/services\/locations/g,
      "@/services/locations_core",
    );
    fs.writeFileSync(clientLocationService, content);
    console.log("Updated client-side locations service import");
  }
}

console.log("Import paths updated to use core locations service");
