import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = { label: string; href?: string };

const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="flex items-center gap-1 text-sm mb-6">
    <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
      <Home className="w-3.5 h-3.5" />
    </Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        {item.href ? (
          <Link href={item.href} className="text-gray-400 hover:text-gray-600 transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-700 font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
