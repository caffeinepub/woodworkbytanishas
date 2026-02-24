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
export interface Product {
    id: ProductId;
    imageUrls: Array<ExternalBlob>;
    name: string;
    description: string;
    isActive: boolean;
    category: string;
    woodType: WoodType;
    finishInfo: string;
}
export interface ContactFormSubmission {
    name: string;
    email: string;
    message: string;
    timestamp: Time;
}
export type Time = bigint;
export interface CustomizationRequest {
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
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
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
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactFormSubmissions(): Promise<Array<ContactFormSubmission>>;
    getCustomizationRequests(): Promise<Array<CustomizationRequest>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getMangoWoodProductByIdInternal(productId: ProductId): Promise<Product>;
    getMangoWoodProductsInternal(category: string | null): Promise<Array<Product>>;
    getProductById(productId: ProductId): Promise<Product>;
    getProducts(category: string | null): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMangoWoodProductsInternal(): Promise<Array<Product>>;
    listProducts(): Promise<Array<Product>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactForm(submission: ContactFormSubmission): Promise<void>;
    submitCustomizationRequest(request: CustomizationRequest): Promise<void>;
    updateProduct(productId: ProductId, updatedProduct: Product): Promise<void>;
}
