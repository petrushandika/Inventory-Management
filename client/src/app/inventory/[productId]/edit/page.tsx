"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Inventory and Products share the same data model.
// Redirect to the Products edit page to avoid duplication.
const InventoryEditRedirect = () => {
  const router = useRouter();
  const { productId } = useParams<{ productId: string }>();

  useEffect(() => {
    router.replace(`/products/${productId}/edit`);
  }, [productId, router]);

  return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
    </div>
  );
};

export default InventoryEditRedirect;
