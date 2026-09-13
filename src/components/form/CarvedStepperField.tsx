import { useFormContext } from 'react-hook-form';
import { Minus, Plus } from 'lucide-react';

import { CarvedFieldMessage } from '@/components/form/CarvedTextField';
import {
  carvedFieldItemClasses,
  carvedInputClasses,
  carvedLabelClasses,
  carvedRuleWrapperClasses,
} from '@/components/form/carvedFieldStyles';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MAX_GUEST_COUNT, type RsvpFormData } from '@/lib/schemas/rsvpSchema';

const STEPPER_BUTTON_CLASSES = 'size-11';

function readCount(value: unknown) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.trunc(parsed) : 1;
}

function stepCount(value: unknown, delta: number) {
  return Math.min(MAX_GUEST_COUNT, Math.max(1, readCount(value) + delta));
}

interface CarvedStepperFieldProps {
  name: 'guestCount';
  label: string;
}

export function CarvedStepperField({ name, label }: CarvedStepperFieldProps) {
  const { setValue } = useFormContext<RsvpFormData>();

  return (
    <FormField<RsvpFormData>
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={carvedFieldItemClasses}>
          <FormLabel className={carvedLabelClasses}>{label}</FormLabel>
          <div className="mt-0.5 flex items-center gap-3">
            <Button
              variant="xilo"
              type="button"
              aria-label="Diminuir quantidade"
              className={STEPPER_BUTTON_CLASSES}
              disabled={readCount(field.value) <= 1}
              onClick={() => setValue(name, stepCount(field.value, -1), { shouldValidate: true })}
            >
              <Minus aria-hidden className="size-5" />
            </Button>
            <div className={cn(carvedRuleWrapperClasses(fieldState.invalid), 'mt-0')}>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  className={cn(carvedInputClasses, 'w-16 text-center')}
                />
              </FormControl>
            </div>
            <Button
              variant="xilo"
              type="button"
              aria-label="Aumentar quantidade"
              className={STEPPER_BUTTON_CLASSES}
              disabled={readCount(field.value) >= MAX_GUEST_COUNT}
              onClick={() => setValue(name, stepCount(field.value, 1), { shouldValidate: true })}
            >
              <Plus aria-hidden className="size-5" />
            </Button>
          </div>
          {fieldState.error ? <CarvedFieldMessage /> : null}
        </FormItem>
      )}
    />
  );
}
