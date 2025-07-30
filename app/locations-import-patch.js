const fs = require(&quot;fs&quot;);

// Update the locations service import in the API route
const apiLocationRoute = &quot;./api/locations/route.ts&quot;;
if (fs.existsSync(apiLocationRoute)) {
  let content = fs.readFileSync(apiLocationRoute, &quot;utf8&quot;);
  content = content.replace(
    'import { locationsService } from &quot;@/services/locations&quot;;',
    'import { locationsService } from &quot;@/services/locations_core&quot;;',
  );
  fs.writeFileSync(apiLocationRoute, content);
  console.log(&quot;Updated locations import in API route&quot;);
}

// Update client-side service imports if needed
const clientLocationService = &quot;./client/services/locations.ts&quot;;
if (fs.existsSync(clientLocationService)) {
  let content = fs.readFileSync(clientLocationService, &quot;utf8&quot;);
  if (content.includes(&quot;@/services/locations&quot;)) {
    content = content.replace(
      /@\/services\/locations/g,
      &quot;@/services/locations_core&quot;,
    );
    fs.writeFileSync(clientLocationService, content);
    console.log(&quot;Updated client-side locations service import&quot;);
  }
}

console.log(&quot;Import paths updated to use core locations service&quot;);
