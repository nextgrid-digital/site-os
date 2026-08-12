import { cn } from '@/lib/utils';

export function EvidenceTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[280px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col}
                className="px-2 py-2 text-[10px] font-semibold tracking-wide text-white/40 uppercase"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className="border-b border-white/6 last:border-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${index}-${cellIndex}`}
                  className={cn('px-2 py-2.5 align-top text-white/75',
                    cellIndex === 0 && 'font-medium text-white/90'
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
