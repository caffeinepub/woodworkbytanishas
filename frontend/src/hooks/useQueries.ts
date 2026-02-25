import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, UserProfile, CustomizationRequest, ContactFormSubmission, PaginatedProducts } from '../backend';

const PAGE_SIZE = 10n;

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Products ─────────────────────────────────────────────────────────────────

export function useListProductsPage(page: number) {
  const { actor, isFetching: actorFetching } = useActor();
  const offset = BigInt(page * Number(PAGE_SIZE));

  return useQuery<PaginatedProducts>({
    queryKey: ['listProductsPage', page],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listProducts(offset, PAGE_SIZE);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useFeaturedProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backward compatibility
export const useGetFeaturedProducts = useFeaturedProducts;

export function useGetProductById(productId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProductById(productId);
    },
    enabled: !!actor && !actorFetching && !!productId,
  });
}

// Fetches products filtered by category (uses getProducts backend call)
export function useGetProducts(category?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', category ?? null],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts(category ?? null);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listProductsPage'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, product }: { productId: string; product: Product }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(productId, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listProductsPage'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listProductsPage'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function useAnalyticsSummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalyticsSummary();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

// Alias for backward compatibility
export const useGetAnalyticsSummary = useAnalyticsSummary;

export function useProductsGroupedByCategory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['productsGroupedByCategory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProductsGroupedByCategory();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Customization Requests ────────────────────────────────────────────────────

export function useSubmitCustomizationRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CustomizationRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitCustomizationRequest(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });
}

export function useGetMostRecentCustomizationRequests(limit: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CustomizationRequest[]>({
    queryKey: ['customizationRequests', limit],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMostRecentCustomizationRequests(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Contact Form ──────────────────────────────────────────────────────────────

export function useSubmitContactForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: ContactFormSubmission) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitContactForm(submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });
}

export function useGetMostRecentContactFormSubmissions(limit: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ContactFormSubmission[]>({
    queryKey: ['contactFormSubmissions', limit],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMostRecentContactFormSubmissions(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Admin Role ────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}
