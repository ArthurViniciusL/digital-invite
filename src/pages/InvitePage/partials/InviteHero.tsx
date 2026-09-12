import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Title } from '@/components/typograph/Title'
import { cn } from '@/lib/utils'

/**
 * All copy below is draft placeholder text, not final wording — see the
 * `{{copy: ...}}` slots in openspec/changes/add-invite-hero-section/design.md.
 */
const heroTitleLine = 'Chegou a hora da festa!'
const heroSubtitle = 'O cordel do Muri...'
const buntingAlt = 'Varal de bandeirinhas coloridas de festa junina'

const buntingVariants: Variants = {
  hidden: { y: -32, rotate: -2, opacity: 0 },
  visible: { y: 0, rotate: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

const panelVariants: Variants = {
  hidden: { scale: 1.08, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },
}

const subtitleVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, delay: 1.1 } },
}

interface MotionStageProps {
  reduceMotion: boolean
}

function HeroBunting({ reduceMotion }: MotionStageProps) {
  return (
    <motion.div
      className="relative z-10 w-full"
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
      variants={buntingVariants}
    >
      <img src="/assets/images/flag_001.svg" alt={buntingAlt} className="w-full" />
    </motion.div>
  )
}

function hoverUpAnimation() {
  return 'transition-all duration-300 active:scale-95 hover:scale-110 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]';
}

function HeroCenterpiece({ reduceMotion }: MotionStageProps) {
  return (
    <div className="relative flex w-full max-w-md items-center justify-center py-10 sm:max-w-xl">
      <img
        src="/assets/images/sun.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-4 h-28 w-28 opacity-90 sm:h-40 sm:w-40 animate-spin animation-duration-[30s]"
      />
      <img
        src="/assets/images/arcodeon.svg"
        alt=""
        aria-hidden="true"
        className={cn(
          'absolute -left-6 bottom-0 h-20 -rotate-12 sm:-left-10 sm:h-32',
          hoverUpAnimation(),
        )}
      />
      <img
        src="/assets/images/cactus_003.svg"
        alt=""
        aria-hidden="true"
        className={cn(
          'absolute -right-4 bottom-0 h-20 sm:-right-4 sm:h-30',
          hoverUpAnimation(),
        )}
      />
      <motion.div
        className={cn(
          'carved-1 relative z-10 border-4 border-carved-black bg-bone-white',
          'px-6 py-10 text-center sm:px-12 sm:py-14',
        )}
        initial={reduceMotion ? false : 'hidden'}
        animate="visible"
        variants={panelVariants}
      >
        <Title className="text-5xl leading-none text-carved-black sm:text-7xl">
          Muricarliton
        </Title>
        <div
          className={cn(
            'carved-3 absolute -bottom-5 -right-5 flex h-14 w-14 items-center justify-center',
            'border-4 border-carved-black bg-bone-white font-title text-2xl text-sertao-brown',
            'sm:-bottom-6 sm:-right-6 sm:h-20 sm:w-20 sm:text-3xl',
            hoverUpAnimation(),
          )}
        >
          50
        </div>
      </motion.div>
    </div>
  )
}

export function InviteHero() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section className="flex w-full flex-col items-center gap-6 text-center">
      <HeroBunting reduceMotion={reduceMotion} />
      <p className="font-body text-lg text-sertao-brown sm:text-xl">{heroTitleLine}</p>
      <HeroCenterpiece reduceMotion={reduceMotion} />
      <motion.p
        className="font-body text-xl text-carved-black sm:text-2xl"
        initial={reduceMotion ? false : 'hidden'}
        animate="visible"
        variants={subtitleVariants}
      >
        {heroSubtitle}
      </motion.p>
    </section>
  )
}
