import { useCallback, useState } from 'react';

import { createRsvp, type CreateRsvpResult } from '@/lib/api/rsvp';
import { type RsvpFormData } from '@/lib/schemas/rsvpSchema';

export function useCreateRsvp() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (data: RsvpFormData): Promise<CreateRsvpResult> => {
    setIsSubmitting(true);
    const result = await createRsvp(data);
    setIsSubmitting(false);

    return result;
  }, []);

  return { submit, isSubmitting };
}
