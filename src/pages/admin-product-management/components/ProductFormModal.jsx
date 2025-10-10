import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ProductFormModal = ({ 
  isOpen = false, 
  onClose, 
  onSave, 
  product = null, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    sizes: [],
    colors: [],
    fit: '',
    occasions: [],
    status: 'active',
    image: ''
  });

  const [errors, setErrors] = useState({});
  const [customColor, setCustomColor] = useState('#000000');

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product?.sku || '',
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        sizes: product?.sizes || [],
        colors: product?.colors || [],
        fit: product?.fit || '',
        occasions: product?.occasions || [],
        status: product?.status || 'active',
        image: product?.image || ''
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: '',
        sizes: [],
        colors: [],
        fit: '',
        occasions: [],
        status: 'active',
        image: ''
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const sizeOptions = [
    { value: 'XS', label: 'Extra Small (XS)' },
    { value: 'S', label: 'Small (S)' },
    { value: 'M', label: 'Medium (M)' },
    { value: 'L', label: 'Large (L)' },
    { value: 'XL', label: 'Extra Large (XL)' },
    { value: 'XXL', label: 'Double XL (XXL)' },
    { value: 'XXXL', label: 'Triple XL (XXXL)' }
  ];

  const fitOptions = [
    { value: 'slim', label: 'Slim Fit' },
    { value: 'regular', label: 'Regular Fit' },
    { value: 'loose', label: 'Loose Fit' },
    { value: 'oversized', label: 'Oversized' }
  ];

  const occasionOptions = [
    { value: 'casual', label: 'Casual' },
    { value: 'office', label: 'Office' },
    { value: 'party', label: 'Party' },
    { value: 'sports', label: 'Sports' },
    { value: 'wedding', label: 'Wedding/Festival' },
    { value: 'travel', label: 'Travel' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ];

  const predefinedColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSizeChange = (size, checked) => {
    setFormData(prev => ({
      ...prev,
      sizes: checked 
        ? [...prev?.sizes, size]
        : prev?.sizes?.filter(s => s !== size)
    }));
  };

  const handleColorSelect = (color) => {
    if (!formData?.colors?.includes(color)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev?.colors, color]
      }));
    }
  };

  const handleColorRemove = (colorToRemove) => {
    setFormData(prev => ({
      ...prev,
      colors: prev?.colors?.filter(color => color !== colorToRemove)
    }));
  };

  const handleCustomColorAdd = () => {
    if (customColor && !formData?.colors?.includes(customColor)) {
      handleColorSelect(customColor);
    }
  };

  const handleOccasionChange = (occasion, checked) => {
    setFormData(prev => ({
      ...prev,
      occasions: checked 
        ? [...prev?.occasions, occasion]
        : prev?.occasions?.filter(o => o !== occasion)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.sku?.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (!formData?.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData?.price || parseFloat(formData?.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData?.sizes?.length === 0) {
      newErrors.sizes = 'At least one size must be selected';
    }

    if (formData?.colors?.length === 0) {
      newErrors.colors = 'At least one color must be selected';
    }

    if (!formData?.fit) {
      newErrors.fit = 'Fit type is required';
    }

    if (formData?.occasions?.length === 0) {
      newErrors.occasions = 'At least one occasion must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (validateForm()) {
      const productData = {
        ...formData,
        price: parseFloat(formData?.price),
        id: product?.id || Date.now()
      };
      
      onSave(productData);
    }
  };

  const handleClose = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      price: '',
      sizes: [],
      colors: [],
      fit: '',
      occasions: [],
      status: 'active',
      image: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-140px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="SKU"
                type="text"
                placeholder="Enter product SKU"
                value={formData?.sku}
                onChange={(e) => handleInputChange('sku', e?.target?.value)}
                error={errors?.sku}
                required
              />

              <Input
                label="Product Name"
                type="text"
                placeholder="Enter product name"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                error={errors?.name}
                required
              />

              <Input
                label="Price"
                type="number"
                placeholder="0.00"
                value={formData?.price}
                onChange={(e) => handleInputChange('price', e?.target?.value)}
                error={errors?.price}
                min="0"
                step="0.01"
                required
              />

              <Select
                label="Status"
                options={statusOptions}
                value={formData?.status}
                onChange={(value) => handleInputChange('status', value)}
                required
              />
            </div>

            <Input
              label="Description"
              type="text"
              placeholder="Enter product description (optional)"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
            />

            <Input
              label="Image URL"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData?.image}
              onChange={(e) => handleInputChange('image', e?.target?.value)}
              description="Enter a valid image URL for the product"
            />

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Available Sizes *
              </label>
              <CheckboxGroup error={errors?.sizes}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sizeOptions?.map((size) => (
                    <Checkbox
                      key={size?.value}
                      label={size?.label}
                      checked={formData?.sizes?.includes(size?.value)}
                      onChange={(e) => handleSizeChange(size?.value, e?.target?.checked)}
                    />
                  ))}
                </div>
              </CheckboxGroup>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Available Colors *
              </label>
              
              {/* Predefined Colors */}
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mb-4">
                {predefinedColors?.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-smooth hover-scale ${
                      formData?.colors?.includes(color) 
                        ? 'border-accent shadow-lg' 
                        : 'border-border hover:border-accent'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Custom Color */}
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e?.target?.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCustomColorAdd}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Custom Color
                </Button>
              </div>

              {/* Selected Colors */}
              {formData?.colors?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text-secondary">Selected Colors:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData?.colors?.map((color) => (
                      <div
                        key={color}
                        className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-full"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-mono">{color}</span>
                        <button
                          type="button"
                          onClick={() => handleColorRemove(color)}
                          className="text-text-secondary hover:text-destructive transition-smooth"
                          aria-label="Remove color"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {errors?.colors && (
                <p className="text-sm text-destructive mt-2">{errors?.colors}</p>
              )}
            </div>

            {/* Fit Type */}
            <Select
              label="Fit Type"
              options={fitOptions}
              value={formData?.fit}
              onChange={(value) => handleInputChange('fit', value)}
              error={errors?.fit}
              required
            />

            {/* Occasions */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Suitable Occasions *
              </label>
              <CheckboxGroup error={errors?.occasions}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {occasionOptions?.map((occasion) => (
                    <Checkbox
                      key={occasion?.value}
                      label={occasion?.label}
                      checked={formData?.occasions?.includes(occasion?.value)}
                      onChange={(e) => handleOccasionChange(occasion?.value, e?.target?.checked)}
                    />
                  ))}
                </div>
              </CheckboxGroup>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
            >
              {product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;