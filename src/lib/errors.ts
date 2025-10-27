export function prettyError(e: any): string {
  if (!e) return 'Unknown error';
  if (e?.metaMessages?.length) return e.metaMessages.join('\n');
  if (e?.shortMessage) return e.shortMessage;
  if (typeof e?.message === 'string') return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
}
