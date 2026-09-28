import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

// Everyday Legends Foundation. One document type: newsItem, read by In the News on /in-the-community.
export default defineConfig({
  name: 'default',
  title: 'Everyday Legends Foundation',
  projectId: 'dfzf4x6m',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
