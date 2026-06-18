// Shared Tailwind class strings for the few elements repeated across pages
// (buttons, fields, banners). Keeps button contrast/states consistent
// without pulling in a component library.

export const linkAccent = "text-indigo-600 hover:text-indigo-700 transition-colors";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer";

export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 cursor-pointer";

export const btnSuccess =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 cursor-pointer";

export const btnDanger =
  "inline-flex items-center gap-1 text-sm text-red-600 transition-colors hover:text-red-700 cursor-pointer";

export const btnWarning =
  "inline-flex items-center gap-1 text-sm text-amber-600 transition-colors hover:text-amber-700 cursor-pointer";

export const fieldClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none";

export const labelClass = "mb-3 block text-sm text-slate-600";

export const errorBanner =
  "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700";

export const card = "rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm";
