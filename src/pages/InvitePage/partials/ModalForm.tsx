import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCreateRsvp } from '@/hooks/useCreateRsvp';
import { writeConfirmedFlag, writeConfirmedName } from '@/lib/rsvp/confirmationStorage';
import { rsvpSchema, type RsvpFormData, type RsvpFormInput } from '@/lib/schemas/rsvpSchema';
import { CalendarStep } from './CalendarStep';
import { GuestStep } from './GuestStep';

const guestStepTitle = 'Convidado';
const calendarStepTitle = 'Calendário';
const closeButtonLabel = 'Fechar';
const duplicateEmailMessage = 'Esse e-mail já confirmou presença.';
const submitErrorMessage = 'Não deu pra confirmar agora. Tente de novo.';

const STEP_FORM = 'form';
const STEP_CALENDAR = 'calendar';

type RsvpModalStep = typeof STEP_FORM | typeof STEP_CALENDAR;

const emptyForm: RsvpFormInput = {
  name: '',
  whatsapp: '',
  email: '',
  guestCount: 1,
};

function CloseModalButton() {
  return (
    <DialogClose asChild>
      <Button
        variant="xilo"
        size="icon-sm"
        aria-label={closeButtonLabel}
        className="absolute top-4 right-4 size-11 border-none hover:bg-sertao-brown hover:text-bone-white"
      >
        <X aria-hidden />
      </Button>
    </DialogClose>
  );
}

function useRsvpModalFlow(
  onConfirm: (data: RsvpFormData) => void,
  onOpenChange: (open: boolean) => void,
) {
  const [step, setStep] = useState<RsvpModalStep>(STEP_FORM);
  const [confirmedData, setConfirmedData] = useState<RsvpFormData | null>(null);
  const { submit, isSubmitting } = useCreateRsvp();

  const sendRsvp = useCallback(
    async (data: RsvpFormData) => {
      const result = await submit(data);

      if (result.ok) {
        writeConfirmedFlag();
        writeConfirmedName(data.name);
        setConfirmedData(data);
        setStep(STEP_CALENDAR);
        return;
      }

      toast.error(result.reason === 'duplicate_email' ? duplicateEmailMessage : submitErrorMessage);
    },
    [submit],
  );

  const confirmValid = useCallback(
    (data: RsvpFormData) => {
      void sendRsvp(data);
    },
    [sendRsvp],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (isSubmitting) {
        return;
      }

      if (!next && confirmedData !== null) {
        onConfirm(confirmedData);
      }

      onOpenChange(next);
    },
    [confirmedData, isSubmitting, onConfirm, onOpenChange],
  );

  const requestClose = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  return {
    step,
    isSubmitting,
    confirmValid,
    requestClose,
    handleOpenChange,
  };
}

interface ModalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: RsvpFormData) => void;
}

export function ModalForm({ open, onOpenChange, onConfirm }: ModalFormProps) {
  const form = useForm<RsvpFormInput, unknown, RsvpFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: emptyForm,
    mode: 'onTouched',
  });
  const { step, isSubmitting, confirmValid, requestClose, handleOpenChange } = useRsvpModalFlow(
    onConfirm,
    onOpenChange,
  );
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (step === STEP_CALENDAR) {
      titleRef.current?.focus();
    }
  }, [step]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'carved-1 gap-6 border-4 border-carved-black bg-bone-white ring-0',
          'max-h-[90dvh] overflow-y-auto px-5 py-8 sm:max-w-md sm:px-8 sm:py-10',
        )}
      >
        <CloseModalButton />

        <DialogHeader className="items-center gap-3">
          <DialogTitle
            ref={titleRef}
            tabIndex={-1}
            className="font-title text-2xl text-carved-black outline-none sm:text-3xl"
          >
            {step === STEP_FORM ? guestStepTitle : calendarStepTitle}
          </DialogTitle>
        </DialogHeader>

        {step === STEP_FORM ? (
          <GuestStep form={form} onValid={confirmValid} isSubmitting={isSubmitting} />
        ) : (
          <CalendarStep onClose={requestClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
