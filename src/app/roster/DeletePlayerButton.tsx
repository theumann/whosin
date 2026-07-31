"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { btnDanger, btnSecondary } from "@/lib/ui";
import { deletePlayerAction } from "./actions";

export function DeletePlayerButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnDanger}>
        <Trash2 size={14} /> Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Delete player"
            className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="mb-2 text-[22px] font-bold">Delete player?</h2>
            <p className="mb-6 text-slate-600">
              Are you sure you want to permanently delete <strong>{name}</strong> from the roster?
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className={btnSecondary}>
                Cancel
              </button>
              <form action={deletePlayerAction.bind(null, id)}>
                <button type="submit" className={btnDanger}>
                  <Trash2 size={14} /> Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
