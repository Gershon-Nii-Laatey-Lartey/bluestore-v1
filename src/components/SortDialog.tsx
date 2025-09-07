import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

interface SortOption {
  value: string;
  label: string;
}

interface SortDialogProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
}

export const SortDialog = ({ sortBy, onSortChange, sortOptions }: SortDialogProps) => {
  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || "Sort";

  return (
    <Select value={sortBy} onValueChange={onSortChange}>
      <SelectTrigger className="w-auto min-w-[120px] h-9">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-4 w-4" />
          <SelectValue>
            <span className="hidden md:inline">{currentSortLabel}</span>
            <span className="md:hidden">Sort</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
