import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { rsvpSchema, type RsvpFormData, type RsvpFormInput } from '@/lib/schemas/rsvpSchema';
import { RsvpFormFields } from './RsvpFormFields';

const modalTitle = 'Convidado';
// const modalIntro = '{{copy: rsvp_modal_intro}}'
const confirmButtonLabel = 'Confirmar';
const closeButtonLabel = 'Fechar';

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

interface ModalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: RsvpFormData) => void;
}

export function ModalForm({ open, onOpenChange, onConfirm }: ModalFormProps) {
  const form = useForm<RsvpFormInput, unknown, RsvpFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: emptyForm,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'carved-1 gap-6 border-4 border-carved-black bg-bone-white ring-0',
          'max-h-[90dvh] overflow-y-auto px-5 py-8 sm:max-w-md sm:px-8 sm:py-10',
        )}
      >
        <CloseModalButton />

        <DialogHeader className="items-center gap-3">
          <DialogTitle className="font-title text-2xl text-carved-black sm:text-3xl">
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => {
              void form.handleSubmit(onConfirm)(event);
            }}
            className="space-y-6"
          >
            <RsvpFormFields />
            <DialogFooter className="m-0 flex-row justify-center gap-3 border-0 bg-transparent p-0">
              <Button
                variant="xilo"
                type="submit"
                className="h-14 w-full text-base sm:w-auto sm:px-8"
              >
                {confirmButtonLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
