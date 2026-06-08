import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type UserRole = "Admin" | "Manager" | "Staff";

export interface Product {
  productId: string;
  name: string;
  image?: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  minStock: number;
  categoryId?: string;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  minStock?: number;
  image?: string;
  categoryId?: string;
}

export interface UpdateProduct {
  productId: string;
  name?: string;
  price?: number;
  rating?: number;
  stockQuantity?: number;
  minStock?: number;
  image?: string;
  categoryId?: string;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummaryId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardStats {
  totalSalesAmount: number;
  totalSalesCount: number;
  totalPurchaseCost: number;
  totalPurchaseCount: number;
  totalExpenses: number;
  totalExpenseCount: number;
  productCount: number;
  userCount: number;
  lowStockCount: number;
  totalStockValue: number;
  last30DaysSales: number;
  last30DaysSalesCount: number;
  last30DaysPurchases: number;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
  stats: DashboardStats;
}

export interface User {
  userId: string;
  image?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface NewUser {
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

export interface UpdateUser {
  userId: string;
  name?: string;
  email?: string;
  role?: UserRole;
  image?: string;
}

export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  _count?: { Products: number };
}

export interface NewCategory {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategory {
  categoryId: string;
  name?: string;
  description?: string;
  color?: string;
}

export interface Supplier {
  supplierId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  _count?: { Purchases: number };
}

export interface NewSupplier {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplier {
  supplierId: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type OrderStatus = "Draft" | "Ordered" | "Received" | "Cancelled";

export interface PurchaseOrderItem {
  itemId: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  product?: Pick<Product, "productId" | "name" | "stockQuantity" | "price">;
}

export interface PurchaseOrder {
  orderId: string;
  supplierId?: string;
  status: OrderStatus;
  notes?: string;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  supplier?: Pick<Supplier, "supplierId" | "name">;
  items: PurchaseOrderItem[];
}

export interface NewPurchaseOrder {
  supplierId?: string;
  notes?: string;
  items: { productId: string; quantity: number; unitCost: number }[];
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses", "Categories", "Suppliers", "PurchaseOrders"],
  endpoints: (build) => ({
    login: build.mutation<{ user: User }, { username: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation<Product, UpdateProduct>({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (productId) => ({ url: `/products/${productId}`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    createUser: build.mutation<User, NewUser>({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    updateUser: build.mutation<User, UpdateUser>({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: build.mutation<void, string>({
      query: (userId) => ({ url: `/users/${userId}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    getCategories: build.query<Category[], string | void>({
      query: (search) => ({ url: "/categories", params: search ? { search } : {} }),
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<Category, NewCategory>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: build.mutation<Category, UpdateCategory>({
      query: ({ categoryId, ...body }) => ({ url: `/categories/${categoryId}`, method: "PUT", body }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: build.mutation<void, string>({
      query: (categoryId) => ({ url: `/categories/${categoryId}`, method: "DELETE" }),
      invalidatesTags: ["Categories"],
    }),
    getSuppliers: build.query<Supplier[], string | void>({
      query: (search) => ({ url: "/suppliers", params: search ? { search } : {} }),
      providesTags: ["Suppliers"],
    }),
    createSupplier: build.mutation<Supplier, NewSupplier>({
      query: (body) => ({ url: "/suppliers", method: "POST", body }),
      invalidatesTags: ["Suppliers"],
    }),
    updateSupplier: build.mutation<Supplier, UpdateSupplier>({
      query: ({ supplierId, ...body }) => ({ url: `/suppliers/${supplierId}`, method: "PUT", body }),
      invalidatesTags: ["Suppliers"],
    }),
    deleteSupplier: build.mutation<void, string>({
      query: (supplierId) => ({ url: `/suppliers/${supplierId}`, method: "DELETE" }),
      invalidatesTags: ["Suppliers"],
    }),
    getPurchaseOrders: build.query<PurchaseOrder[], OrderStatus | void>({
      query: (status) => ({ url: "/purchase-orders", params: status ? { status } : {} }),
      providesTags: ["PurchaseOrders"],
    }),
    getPurchaseOrder: build.query<PurchaseOrder, string>({
      query: (orderId) => `/purchase-orders/${orderId}`,
      providesTags: ["PurchaseOrders"],
    }),
    createPurchaseOrder: build.mutation<PurchaseOrder, NewPurchaseOrder>({
      query: (body) => ({ url: "/purchase-orders", method: "POST", body }),
      invalidatesTags: ["PurchaseOrders"],
    }),
    updatePurchaseOrder: build.mutation<PurchaseOrder, { orderId: string; status?: OrderStatus; notes?: string; supplierId?: string }>({
      query: ({ orderId, ...body }) => ({ url: `/purchase-orders/${orderId}`, method: "PUT", body }),
      invalidatesTags: ["PurchaseOrders", "Products", "DashboardMetrics"],
    }),
    deletePurchaseOrder: build.mutation<void, string>({
      query: (orderId) => ({ url: `/purchase-orders/${orderId}`, method: "DELETE" }),
      invalidatesTags: ["PurchaseOrders"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetExpensesByCategoryQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} = api;
