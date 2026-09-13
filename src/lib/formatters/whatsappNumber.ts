const MAX_WHATSAPP_DIGITS = 11

/**
 * Each segment contributes its separator only when it holds at least one digit,
 * which is what keeps a trailing `83 ` or `83 9 8765-` unreachable at every
 * digit count. That in turn makes a single Backspace drop both the digit and
 * the separator it orphaned.
 */
const SEGMENTS = [
  { start: 0, end: 2, separator: '' },
  { start: 2, end: 3, separator: ' ' },
  { start: 3, end: 7, separator: ' ' },
  { start: 7, end: MAX_WHATSAPP_DIGITS, separator: '-' },
]

/**
 * Known and accepted: reformatting from digits discards the caret position, so
 * editing mid-string sends the caret to the end. Preserving it means counting
 * digits before the caret and re-deriving an offset, which is not worth the
 * code for a 14-character field that is typed left to right in one pass.
 */
export function formatWhatsappNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, MAX_WHATSAPP_DIGITS)

  return SEGMENTS.map((segment) => {
    const part = digits.slice(segment.start, segment.end)

    return part === '' ? '' : segment.separator + part
  }).join('')
}
