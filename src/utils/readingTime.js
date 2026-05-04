const WORDS_PER_MINUTE = 220;

export function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}
