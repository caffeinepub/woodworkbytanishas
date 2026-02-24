import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Product, CustomizationRequest, ContactFormSubmission, UserRole, UserProfile } from '../backend';

// User Profile
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
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

// User Role
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserRole>({
    queryKey: ['callerUserRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      console.log('🔍 [useGetCallerUserRole] Fetching role...');
      if (!actor) {
        console.error('❌ [useGetCallerUserRole] Actor not available');
        throw new Error('Actor not available');
      }
      
      try {
        const role = await actor.getCallerUserRole();
        console.log('✅ [useGetCallerUserRole] Role fetched:', role);
        return role;
      } catch (error: any) {
        console.error('❌ [useGetCallerUserRole] Error fetching role:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Admin Check - Direct method
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      console.log('🔍 [useIsCallerAdmin] Checking admin status...');
      if (!actor) {
        console.error('❌ [useIsCallerAdmin] Actor not available');
        throw new Error('Actor not available');
      }
      
      try {
        const isAdmin = await actor.isCallerAdmin();
        console.log('✅ [useIsCallerAdmin] Admin status:', isAdmin);
        return isAdmin;
      } catch (error: any) {
        console.error('❌ [useIsCallerAdmin] Error checking admin status:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Products - Public
export function useGetProducts(category: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductById(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProductById(productId);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useGetFeaturedProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Products - Admin
export function useListProducts() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Product[]>({
    queryKey: ['allProducts'],
    queryFn: async () => {
      console.log('🔍 [useListProducts] Fetching products...');
      if (!actor) {
        console.error('❌ [useListProducts] Actor not available');
        throw new Error('Actor not available');
      }
      
      try {
        const products = await actor.listProducts();
        console.log('✅ [useListProducts] Products fetched:', products.length);
        return products;
      } catch (error: any) {
        console.error('❌ [useListProducts] Error:', error);
        
        // Parse backend error messages
        let errorMessage = 'Failed to fetch products';
        if (error?.message) {
          if (error.message.includes('Unauthorized') || error.message.includes('admin')) {
            errorMessage = 'Authorization error. Please try logging out and logging back in.';
          } else if (error.message.includes('trapped explicitly:')) {
            const trapMatch = error.message.match(/trapped explicitly: (.+)/i);
            errorMessage = trapMatch ? trapMatch[1] : error.message;
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      console.log('🔍 [useAddProduct] Starting product addition...');
      console.log('🔍 [useAddProduct] Actor available:', !!actor);
      console.log('🔍 [useAddProduct] Identity available:', !!identity);
      console.log('🔍 [useAddProduct] Principal:', identity?.getPrincipal().toString());

      if (!actor) {
        const error = new Error('Actor not available - please ensure you are logged in');
        console.error('❌ [useAddProduct] Actor not available');
        throw error;
      }

      if (!identity) {
        const error = new Error('Not authenticated - please log in first');
        console.error('❌ [useAddProduct] Identity not available');
        throw error;
      }

      try {
        console.log('🚀 [useAddProduct] Calling backend addProduct...');
        const result = await actor.addProduct(product);
        console.log('✅ [useAddProduct] Product added successfully');
        return result;
      } catch (error: any) {
        console.error('❌ [useAddProduct] Backend error:', error);
        
        // Parse backend trap messages
        let errorMessage = 'Failed to add product';
        if (error?.message) {
          const message = error.message;
          if (message.includes('Unauthorized') || message.includes('Only admins')) {
            errorMessage = 'Authorization error. Please try logging out and logging back in. If the issue persists, contact support.';
          } else if (message.includes('trapped explicitly:')) {
            const trapMatch = message.match(/trapped explicitly: (.+)/i);
            errorMessage = trapMatch ? trapMatch[1] : message;
          } else {
            errorMessage = message;
          }
        }
        
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).originalError = error;
        throw enhancedError;
      }
    },
    onSuccess: () => {
      console.log('✅ [useAddProduct] Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, updatedProduct }: { productId: string; updatedProduct: Product }) => {
      console.log('🔍 [useUpdateProduct] Starting product update...');

      if (!actor) {
        throw new Error('Actor not available - please ensure you are logged in');
      }

      if (!identity) {
        throw new Error('Not authenticated - please log in first');
      }

      try {
        const result = await actor.updateProduct(productId, updatedProduct);
        console.log('✅ [useUpdateProduct] Product updated successfully');
        return result;
      } catch (error: any) {
        console.error('❌ [useUpdateProduct] Backend error:', error);
        
        let errorMessage = 'Failed to update product';
        if (error?.message) {
          const message = error.message;
          if (message.includes('Unauthorized') || message.includes('Only admins')) {
            errorMessage = 'Authorization error. Please try logging out and logging back in.';
          } else if (message.includes('trapped explicitly:')) {
            const trapMatch = message.match(/trapped explicitly: (.+)/i);
            errorMessage = trapMatch ? trapMatch[1] : message;
          } else {
            errorMessage = message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      console.log('🔍 [useDeleteProduct] Starting product deletion...');

      if (!actor) {
        throw new Error('Actor not available - please ensure you are logged in');
      }

      if (!identity) {
        throw new Error('Not authenticated - please log in first');
      }

      try {
        const result = await actor.deleteProduct(productId);
        console.log('✅ [useDeleteProduct] Product deleted successfully');
        return result;
      } catch (error: any) {
        console.error('❌ [useDeleteProduct] Backend error:', error);
        
        let errorMessage = 'Failed to delete product';
        if (error?.message) {
          const message = error.message;
          if (message.includes('Unauthorized') || message.includes('Only admins')) {
            errorMessage = 'Authorization error. Please try logging out and logging back in.';
          } else if (message.includes('trapped explicitly:')) {
            const trapMatch = message.match(/trapped explicitly: (.+)/i);
            errorMessage = trapMatch ? trapMatch[1] : message;
          } else {
            errorMessage = message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

// Customization Requests
export function useSubmitCustomizationRequest() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (request: CustomizationRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitCustomizationRequest(request);
    },
  });
}

// Contact Form
export function useSubmitContactForm() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (submission: ContactFormSubmission) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitContactForm(submission);
    },
  });
}
