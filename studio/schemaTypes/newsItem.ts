import { defineField, defineType } from 'sanity';

// One press mention for In the News (everyday-legends-copy.md, section 3). Text only: there is no
// image field, by design. Every field is required.
const MAX_WORDS = 25;
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export const newsItem = defineType({
  name: 'newsItem',
  title: 'News item',
  type: 'document',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: "The article's headline exactly as the outlet published it.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'outlet',
      title: 'Outlet',
      type: 'string',
      description: 'The publication, as it names itself.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'The date the article was published.',
      options: { dateFormat: 'MMM D, YYYY' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link',
      type: 'url',
      description: 'The original article. Opens in a new tab on the site.',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: `Write this in your own words. Never copy from the article. One sentence, ${MAX_WORDS} words max.`,
      validation: (rule) => [
        rule.required().custom((value) => {
          if (typeof value !== 'string') return true;
          const words = wordCount(value);
          return words <= MAX_WORDS || `${words} words. Keep the summary to ${MAX_WORDS} words or fewer.`;
        }),
        // A warning, not an error: "Dr." or "St." would trip a strict sentence test and block a
        // correct summary from publishing.
        rule
          .custom((value) =>
            typeof value !== 'string' || !/[.!?]["”’)]*\s+\S/.test(value.trim())
              ? true
              : 'This reads as more than one sentence. Keep it to one.',
          )
          .warning(),
      ],
    }),
  ],
  orderings: [
    { title: 'Date, newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'headline', subtitle: 'outlet' },
  },
});
