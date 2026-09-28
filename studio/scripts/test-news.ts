// Test fixture for In the News. Run from studio/ with the user token, never a stored one:
//   npx sanity exec scripts/test-news.ts --with-user-token -- create
//   npx sanity exec scripts/test-news.ts --with-user-token -- delete
// `create` writes exactly two TEST newsItem documents; `delete` removes them and reports what is left.
import { getCliClient } from 'sanity/cli';

declare const process: { argv: string[] }; // sanity exec runs this in Node

const client = getCliClient({ apiVersion: '2026-09-01' });
const IDS = ['test-news-1', 'test-news-2'];
const mode = process.argv.at(-1);

if (mode === 'create') {
  await client
    .transaction()
    .createOrReplace({
      _id: IDS[0],
      _type: 'newsItem',
      headline: 'TEST Foundation Honors Local Legends',
      outlet: 'Example Daily Record',
      date: '2026-09-12',
      url: 'https://example.com/test-news-1',
      summary: 'A test summary written in our own words, describing how the luncheon recognized young athletes and the programs that coach them.',
    })
    .createOrReplace({
      _id: IDS[1],
      _type: 'newsItem',
      headline: 'TEST Luncheon Recap',
      outlet: 'Example Herald',
      date: '2026-06-02',
      url: 'https://example.com/test-news-2',
      summary: 'A shorter test summary about the first Legends Among Us luncheon at The Highlawn.',
    })
    .commit();
  console.log('created', IDS.join(', '));
} else if (mode === 'delete') {
  await IDS.reduce((tx, id) => tx.delete(id).delete(`drafts.${id}`), client.transaction()).commit();
  console.log('deleted', IDS.join(', '));
} else {
  throw new Error('Pass "create" or "delete".');
}

const left = await client.fetch('count(*[_type == "newsItem"])');
console.log('newsItem documents in the dataset:', left);
