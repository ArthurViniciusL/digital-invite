import { Users } from 'lucide-react';

const emptyTitle = 'Ninguém confirmou ainda';
const emptyHint = 'As confirmações aparecem aqui assim que os convidados preencherem o convite.';

export function RsvpTableEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Users aria-hidden className="text-muted-foreground size-8" />
      <p className="text-base font-medium">{emptyTitle}</p>
      <p className="text-muted-foreground text-sm">{emptyHint}</p>
    </div>
  );
}
