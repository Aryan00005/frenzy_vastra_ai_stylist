import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnalyticsSummary = ({ 
  isExpanded = false, 
  onToggleExpanded 
}) => {
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const summaryStats = [
    {
      label: 'Total Products',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: 'Package'
    },
    {
      label: 'Active Products',
      value: '1,156',
      change: '+8%',
      trend: 'up',
      icon: 'CheckCircle'
    },
    {
      label: 'Low Stock',
      value: '23',
      change: '-15%',
      trend: 'down',
      icon: 'AlertTriangle'
    },
    {
      label: 'Revenue (30d)',
      value: '$45,678',
      change: '+23%',
      trend: 'up',
      icon: 'DollarSign'
    }
  ];

  const popularProducts = [
    {
      id: 1,
      name: 'Classic White T-Shirt',
      sku: 'TSH001',
      sales: 156,
      revenue: '$3,120',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'Navy Blue Polo',
      sku: 'POL002',
      sales: 134,
      revenue: '$4,020',
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      name: 'Black Casual Tee',
      sku: 'TSH003',
      sales: 128,
      revenue: '$2,560',
      image: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=100&h=100&fit=crop'
    },
    {
      id: 4,
      name: 'Gray Sports Shirt',
      sku: 'SPT004',
      sales: 112,
      revenue: '$3,360',
      image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=100&h=100&fit=crop'
    }
  ];

  const occasionPerformance = [
    { occasion: 'Casual', products: 456, sales: 2340, percentage: 35 },
    { occasion: 'Office', products: 234, sales: 1890, percentage: 28 },
    { occasion: 'Sports', products: 189, sales: 1456, percentage: 22 },
    { occasion: 'Party', products: 167, sales: 890, percentage: 15 }
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'var(--color-success)' : 'var(--color-destructive)';
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Summary Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="BarChart3" size={20} color="var(--color-accent)" />
          <h3 className="font-semibold text-primary">Analytics Summary</h3>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpanded}
          aria-label={isExpanded ? 'Collapse analytics' : 'Expand analytics'}
        >
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Button>
      </div>
      {/* Quick Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats?.map((stat) => (
            <div key={stat?.label} className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name={stat?.icon} size={16} color="var(--color-text-secondary)" />
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={getTrendIcon(stat?.trend)} 
                    size={12} 
                    color={getTrendColor(stat?.trend)} 
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{ color: getTrendColor(stat?.trend) }}
                  >
                    {stat?.change}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">{stat?.value}</p>
              <p className="text-sm text-text-secondary">{stat?.label}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Expanded Analytics */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Metric Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setSelectedMetric('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-smooth ${
                selectedMetric === 'overview' ?'border-accent text-accent' :'border-transparent text-text-secondary hover:text-primary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedMetric('products')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-smooth ${
                selectedMetric === 'products' ?'border-accent text-accent' :'border-transparent text-text-secondary hover:text-primary'
              }`}
            >
              Top Products
            </button>
            <button
              onClick={() => setSelectedMetric('occasions')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-smooth ${
                selectedMetric === 'occasions' ?'border-accent text-accent' :'border-transparent text-text-secondary hover:text-primary'
              }`}
            >
              Occasions
            </button>
          </div>

          {/* Metric Content */}
          <div className="p-4">
            {selectedMetric === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-primary mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <Icon name="Plus" size={16} color="var(--color-success)" />
                      <div>
                        <p className="text-sm font-medium text-primary">5 new products added</p>
                        <p className="text-xs text-text-secondary">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <Icon name="Edit" size={16} color="var(--color-accent)" />
                      <div>
                        <p className="text-sm font-medium text-primary">12 products updated</p>
                        <p className="text-xs text-text-secondary">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
                      <div>
                        <p className="text-sm font-medium text-primary">3 products low stock</p>
                        <p className="text-xs text-text-secondary">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-primary mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" fullWidth iconName="Plus" iconPosition="left">
                      Add New Product
                    </Button>
                    <Button variant="outline" size="sm" fullWidth iconName="Upload" iconPosition="left">
                      Bulk Import
                    </Button>
                    <Button variant="outline" size="sm" fullWidth iconName="Download" iconPosition="left">
                      Export Catalog
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'products' && (
              <div>
                <h4 className="font-medium text-primary mb-4">Top Performing Products (Last 30 Days)</h4>
                <div className="space-y-3">
                  {popularProducts?.map((product, index) => (
                    <div key={product?.id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 bg-accent/10 rounded-full text-xs font-bold text-accent">
                        {index + 1}
                      </div>
                      
                      <img
                        src={product?.image}
                        alt={product?.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/no_image.png';
                        }}
                      />
                      
                      <div className="flex-1">
                        <p className="font-medium text-primary">{product?.name}</p>
                        <p className="text-sm text-text-secondary">{product?.sku}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-primary">{product?.sales} sales</p>
                        <p className="text-sm text-text-secondary">{product?.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMetric === 'occasions' && (
              <div>
                <h4 className="font-medium text-primary mb-4">Performance by Occasion</h4>
                <div className="space-y-4">
                  {occasionPerformance?.map((item) => (
                    <div key={item?.occasion} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-primary">{item?.occasion}</span>
                        <span className="text-sm text-text-secondary">
                          {item?.products} products • {item?.sales} sales
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item?.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>{item?.percentage}% of total sales</span>
                        <span>${(item?.sales * 20)?.toLocaleString()} revenue</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSummary;