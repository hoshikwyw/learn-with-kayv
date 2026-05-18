"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { BookPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateCourseForm } from "./create-course-form";

export function CreateCourseDialog() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setFormKey((k) => k + 1);
    setOpen(nextOpen);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        render={
          <Button size="sm">
            <BookPlus className="size-4" />
            Create course
          </Button>
        }
      />

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-xl">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-base font-semibold">
                Create course
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                Add a new course to the school catalogue.
              </Dialog.Description>
            </div>
            <Dialog.Close
              render={
                <Button variant="ghost" size="icon" className="-mt-1 -mr-2 shrink-0">
                  <X className="size-4" />
                </Button>
              }
            />
          </div>

          <CreateCourseForm key={formKey} onSuccess={() => setOpen(false)} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
