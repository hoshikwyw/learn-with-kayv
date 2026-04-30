/**
 * Convert any YouTube URL the user pastes into an embed URL.
 * Returns null if the URL doesn't match a known YouTube format.
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.trim().match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}
