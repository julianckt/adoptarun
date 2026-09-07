import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

export default defineConfig({
  name: 'adopt-a-run',
  title: 'Adopt A Run',
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'huk9xx07',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  plugins: [
    structureTool({
      structure,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
