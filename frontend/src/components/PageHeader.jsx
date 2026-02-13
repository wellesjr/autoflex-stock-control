import { Button } from "@/components/ui/button";

export default function PageHeader({ title, subtitle, onRefresh, refreshing, right }) {
  return (
    <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      <div className="grid gap-2 sm:flex sm:items-center sm:justify-end">
        {right}
        {onRefresh ? (
          <Button variant="outline" onClick={onRefresh} disabled={refreshing} className="w-full sm:w-auto">
            {refreshing ? "Carregando..." : "Atualizar"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
