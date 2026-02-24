import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserRole,
  useGetCallerUserProfile,
  useListProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useQueries';
import ProductForm from '../components/ProductForm';
import BulkProductImport from '../components/BulkProductImport';
import { Button } from '../components/ui/button';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import type { Product } from '../backend';

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: userRole, isLoading: roleLoading, isFetched: roleFetched } = useGetCallerUserRole();
  const { data: products, isLoading: productsLoading } = useListProducts();
  const { mutateAsync: addProduct } = useAddProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const isAuthenticated = !!identity;
  const isAdmin = userRole === 'admin';

  // Show loading while actor is initializing or checking authentication
  if (!isAuthenticated || profileLoading || roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  // Only show access denied after all checks are complete
  if (profileFetched && roleFetched && !isAdmin) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have admin privileges. Contact the administrator for access.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Go to Home</Button>
      </div>
    );
  }

  const handleAddProduct = async (product: Product) => {
    await addProduct(product);
    setShowForm(false);
  };

  const handleUpdateProduct = async (product: Product) => {
    if (editingProduct) {
      await updateProduct({ productId: editingProduct.id, updatedProduct: product });
      setEditingProduct(undefined);
      setShowForm(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
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

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground">Admin Panel</h1>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
              <Plus size={20} />
              <span>Add Product</span>
            </Button>
          )}
        </div>

        {/* Bulk Import Section - Show only if no products exist */}
        {!productsLoading && (!products || products.length === 0) && (
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
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Products</h2>
          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
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
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
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
              <p className="text-muted-foreground">No products yet. Use the bulk import above or add products individually!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
