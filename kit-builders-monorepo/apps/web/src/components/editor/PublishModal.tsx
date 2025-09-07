"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@kit/design-system";
import { TextField, Button } from "@kit/design-system";
export function PublishModal({
  open,
  onOpenChange,
  doc,
  diff,
  onConfirm,
}: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Publish changes</DialogTitle>
          <DialogDescription>
            Review summary before publishing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Summary</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
              {diff.added.length > 0 && <li>Added: {diff.added.join(", ")}</li>}
              {diff.removed.length > 0 && (
                <li>Removed: {diff.removed.join(", ")}</li>
              )}
              {diff.edited.length > 0 && (
                <li>Edited: {diff.edited.join(", ")}</li>
              )}
            </ul>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField label="SEO Title" defaultValue={doc.title} />
            <TextField label="SEO Description" defaultValue="" />
          </div>
          <TextField label="Slug" defaultValue={doc.slug} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-teal-600 text-white" onClick={onConfirm}>
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
