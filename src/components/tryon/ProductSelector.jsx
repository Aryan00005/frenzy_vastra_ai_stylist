import React from 'react';

export const ProductSelector = ({
  products,
  selectedProduct,
  onProductSelect,
  selectedVariation,
  onVariationSelect
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Available</h3>
          <p className="text-sm text-gray-600">Demo products will load automatically</p>
        </div>
      </div>
    );
  }

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1 w-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Select Product
          </h3>
        </div>

        <div className="space-y-6">
          {categories.map(category => {
            const categoryProducts = products.filter(p => p.category === category);

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent"></div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {category}
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-l from-pink-200 to-transparent"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {categoryProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => onProductSelect(product)}
                      className={`group relative p-3 rounded-xl transition-all duration-300 ${
                        selectedProduct?.id === product.id
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 scale-105'
                          : 'bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                        />
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>

                      <p className={`text-sm font-semibold truncate transition-colors ${
                        selectedProduct?.id === product.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {product.name}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs font-bold ${
                          selectedProduct?.id === product.id ? 'text-white/90' : 'text-purple-600'
                        }`}>
                          ${product.base_price?.toFixed(2)}
                        </p>

                        {selectedProduct?.id === product.id && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-150"></div>
                          </div>
                        )}
                      </div>

                      {selectedProduct?.id === product.id && (
                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <svg
                            className="w-4 h-4 text-purple-600"
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
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Choose Style
            </h3>
          </div>

          <div className="space-y-2">
            {selectedProduct.variations.map(variation => (
              <button
                key={variation.id}
                onClick={() => onVariationSelect(variation)}
                className={`group w-full p-3 rounded-xl transition-all duration-300 text-left ${
                  selectedVariation?.id === variation.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                    : 'bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative w-12 h-12 rounded-lg overflow-hidden ${
                      selectedVariation?.id === variation.id
                        ? 'ring-2 ring-white shadow-lg'
                        : 'border-2 border-gray-300'
                    }`}
                    style={{
                      background: variation.color?.toLowerCase() || '#e5e7eb'
                    }}
                  >
                    {/* Color pattern overlay */}
                    <div className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)`
                      }}
                    ></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${
                      selectedVariation?.id === variation.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {variation.variation_name}
                    </p>

                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-xs font-bold ${
                        selectedVariation?.id === variation.id ? 'text-white/90' : 'text-purple-600'
                      }`}>
                        ${(selectedProduct.base_price + (variation.price_modifier || 0)).toFixed(2)}
                      </p>
                      
                      {variation.price_modifier > 0 && (
                        <span className={`text-xs ${
                          selectedVariation?.id === variation.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          (+${variation.price_modifier})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {variation.stock_quantity > 0 && variation.is_available ? (
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedVariation?.id === variation.id ? 'bg-white' : 'bg-green-500'
                        } animate-pulse`}></div>
                        <span className={`text-xs font-medium ${
                          selectedVariation?.id === variation.id ? 'text-white' : 'text-green-600'
                        }`}>
                          In Stock
                        </span>
                      </div>
                    ) : (
                      <span className={`text-xs font-medium ${
                        selectedVariation?.id === variation.id ? 'text-white/70' : 'text-red-600'
                      }`}>
                        Out of Stock
                      </span>
                    )}

                    {selectedVariation?.id === variation.id && (
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-purple-600"
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
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
