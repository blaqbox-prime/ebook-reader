import { BookmarkWithContext } from '@/src/types/reader.types';

const getChapterLabel = (bookmark: BookmarkWithContext): string =>
  (
    (bookmark as { chapter?: { label?: string } }).chapter?.label ??
    bookmark.section?.label ??
    ''
  ).trim();

/**
 * Builds a Markdown document from saved bookmarks/highlights for export.
 */
export const buildHighlightsMarkdown = (
  bookmarks: BookmarkWithContext[]
): string => {
  if (bookmarks.length === 0) {
    return `# PageTurner — Highlights & Notes\n\nNo highlights yet. Happy reading!\n`;
  }

  const header = `# PageTurner — Highlights & Notes\n\nExported ${new Date().toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )}\n\n`;

  const byBook = new Map<string, BookmarkWithContext[]>();
  bookmarks.forEach(bookmark => {
    const title = bookmark.bookTitle.trim() || 'Untitled';
    const list = byBook.get(title) ?? [];
    list.push(bookmark);
    byBook.set(title, list);
  });

  let body = '';
  byBook.forEach((list, title) => {
    body += `## ${title}\n\n`;
    list.forEach(bookmark => {
      const excerpt = bookmark.text?.trim() || '_No excerpt text_';
      const chapter = getChapterLabel(bookmark) || 'Book excerpt';
      const page =
        bookmark.location?.start?.displayed?.page ??
        bookmark.location?.start?.location ??
        null;
      body += `- **${chapter}**${page ? ` · Page ${page}` : ''}\n\n`;
      body += `  > ${excerpt}\n\n`;
    });
  });

  return `${header}${body}`;
};
