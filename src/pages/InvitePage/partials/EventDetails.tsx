import { Calendar, Clock, ExternalLink, MapPin, type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Title } from '@/components/typograph/Title';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const eventDetailsHeading = 'Sobre';
const gpsLinkLabel = 'Curiar no mapa';
const eventClosingMessage =
  'Guarde essa data com carinho: confirme sua presença e venha celebrar com a gente';

const eventDateLabel = 'Data';
const eventDateValue = '27 de setembro de 2026';
const eventTimeLabel = 'Horário';
const eventTimeValue = '11h30';
const eventVenueLabel = 'Local';
const eventVenueValue = 'Alto da Serra Recepções, Cuité';

const GPS_LINK_HREF = 'https://maps.app.goo.gl/xxoBYQV8dQhPRaQi8';

const panelVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const gpsVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: 0.15,
      ease: 'easeOut',
    },
  },
};

const closingMessageVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: 0.3,
      ease: 'easeOut',
    },
  },
};

interface FactRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function FactRow({ icon: Icon, label, value }: FactRowProps) {
  return (
    <div className="flex items-start gap-4">
      <Icon aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-sertao-brown" />
      <div className="text-left">
        <p className="font-title text-sm uppercase tracking-wide text-sertao-brown">{label}</p>
        <p className="font-body text-xl text-carved-black sm:text-2xl">{value}</p>
      </div>
    </div>
  );
}

interface GpsCallToActionProps {
  reduceMotion: boolean;
}

function GpsCallToAction({ reduceMotion }: GpsCallToActionProps) {
  return (
    <Button variant="xilo" size="lg" className="mt-2 self-center" asChild>
      <motion.a
        href={GPS_LINK_HREF}
        target="_blank"
        rel="noopener noreferrer"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true }}
        variants={gpsVariants}
      >
        <ExternalLink aria-hidden="true" data-icon="inline-start" />
        {gpsLinkLabel}
      </motion.a>
    </Button>
  );
}

export function EventDetails() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="flex w-full flex-col items-center gap-6 text-center">
      <Title as="h2" className="text-2xl leading-none text-carved-black sm:text-3xl">
        {eventDetailsHeading}
      </Title>
      <motion.div
        className={cn(
          'carved-2 flex w-full max-w-md flex-col items-center gap-6',
          'border-4 border-carved-black bg-bone-white px-6 py-10 sm:max-w-xl sm:px-12 sm:py-14',
        )}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true }}
        variants={panelVariants}
      >
        <div className="flex w-full flex-col gap-5">
          <FactRow icon={Calendar} label={eventDateLabel} value={eventDateValue} />
          <FactRow icon={Clock} label={eventTimeLabel} value={eventTimeValue} />
          <FactRow icon={MapPin} label={eventVenueLabel} value={eventVenueValue} />
        </div>
        <GpsCallToAction reduceMotion={reduceMotion} />
      </motion.div>
      <motion.p
        className="font-body text-xl text-carved-black sm:text-2xl"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true }}
        variants={closingMessageVariants}
      >
        {eventClosingMessage}
      </motion.p>
    </section>
  );
}
