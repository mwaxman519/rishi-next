import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const routesManifest = {
  version: 3,
  pages404: true,
  basePath: "",
  redirects: [],
  rewrites: [],
  headers: [],
  staticRoutes: [
    {
      page: "/",
      routeKeys: {},
      dataRouteRegex: "^/_next/data/([^/]+)/index.json$",
      namedDataRouteRegex: "^/_next/data/(?P<nxtPbuild>[^/]+)/index\\.json$"
    }
  ],
  dynamicRoutes: [],
  dataRoutes: [],
  i18n: null
};

const manifestPath = '.next/routes-manifest.json';
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, JSON.stringify(routesManifest, null, 2));

console.log('✅ Created routes-manifest.json');