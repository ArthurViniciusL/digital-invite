const RSVP_CONFIRMED_STORAGE_KEY = 'digital-invite:rsvp-confirmed';
const RSVP_CONFIRMED_STORAGE_VALUE = 'true';
const RSVP_NAME_STORAGE_KEY = 'digital-invite:rsvp-name';

export function readConfirmedFlag(): boolean {
  try {
    return window.localStorage.getItem(RSVP_CONFIRMED_STORAGE_KEY) === RSVP_CONFIRMED_STORAGE_VALUE;
  } catch {
    return false;
  }
}

export function writeConfirmedFlag(): boolean {
  try {
    window.localStorage.setItem(RSVP_CONFIRMED_STORAGE_KEY, RSVP_CONFIRMED_STORAGE_VALUE);
    return true;
  } catch {
    return false;
  }
}

export function readConfirmedName(): string | null {
  try {
    return window.localStorage.getItem(RSVP_NAME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeConfirmedName(name: string): boolean {
  try {
    window.localStorage.setItem(RSVP_NAME_STORAGE_KEY, name);
    return true;
  } catch {
    return false;
  }
}
