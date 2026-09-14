import { type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { type RsvpFormData, type RsvpFormInput } from '@/lib/schemas/rsvpSchema';
import { RsvpFormFields } from './RsvpFormFields';

const confirmButtonLabel = 'Confirmar';
const submittingButtonLabel = 'Enviando...';

interface GuestStepProps {
  form: UseFormReturn<RsvpFormInput, unknown, RsvpFormData>;
  onValid: (data: RsvpFormData) => void;
  isSubmitting: boolean;
}

export function GuestStep({ form, onValid, isSubmitting }: GuestStepProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          void form.handleSubmit(onValid)(event);
        }}
        className="space-y-6"
      >
        <RsvpFormFields />
        <DialogFooter className="m-0 flex-row justify-center gap-3 border-0 bg-transparent p-0">
          <Button
            variant="xilo"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="h-14 w-full text-base sm:w-auto sm:px-8"
          >
            {isSubmitting ? submittingButtonLabel : confirmButtonLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
