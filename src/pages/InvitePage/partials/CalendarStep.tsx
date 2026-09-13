import { CalendarPlus } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BIRTHDAY_EVENT, buildGoogleCalendarUrl } from '@/lib/calendar/googleCalendarUrl';

const calendarMessage = 'Adicionar lembrete no calendário google?';
const acceptButtonLabel = 'SIM';
const declineButtonLabel = 'NÃO';
const newTabHint = 'Abre o Google Agenda em uma nova aba';

const CALENDAR_URL = buildGoogleCalendarUrl(BIRTHDAY_EVENT);

const stepVariants: Variants = {
  hidden: { y: 8, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

const answerButtonClassName = 'h-14 flex-1 text-base sm:flex-none sm:px-10';

interface CalendarStepProps {
  onClose: () => void;
}

export function CalendarStep({ onClose }: CalendarStepProps) {
  const reduceMotion = useReducedMotion() ?? false;

  const openCalendar = () => {
    window.open(CALENDAR_URL, '_blank', 'noopener');
    onClose();
  };

  return (
    <motion.div
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
      variants={stepVariants}
      className="flex flex-col items-center gap-6 text-center"
    >
      <CalendarPlus aria-hidden="true" className="h-10 w-10 shrink-0 text-sertao-brown" />

      <DialogDescription
        className={cn('font-body text-xl text-balance text-carved-black sm:text-2xl')}
      >
        {calendarMessage}
      </DialogDescription>

      <DialogFooter className="m-0 flex w-full flex-row justify-center gap-3 border-0 bg-transparent p-0">
        <Button
          variant="xilo"
          type="button"
          onClick={openCalendar}
          className={answerButtonClassName}
        >
          {acceptButtonLabel}
          <span className="sr-only">{newTabHint}</span>
        </Button>
        <Button variant="xilo" type="button" onClick={onClose} className={answerButtonClassName}>
          {declineButtonLabel}
        </Button>
      </DialogFooter>
    </motion.div>
  );
}
