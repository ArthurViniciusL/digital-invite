import { TriangleAlert } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

const errorTitle = 'Não deu pra carregar as confirmações';
const errorHint = 'Verifique sua conexão e recarregue a página para tentar de novo.';

export function RsvpLoadError() {
  return (
    <Card role="alert">
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <TriangleAlert aria-hidden className="text-destructive size-8" />
        <p className="text-base font-medium">{errorTitle}</p>
        <p className="text-muted-foreground text-sm">{errorHint}</p>
      </CardContent>
    </Card>
  );
}
