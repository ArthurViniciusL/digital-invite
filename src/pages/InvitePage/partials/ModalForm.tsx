import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const modalTitle = 'Convidado'
const modalBody = 'Em breve!'
const confirmButtonLabel = 'Confirmar'

interface ModalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ModalForm({ open, onOpenChange, onConfirm }: ModalFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'carved-1 gap-6 border-4 border-carved-black bg-bone-white ring-0',
          'px-6 py-10 text-center sm:px-10 sm:py-12',
        )}
      >
        <DialogClose asChild>
          <Button
            variant="xilo"
            size="icon-sm"
            className="absolute top-4 right-4 border-none hover:bg-amber-800"
          >
            <X />
          </Button>
        </DialogClose>

        <DialogHeader className="items-center gap-3">
          <DialogTitle className="font-title text-2xl text-carved-black sm:text-3xl">
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="font-body text-xl text-carved-black sm:text-2xl">
            {modalBody}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="m-0 flex-row justify-center gap-3 border-0 bg-transparent p-0">
          <Button variant="xilo" size="lg" onClick={onConfirm}>
            {confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
