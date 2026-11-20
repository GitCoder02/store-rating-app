import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export function SortHeader({ label, field, currentSort, onSort, className = '' }) {
  const isSorted = currentSort.field === field;
  const isAsc = isSorted && currentSort.order === 'ASC';

  return (
    <th
      scope="col"
      onClick={() => onSort(field)}
      className={`px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-slate-400">
          {isSorted ? (
            isAsc ? (
              <ArrowUp size={14} className="text-slate-900 stroke-[2.5]" />
            ) : (
              <ArrowDown size={14} className="text-slate-900 stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown size={13} className="opacity-40" />
          )}
        </span>
      </div>
    </th>
  );
}
