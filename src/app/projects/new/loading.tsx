export default function NewProjectLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f1e8] px-6 text-slate-950">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-7 text-center shadow-xl">
        <span
          aria-hidden="true"
          className="size-10 animate-spin rounded-full border-4 border-emerald-700 border-r-transparent"
        />
        <div>
          <p className="text-base font-semibold">Designing your form</p>
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">
            We are asking PPIO to choose the best questions, field types,
            validation, and layout.
          </p>
        </div>
      </div>
    </main>
  );
}
