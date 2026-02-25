import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AnalyticsSummary {
    totalProducts: bigint;
    recentContactSubmissions: Array<ContactFormSubmission>;
    totalCustomizationRequests: bigint;
    recentCustomizationRequests: Array<CustomizationRequest>;
    productsByCategory: Array<[string, Array<Product>]>;
    inactiveProducts: bigint;
    totalContactSubmissions: bigint;
    activeProducts: bigint;
}
export type Time = bigint;
export type ImageId = Uint8Array;
export interface ContactFormSubmission {
    id: string;
    name: string;
    email: string;
    message: string;
    timestamp: Time;
}
export interface CustomizationRequest {
    id: string;
    status: string;
    name: string;
    referenceImageUrl?: ExternalBlob;
    productType: string;
    email: string;
    message: string;
    timestamp: Time;
    phone: string;
    woodType: WoodType;
    dimensions: string;
}
export type ProductId = string;
export interface PaginatedProducts {
    total: bigint;
    products: Array<Product>;
}
export interface Product {
    id: ProductId;
    whatsappMessage?: string;
    imageUrls: Array<ImageId>;
    name: string;
    description: string;
    isActive: boolean;
    category: string;
    woodType: WoodType;
    finishInfo: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WoodType {
    lineRange = "lineRange",
    acaciaWood = "acaciaWood",
    mangoWood = "mangoWood",
    customisedProducts = "customisedProducts"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAnalyticsSummary(): Promise<AnalyticsSummary>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getMostRecentContactFormSubmissions(limit: bigint): Promise<Array<ContactFormSubmission>>;
    getMostRecentCustomizationRequests(limit: bigint): Promise<Array<CustomizationRequest>>;
    getProductById(productId: ProductId): Promise<Product>;
    getProducts(category: string | null): Promise<Array<Product>>;
    getProductsGroupedByCategory(): Promise<Array<[string, Array<Product>]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listProducts(offset: bigint, limit: bigint): Promise<PaginatedProducts>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactForm(submission: ContactFormSubmission): Promise<string>;
    submitCustomizationRequest(request: CustomizationRequest): Promise<void>;
    updateProduct(productId: ProductId, updatedProduct: Product): Promise<void>;
}
