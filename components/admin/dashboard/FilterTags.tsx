import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FilterTag {
  id: string;
  type: string;
  value: string | number;
  label: string;
}

interface FilterTagsProps {
  filterTags: FilterTag[];
  onRemoveTag: (id: string) => void;
  onClearAll: () => void;
}

export function FilterTags({ filterTags, onRemoveTag, onClearAll }: FilterTagsProps) {
  if (filterTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filterTags.map(tag => (
        <div
          key={tag.id}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium border border-gray-200"
        >
          {tag.label}
          <button
            onClick={() => onRemoveTag(tag.id)}
            className="hover:bg-gray-200 p-0.5 rounded-full transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="text-xs flex items-center gap-1 text-gray-600 border border-gray-300 hover:bg-gray-100 transition-colors"
        onClick={onClearAll}
      >
        <X className="h-3 w-3" /> Clear All
      </Button>
    </div>
  );
}
