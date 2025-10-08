import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProductTable = ({ 
  products = [], 
  selectedProducts = [], 
  onProductSelect, 
  onSelectAll, 
  onEditProduct, 
  onDeleteProduct,
  sortConfig,
  onSort 
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (productId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded?.has(productId)) {
      newExpanded?.delete(productId);
    } else {
      newExpanded?.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) {
      return <Icon name="ArrowUpDown" size={14} color="var(--color-text-secondary)" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} color="var(--color-accent)" />
      : <Icon name="ArrowDown" size={14} color="var(--color-accent)" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'text-success', bg: 'bg-success/10', label: 'Active' },
      inactive: { color: 'text-warning', bg: 'bg-warning/10', label: 'Inactive' },
      draft: { color: 'text-text-secondary', bg: 'bg-muted', label: 'Draft' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color} ${config?.bg}`}>
        {config?.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    })?.format(price);
  };

  const isAllSelected = products?.length > 0 && selectedProducts?.length === products?.length;
  const isPartiallySelected = selectedProducts?.length > 0 && selectedProducts?.length < products?.length;

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="w-12 p-4">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isPartiallySelected}
                  onChange={onSelectAll}
                />
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => onSort('sku')}
                  className="flex items-center space-x-2 font-medium text-primary hover:text-accent transition-smooth"
                >
                  <span>SKU</span>
                  {getSortIcon('sku')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => onSort('name')}
                  className="flex items-center space-x-2 font-medium text-primary hover:text-accent transition-smooth"
                >
                  <span>Product Name</span>
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-primary">Sizes</span>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-primary">Colors</span>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-primary">Fit</span>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-primary">Occasions</span>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => onSort('price')}
                  className="flex items-center space-x-2 font-medium text-primary hover:text-accent transition-smooth"
                >
                  <span>Price</span>
                  {getSortIcon('price')}
                </button>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-primary">Status</span>
              </th>
              <th className="text-center p-4 w-24">
                <span className="font-medium text-primary">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product?.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                <td className="p-4">
                  <Checkbox
                    checked={selectedProducts?.includes(product?.id)}
                    onChange={(e) => onProductSelect(product?.id, e?.target?.checked)}
                  />
                </td>
                <td className="p-4">
                  <span className="font-mono text-sm text-primary">{product?.sku}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product?.image}
                      alt={product?.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                    <span className="font-medium text-primary">{product?.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {product?.sizes?.slice(0, 3)?.map((size) => (
                      <span key={size} className="px-2 py-1 bg-muted rounded text-xs font-medium">
                        {size}
                      </span>
                    ))}
                    {product?.sizes?.length > 3 && (
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                        +{product?.sizes?.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex space-x-1">
                    {product?.colors?.slice(0, 4)?.map((color) => (
                      <div
                        key={color}
                        className="w-6 h-6 rounded-full border-2 border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    {product?.colors?.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                        <span className="text-xs font-medium">+{product?.colors?.length - 4}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-text-secondary capitalize">{product?.fit}</span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {product?.occasions?.slice(0, 2)?.map((occasion) => (
                      <span key={occasion} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                        {occasion}
                      </span>
                    ))}
                    {product?.occasions?.length > 2 && (
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                        +{product?.occasions?.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-primary">{formatPrice(product?.price)}</span>
                </td>
                <td className="p-4">
                  {getStatusBadge(product?.status)}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditProduct(product)}
                      aria-label="Edit product"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteProduct(product?.id)}
                      aria-label="Delete product"
                    >
                      <Icon name="Trash2" size={16} color="var(--color-destructive)" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden">
        {products?.map((product) => (
          <div key={product?.id} className="border-b border-border last:border-b-0">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedProducts?.includes(product?.id)}
                  onChange={(e) => onProductSelect(product?.id, e?.target?.checked)}
                  className="mt-1"
                />
                
                <img
                  src={product?.image}
                  alt={product?.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-primary truncate">{product?.name}</h3>
                      <p className="text-sm text-text-secondary font-mono">{product?.sku}</p>
                      <p className="text-lg font-semibold text-primary mt-1">{formatPrice(product?.price)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      {getStatusBadge(product?.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(product?.id)}
                        aria-label={expandedRows?.has(product?.id) ? 'Collapse details' : 'Expand details'}
                      >
                        <Icon 
                          name={expandedRows?.has(product?.id) ? 'ChevronUp' : 'ChevronDown'} 
                          size={16} 
                        />
                      </Button>
                    </div>
                  </div>
                  
                  {expandedRows?.has(product?.id) && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">Sizes</p>
                        <div className="flex flex-wrap gap-1">
                          {product?.sizes?.map((size) => (
                            <span key={size} className="px-2 py-1 bg-muted rounded text-xs font-medium">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">Colors</p>
                        <div className="flex space-x-1">
                          {product?.colors?.map((color) => (
                            <div
                              key={color}
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">Fit & Occasions</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-1 bg-muted rounded text-xs font-medium capitalize">
                            {product?.fit}
                          </span>
                          {product?.occasions?.map((occasion) => (
                            <span key={occasion} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                              {occasion}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                          iconName="Edit"
                          iconPosition="left"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteProduct(product?.id)}
                          iconName="Trash2"
                          iconPosition="left"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {products?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Package" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">No products found</h3>
          <p className="text-text-secondary">Add your first product to get started with inventory management.</p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;