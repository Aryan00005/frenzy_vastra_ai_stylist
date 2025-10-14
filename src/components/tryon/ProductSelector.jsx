import React from 'react';

export const ProductSelector = ({
  products,
  selectedProduct,
  onProductSelect,
  selectedVariation,
  onVariationSelect
}) => {
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Product</h3>

        <div className="space-y-4">
          {categories.map(category => {
            const categoryProducts = products.filter(p => p.category === category);

            return (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {category}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {categoryProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => onProductSelect(product)}
                      className={`relative p-3 border-2 rounded-lg transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        ${product.base_price?.toFixed(2)}
                      </p>

                      {selectedProduct?.id === product.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProduct && selectedProduct.variations && selectedProduct.variations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Variations</h3>

          <div className="space-y-2">
            {selectedProduct.variations.map(variation => (
              <button
                key={variation.id}
                onClick={() => onVariationSelect(variation)}
                className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                  selectedVariation?.id === variation.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border border-gray-200"
                    style={{
                      backgroundColor: variation.color?.toLowerCase() || '#e5e7eb'
                    }}
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {variation.variation_name}
                    </p>

                    <p className="text-xs text-gray-500">
                      ${(selectedProduct.base_price + (variation.price_modifier || 0)).toFixed(2)}
                    </p>
                  </div>

                  {variation.stock_quantity > 0 && variation.is_available ? (
                    <span className="text-xs text-green-600 font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">
                      Out of Stock
                    </span>
                  )}

                  {selectedVariation?.id === variation.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
