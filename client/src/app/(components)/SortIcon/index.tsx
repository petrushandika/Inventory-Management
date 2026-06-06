import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { SortDir } from "@/lib/useSort";

type Props = { dir: SortDir; active: boolean };

const SortIcon = ({ dir, active }: Props) => {
  if (!active || !dir) return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-300 group-hover:text-gray-400 transition-colors" />;
  if (dir === "asc") return <ArrowUp className="w-3 h-3 ml-1 text-blue-500" />;
  return <ArrowDown className="w-3 h-3 ml-1 text-blue-500" />;
};

export default SortIcon;
