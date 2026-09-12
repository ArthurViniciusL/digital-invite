import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { LottieLight } from 'lottie-react'
import { Button } from '@/components/ui/button'
import { ModalForm } from './ModalForm'

const confirmationButtonLabel = 'Bora confirmar presença'

const feedbackMessage = 'Tá confirmado {user_name}!'
const CONFETTI_SOURCE = '/assets/images/confetti.json'
const RSVP_CONFIRMED_STORAGE_KEY = 'digital-invite:rsvp-confirmed'
const RSVP_CONFIRMED_STORAGE_VALUE = 'true'

function readConfirmedFlag(): boolean {
  try {
    return window.localStorage.getItem(RSVP_CONFIRMED_STORAGE_KEY) === RSVP_CONFIRMED_STORAGE_VALUE
  } catch {
    return false
  }
}

function writeConfirmedFlag(): void {
  try {
    window.localStorage.setItem(RSVP_CONFIRMED_STORAGE_KEY, RSVP_CONFIRMED_STORAGE_VALUE)
  } catch {
    // Storage is denied in private mode and some in-app webviews; the confirmation
    // still holds for this session, only the next visit forgets it.
  }
}

const revealVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

interface MotionAwareProps {
  reduceMotion: boolean
}

interface ConfirmationButtonProps extends MotionAwareProps {
  onOpenModal: () => void
}

function ConfirmationButton({ reduceMotion, onOpenModal }: ConfirmationButtonProps) {
  return (
    <motion.div
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true }}
      variants={revealVariants}
    >
      <Button
        variant="xilo"
        size="lg"
        onClick={onOpenModal}
        className='w-78 h-24 text-lg'
      >
        {confirmationButtonLabel}
      </Button>
    </motion.div>
  )
}

function ConfettiLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <LottieLight
        src={CONFETTI_SOURCE}
        autoplay
        loop={false}
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        className="h-full w-full"
      />
    </div>
  )
}

interface SuccessStateProps extends MotionAwareProps {
  justConfirmed: boolean
}

function SuccessState({ reduceMotion, justConfirmed }: SuccessStateProps) {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (justConfirmed) {
      regionRef.current?.focus()
    }
  }, [justConfirmed])

  const shouldAnimate = justConfirmed && !reduceMotion

  return (
    <motion.div
      ref={regionRef}
      role="status"
      tabIndex={-1}
      className="outline-none"
      initial={shouldAnimate ? 'hidden' : false}
      animate="visible"
      variants={revealVariants}
    >
      {shouldAnimate && <ConfettiLayer />}
      <p className="relative z-10 font-body text-2xl text-carved-black sm:text-3xl">
        {feedbackMessage}
      </p>
    </motion.div>
  )
}

export function RsvpForm() {
  const reduceMotion = useReducedMotion() ?? false
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(() => readConfirmedFlag())
  const [justConfirmed, setJustConfirmed] = useState(false)

  const openModal = useCallback(() => setIsModalOpen(true), [])

  const confirm = useCallback(() => {
    writeConfirmedFlag()
    setHasConfirmed(true)
    setJustConfirmed(true)
    setIsModalOpen(false)
  }, [])

  return (
    <section className="relative flex min-h-48 w-full flex-col items-center justify-center gap-6 overflow-x-clip text-center sm:min-h-64">
      {hasConfirmed ? (
        <SuccessState reduceMotion={reduceMotion} justConfirmed={justConfirmed} />
      ) : (
        <ConfirmationButton reduceMotion={reduceMotion} onOpenModal={openModal} />
      )}
      <ModalForm open={isModalOpen} onOpenChange={setIsModalOpen} onConfirm={confirm} />
    </section>
  )
}
