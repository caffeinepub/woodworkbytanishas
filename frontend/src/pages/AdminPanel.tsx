import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useListProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import ProductForm from '../components/ProductForm';
import BulkProductImport from '../components/BulkProductImport';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Loader2, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../backend';

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: products, isLoading: productsLoading, error: productsError } = useListProducts();
  const { mutateAsync: addProduct } = useAddProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const isAuthenticated = !!identity;

  // Debug logging
  useEffect(() => {
    console.log('🔍 [AdminPanel] State:', {
      isAuthenticated,
      hasActor: !!actor,
      actorFetching,
      principal: identity?.getPrincipal().toString(),
      profileLoading,
      userProfile: userProfile?.name,
    });
  }, [isAuthenticated, actor, actorFetching, identity, profileLoading, userProfile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !actorFetching) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, actorFetching, navigate]);

  // Show loading while actor is initializing or checking authentication
  if (!isAuthenticated || actorFetching || profileLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-muted-foreground">
          {!isAuthenticated 
            ? 'Please log in...' 
            : actorFetching 
            ? 'Initializing admin panel...' 
            : 'Loading your profile...'}
        </p>
      </div>
    );
  }

  const handleAddProduct = async (product: Product) => {
    try {
      console.log('🔍 [AdminPanel] Adding product...');
      await addProduct(product);
      console.log('✅ [AdminPanel] Product added successfully');
      toast.success('Product added successfully!');
      setShowForm(false);
    } catch (error: any) {
      console.error('❌ [AdminPanel] Failed to add product:', error);
      toast.error(error?.message || 'Failed to add product');
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    if (editingProduct) {
      try {
        console.log('🔍 [AdminPanel] Updating product...');
        await updateProduct({ productId: editingProduct.id, updatedProduct: product });
        console.log('✅ [AdminPanel] Product updated successfully');
        toast.success('Product updated successfully!');
        setEditingProduct(undefined);
        setShowForm(false);
      } catch (error: any) {
        console.error('❌ [AdminPanel] Failed to update product:', error);
        toast.error(error?.message || 'Failed to update product');
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('🔍 [AdminPanel] Deleting product...');
        await deleteProduct(productId);
        console.log('✅ [AdminPanel] Product deleted successfully');
        toast.success('Product deleted successfully!');
      } catch (error: any) {
        console.error('❌ [AdminPanel] Failed to delete product:', error);
        toast.error(error?.message || 'Failed to delete product');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  // Category filter logic
  const categories = ['All', 'Mango Wood', 'Acacia Wood', 'Line Range', 'Customized Products'];
  const filteredProducts = products?.filter(product => {
    if (categoryFilter === 'All') return true;
    
    // Map category filter to woodType
    const woodTypeMap: { [key: string]: string } = {
      'Mango Wood': 'mangoWood',
      'Acacia Wood': 'acaciaWood',
      'Line Range': 'lineRange',
      'Customized Products': 'customisedProducts',
    };
    
    return product.woodType === woodTypeMap[categoryFilter];
  }) || [];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Logged in as: {userProfile?.name || identity?.getPrincipal().toString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Admin Access: <span className="font-semibold text-green-600">✓ Granted</span>
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
              <Plus size={20} />
              <span>Add Product</span>
            </Button>
          )}
        </div>

        {/* Error Display for Product List */}
        {productsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Products</AlertTitle>
            <AlertDescription>
              {(productsError as Error).message || 'Failed to load products. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Bulk Import Section - Show only if no products exist */}
        {!productsLoading && !productsError && (!products || products.length === 0) && (
          <BulkProductImport />
        )}

        {showForm && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <ProductForm
              product={editingProduct}
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Products</h2>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-card rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-[4/3] bg-muted">
                    {product.imageUrls[0] ? (
                      <img
                        src={product.imageUrls[0].getDirectURL()}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Category: {product.category} | Wood: {product.woodType}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="flex-1"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {categoryFilter === 'All' 
                  ? 'No products yet. Use the bulk import above or add products individually!' 
                  : `No products found in ${categoryFilter} category.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
