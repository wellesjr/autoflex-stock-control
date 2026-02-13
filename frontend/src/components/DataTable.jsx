import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DataTable({ columns, rows, emptyText = "No data" }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-2 md:hidden">
        {rows.length ? (
          rows.map((r) => (
            <div key={r.key} className="rounded-md border p-3">
              <div className="grid gap-2">
                {columns.map((c) => (
                  <div key={c.key} className="grid gap-1">
                    {c.header ? <div className="text-xs text-muted-foreground">{c.header}</div> : null}
                    <div className={c.className}>{r[c.key]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">{emptyText}</div>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((r) => (
                <TableRow key={r.key}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {r[c.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
