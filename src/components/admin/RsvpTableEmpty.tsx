import { Users } from 'lucide-react';

const emptyTitle = 'Ninguém confirmou ainda';
const emptyHint = 'As confirmações aparecem aqui assim que os convidados preencherem o convite.';

export function RsvpTableEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Users aria-hidden className="size-8 text-sertao-brown" />
      <p className="font-title text-2xl text-carved-black">{emptyTitle}</p>
      <p className="font-body text-lg text-sertao-brown">{emptyHint}</p>
    </div>
  );
}
