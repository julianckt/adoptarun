import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'huk9xx07',
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  },
  studioHost: 'adoptarun',
  deployment: {
    appId: 'mkr9jpmsyclswe4ggdzojc66',
  },
});
