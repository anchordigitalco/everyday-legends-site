import { defineCliConfig } from 'sanity/cli';

// Studio CLI config. The Studio is deployed by hand (`npm run deploy`), never from the site build.
export default defineCliConfig({
  api: {
    projectId: 'dfzf4x6m',
    dataset: 'production',
  },
  studioHost: 'everyday-legends',
  deployment: {
    appId: 'cmz3sjbo91smntzw844it9dy',
  },
});
