import { cn } from '@/lib/utils'

/**
 * Every `focus-visible:`, `aria-invalid:` and `dark:` entry below exists to
 * neutralise a generated default from `src/components/ui/input.tsx`, which is
 * never hand-edited: the focus ring, the red `destructive` tint that
 * `FormControl`'s automatic `aria-invalid` would otherwise trigger, the radius,
 * the shadow and the dark-mode fill are all replaced here at the call site.
 */
export const carvedInputClasses = [
  'h-12 w-full rounded-none border-0 border-b-4 border-sertao-brown bg-bone-white',
  'px-0 py-0 shadow-none transition-none',
  'font-body text-lg text-carved-black md:text-lg placeholder:text-sertao-brown',
  'focus-visible:border-carved-black focus-visible:ring-0',
  'aria-invalid:border-carved-black aria-invalid:ring-0',
  'dark:bg-bone-white dark:aria-invalid:border-carved-black',
  'group-focus-within/field:border-carved-black',
].join(' ')

export const carvedLabelClasses = [
  'font-body text-lg text-sertao-brown',
  'group-focus-within/field:text-carved-black data-[error=true]:text-carved-black',
].join(' ')

export const carvedHelperClasses = 'font-body text-base text-sertao-brown'

export const carvedFieldItemClasses = 'group/field grid gap-1.5 text-left'

/** The rule is cut twice when the field is invalid, 3px below its own rule. */
export function carvedRuleWrapperClasses(invalid: boolean) {
  return cn('mt-0.5', invalid && 'border-b-2 border-carved-black pb-[3px]')
}
