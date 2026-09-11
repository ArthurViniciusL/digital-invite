import type { Config } from 'tailwindcss'

/**
 * "Cordel Arcade" theme extension.
 *
 * Every value below points at a CSS variable declared in `src/styles/globals.css`,
 * so the palette can be revalidated by the designer in one place without
 * touching this file. The English identifiers map to the Portuguese names used
 * in the design system document:
 *
 *   carved-black -> "Preto Entalhe"   (#1C1410) - strokes, illustrations, headline text
 *   bone-white   -> "Branco Osso"     (#F4EEDD) - backgrounds, text over dark surfaces
 *   sertao-brown -> "Marrom Sertao"   (#6B4226) - supporting details, button hover
 *
 * This file is loaded by Tailwind v4 through the `@config` directive at the top
 * of `src/styles/globals.css`.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'carved-black': 'var(--color-carved-black)',
        'bone-white': 'var(--color-bone-white)',
        'sertao-brown': 'var(--color-sertao-brown)',
      },
      fontFamily: {
        /**
         * Headings use "Xilosa".
         *
         * TODO(designer): the Xilosa font files have not been delivered yet, so
         * the stack currently falls through to a generic serif. Add the
         * `@font-face` declaration in `src/styles/globals.css` as soon as the
         * files arrive - no change is needed here.
         */
        title: 'var(--font-title-stack)',
        /** Body copy uses "Caveat", self-hosted through Fontsource. */
        body: 'var(--font-body-stack)',
      },
    },
  },
}

export default config
