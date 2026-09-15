export interface RsvpGuest {
  name: string;
  firstName: string;
  whatsappDigits: string;
  whatsappMasked: string;
  email: string;
  guestCount: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
  emailDomain: string;
}

export interface RsvpDbRow {
  nome: string;
  email: string;
  whatsapp: string;
  numero_pessoas: number;
}

export const dialogSelector = '[role="dialog"]';

export const successRegionSelector = '[role="status"]';

export const confettiSelector = `${successRegionSelector} [data-testid="rsvp-confetti"]`;

export const toastSelector = '[data-sonner-toast]';

export const insertAlias = 'insertRsvp';

export const rsvpEndpoint = '**/rest/v1/rsvp*';

export const rsvpText = {
  confirmationButton: 'Bora confirmar presença',
  guestStepTitle: 'Convidado',
  calendarStepTitle: 'Calendário',
  closeButton: 'Fechar',
  submitButton: 'Confirmar',
  submittingButton: 'Enviando...',
  decreaseButton: 'Diminuir quantidade',
  increaseButton: 'Aumentar quantidade',
  calendarAccept: 'SIM',
  calendarDecline: 'NÃO',
};

export const rsvpLabels = {
  name: 'Seu nome',
  whatsapp: 'Whatsapp',
  email: 'E-mail',
  guestCount: 'Quantidade de convites',
};

export const rsvpMessages = {
  nameRequired: 'Informe seu nome',
  nameMax: '{{copy: rsvp_error_name_max}}',
  whatsappRequired: '{{copy: rsvp_error_whatsapp_required}}',
  whatsappFormat: '{{copy: rsvp_error_whatsapp_format}}',
  emailInvalid: 'E-mail inválido',
  guestCountType: '{{copy: rsvp_error_guest_count_type}}',
  guestCountInt: '{{copy: rsvp_error_guest_count_int}}',
  guestCountMin: 'Mínimo de 1 pessoa',
  guestCountMax: '{{copy: rsvp_error_guest_count_max}}',
  duplicateEmail: 'Esse e-mail já confirmou presença.',
  submitError: 'Não deu pra confirmar agora. Tente de novo.',
  feedbackFallback: '{{copy: rsvp_feedback_fallback}}',
};

export const rsvpStorageKeys = {
  confirmed: 'digital-invite:rsvp-confirmed',
  name: 'digital-invite:rsvp-name',
};

export function feedbackFor(firstName: string): string {
  return `Tá confirmado, ${firstName}!`;
}

export function toExpectedRow(guest: RsvpGuest): RsvpDbRow {
  return {
    nome: guest.name.trim(),
    email: guest.email.trim().toLowerCase(),
    whatsapp: guest.whatsappMasked,
    numero_pessoas: guest.guestCount,
  };
}
