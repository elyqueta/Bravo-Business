export type ProductBadge = "Sale" | "Premium" | "Novo";
export type UserStatus = "active" | "inactive";

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ProductApi {
  id: string;
  categorySlug: string;
  name: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  img: string;
  badge?: ProductBadge | null;
  features?: string[] | null;
  gallery?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface CategoryApi {
  id: string;
  slug: string;
  label: string;
  icon?: string | null;
  prefix: string;
  anchor: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface UserApi {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "admin";
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}
export interface AuthResult {
  user: UserApi;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
}
export interface RefreshResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: string;
  };
}
export interface ProductListResponse extends ApiResponse<ProductApi[]> {
  pagination: Pagination;
}
export interface CategoryListResponse extends ApiResponse<CategoryApi[]> {
  count: number;
}
export interface CreateProductInput {
  categorySlug: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number | null;
  img: string;
  badge?: ProductBadge | null;
  features?: string[];
  gallery?: string[];
}
export interface CreateCategoryInput {
  label: string;
  icon?: string;
  prefix: string;
  anchor: string;
}
