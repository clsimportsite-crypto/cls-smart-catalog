import { clsx } from "clsx";

/** Assinatura da marca: o "CLS" em bloco ultramar + o nome do produto. */
export function Marca({ className, compacta = false }: { className?: string; compacta?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid h-8 w-11 place-items-center rounded-[9px] bg-ultramar font-display text-[15px] font-bold tracking-tight text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)]"
      >
        CLS
      </span>
      {!compacta && (
        <span className="font-display text-[17px] font-semibold leading-none tracking-tight text-tinta">
          Smart Catalog
        </span>
      )}
      <span className="sr-only">CLS Smart Catalog</span>
    </span>
  );
}
