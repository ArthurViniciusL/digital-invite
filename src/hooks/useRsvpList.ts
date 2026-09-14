import { useEffect, useState } from 'react';

import { fetchRsvpList } from '@/lib/api/rsvp';
import { type RsvpRecord } from '@/lib/schemas/rsvpSchema';

export type RsvpListError = 'unknown';

export function useRsvpList() {
  const [rsvpList, setRsvpList] = useState<RsvpRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<RsvpListError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRsvpList = async () => {
      const result = await fetchRsvpList();

      if (!isMounted) {
        return;
      }

      if (result.ok) {
        setRsvpList(result.records);
        setError(null);
      } else {
        setError(result.reason);
      }

      setIsLoading(false);
    };

    void loadRsvpList();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    rsvpList,
    isLoading,
    error,
  };
}
