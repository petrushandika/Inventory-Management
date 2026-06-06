"use client";

import { useGetProductsQuery } from "@/state/api";
import Header from "../(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "productId", headerName: "ID", width: 220 },
  { field: "name", headerName: "Product Name", flex: 1, minWidth: 160 },
  {
    field: "price",
    headerName: "Price",
    width: 120,
    type: "number",
    valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
  },
  {
    field: "rating",
    headerName: "Rating",
    width: 110,
    type: "number",
    valueFormatter: (value) => (value != null ? Number(value).toFixed(1) : "N/A"),
  },
  {
    field: "stockQuantity",
    headerName: "Stock Qty",
    width: 130,
    type: "number",
  },
];

const Inventory = () => {
  const { data: products, isError, isLoading } = useGetProductsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400 animate-pulse">
        Loading inventory...
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-500">
        Failed to fetch inventory. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Header name="Inventory" />
        <span className="text-sm text-gray-400">{products.length} items</span>
      </div>
      <div style={{ height: 600 }}>
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row.productId}
          checkboxSelection
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          className="bg-white shadow-sm rounded-xl border border-gray-100 !text-gray-700"
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9fafb",
              fontSize: "12px",
              fontWeight: 600,
            },
            "& .MuiDataGrid-cell": { fontSize: "13px" },
            border: "none",
          }}
        />
      </div>
    </div>
  );
};

export default Inventory;
