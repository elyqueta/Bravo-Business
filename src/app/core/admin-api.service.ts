import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import {
  ApiResponse,
  CategoryApi,
  CategoryListResponse,
  CreateCategoryInput,
  CreateProductInput,
  ProductApi,
  ProductListResponse,
} from "./api.models";

@Injectable({ providedIn: "root" })
export class AdminApiService {
  private readonly base = environment.apiUrl;
  constructor(private readonly http: HttpClient) {}
  products(search = ""): Observable<ProductListResponse> {
    let params = new HttpParams().set("page", 1).set("limit", 100);
    if (search) params = params.set("search", search);
    return this.http.get<ProductListResponse>(`${this.base}/products`, {
      params,
    });
  }
  productById(id: string): Observable<ApiResponse<ProductApi>> {
    return this.http.get<ApiResponse<ProductApi>>(`${this.base}/products/${id}`);
  }
  createProduct(
    input: CreateProductInput | FormData,
  ): Observable<ApiResponse<ProductApi>> {
    return this.http.post<ApiResponse<ProductApi>>(
      `${this.base}/products`,
      input,
    );
  }
  updateProduct(
    id: string,
    input: Partial<CreateProductInput> | FormData,
  ): Observable<ApiResponse<ProductApi>> {
    return this.http.patch<ApiResponse<ProductApi>>(
      `${this.base}/products/${id}`,
      input,
    );
  }
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }
  categories(): Observable<CategoryListResponse> {
    return this.http.get<CategoryListResponse>(`${this.base}/categories`);
  }
  createCategory(
    input: CreateCategoryInput,
  ): Observable<ApiResponse<CategoryApi>> {
    return this.http.post<ApiResponse<CategoryApi>>(
      `${this.base}/categories`,
      input,
    );
  }
  updateCategory(
    id: string,
    input: Partial<CreateCategoryInput>,
  ): Observable<ApiResponse<CategoryApi>> {
    return this.http.patch<ApiResponse<CategoryApi>>(
      `${this.base}/categories/${id}`,
      input,
    );
  }
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }
}
