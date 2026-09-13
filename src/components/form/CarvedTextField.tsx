import { type ComponentProps, type ReactNode } from 'react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import { TriangleAlert } from 'lucide-react';

import {
  carvedFieldItemClasses,
  carvedHelperClasses,
  carvedInputClasses,
  carvedLabelClasses,
  carvedRuleWrapperClasses,
} from '@/components/form/carvedFieldStyles';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function CarvedFieldMessage() {
  return (
    <div className="flex items-start gap-1.5">
      <TriangleAlert aria-hidden className="mt-1 size-4 shrink-0 text-carved-black" />
      <FormMessage className="font-body text-base text-carved-black" />
    </div>
  );
}

interface CarvedTextFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  inputMode?: ComponentProps<'input'>['inputMode'];
  autoComplete?: string;
  maxLength?: number;
  helper?: ReactNode;
  format?: (value: string) => string;
}

export function CarvedTextField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  inputMode,
  autoComplete,
  maxLength,
  helper,
  format,
}: CarvedTextFieldProps<TFieldValues>) {
  return (
    <FormField<TFieldValues>
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={carvedFieldItemClasses}>
          <FormLabel className={carvedLabelClasses}>{label}</FormLabel>
          {helper ? (
            <FormDescription className={carvedHelperClasses}>{helper}</FormDescription>
          ) : null}
          <div className={carvedRuleWrapperClasses(fieldState.invalid)}>
            <FormControl>
              <Input
                {...field}
                className={carvedInputClasses}
                placeholder={placeholder}
                inputMode={inputMode}
                autoComplete={autoComplete}
                maxLength={maxLength}
                onChange={(event) =>
                  field.onChange(format ? format(event.target.value) : event.target.value)
                }
              />
            </FormControl>
          </div>
          {fieldState.error ? <CarvedFieldMessage /> : null}
        </FormItem>
      )}
    />
  );
}
