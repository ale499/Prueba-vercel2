import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Search, Plus, Edit, Trash2, ListFilter } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MenuItem } from '../types';
import ProductModal from '../components/products/ProductModal';
import apiClient from '../api/apiClient'; // 👈 nuevo

const fetchProducts = async (): Promise<MenuItem[]> => {
  const response = await apiClient.get('/articuloManufacturadoDetalle/todos');
  return response.data;
};

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(products.map(product => product.categoria.denominacion)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.denominacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoria.denominacion === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: MenuItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    setShowDeleteConfirm(null);
  };

  const handleSave = (productData: Partial<MenuItem>) => {
    if (selectedProduct) {
      setProducts(products.map(p =>
        p.id === selectedProduct.id ? { ...p, ...productData } : p
      ));
    } else {
      const newProduct: MenuItem = {
        id: Date.now().toString(),
        denominacion: productData.denominacion || '',
        categoriaId: productData.categoriaId || '',
        categoria: productData.categoria || { id: '', denominacion: '' },
        imagenes: productData.imagenes || [],
        precioVenta: productData.precioVenta || 0,
        descripcion: productData.descripcion || '',
        tiempoEstimadoMinutos: productData.tiempoEstimadoMinutos || 0,
        preparacion: productData.preparacion || '',
        detalles: productData.detalles || []
      };
      setProducts([...products, newProduct]);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">Productos</h1>
          <p className="text-gray-600">Gestiona el menú del restaurante</p>
        </div>
        <div className="flex gap-2">
          <Link to="/products/categories">
            <Button variant="outline" icon={<ListFilter size={18} />}>
              Categorías
            </Button>
          </Link>
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => {
              setSelectedProduct(undefined);
              setIsModalOpen(true);
            }}
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo de preparación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.denominacion}</div>
                      <div className="text-sm text-gray-500">{product.descripcion}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary" size="sm">
                      {product.categoria.denominacion}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.tiempoEstimadoMinutos} minutos</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${product.precioVenta.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {product.detalles.length} insumos
                    </div>
                    {product.detalles.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {product.detalles.slice(0, 2).map((detalle, index) => (
                          <div key={index}>
                            {detalle.cantidad} {(detalle.item as any).unidadMedida} de {(detalle.item as any).denominacion}
                          </div>
                        ))}
                        {product.detalles.length > 2 && (
                          <div>+{product.detalles.length - 2} más</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(product)}
                        aria-label="Editar producto"
                      />
                      {showDeleteConfirm === product.id ? (
                        <div className="flex space-x-1">
                          <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>
                            Eliminar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(null)}>
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} />}
                          onClick={() => setShowDeleteConfirm(product.id)}
                          aria-label="Eliminar producto"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(undefined);
        }}
        onSave={handleSave}
        product={selectedProduct}
        categories={categories}
      />
    </Layout>
  );
};

export default ProductsPage;
