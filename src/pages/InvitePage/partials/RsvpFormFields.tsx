import { CarvedStepperField } from '@/components/form/CarvedStepperField';
import { CarvedTextField } from '@/components/form/CarvedTextField';
import { formatWhatsappNumber } from '@/lib/formatters/whatsappNumber';
import { type RsvpFormData } from '@/lib/schemas/rsvpSchema';

export function RsvpFormFields() {
  return (
    <div className="space-y-5 text-left">
      <CarvedTextField<RsvpFormData>
        name="name"
        label="Seu nome: *"
        placeholder="Nome e Sobrenome"
        autoComplete="name"
      />
      <CarvedTextField<RsvpFormData>
        name="whatsapp"
        label="Whatsapp: *"
        placeholder="(xx) x xxxx-xxxx"
        inputMode="tel"
        autoComplete="tel"
        format={formatWhatsappNumber}
      />
      <CarvedTextField<RsvpFormData>
        name="email"
        label="E-mail: *"
        placeholder="@gmail.com"
        inputMode="email"
        autoComplete="email"
      />
      <CarvedStepperField name="guestCount" label="Quantidade de convites" />
    </div>
  );
}
