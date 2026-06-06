"use client";

import { useGetUsersQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "userId", headerName: "ID", width: 220 },
  { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
  { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
];

const Users = () => {
  const { data: users, isError, isLoading } = useGetUsersQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400 animate-pulse">
        Loading users...
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-500">
        Failed to fetch users. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Header name="Users" />
        <span className="text-sm text-gray-400">{users.length} users</span>
      </div>
      <div style={{ height: 600 }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.userId}
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

export default Users;
