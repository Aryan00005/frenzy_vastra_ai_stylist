import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AnalyticsDashboard from './pages/analytics-dashboard';
import ProductDetailModal from './pages/product-detail-modal';
import AdminProductManagement from './pages/admin-product-management';
import StyleRecommendations from './pages/style-recommendations';
import PhotoUploadAnalysis from './pages/photo-upload-analysis';
import UserSessionHistory from './pages/user-session-history';
import VirtualTryOnPage from "pages/virtual-tryon";
const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<VirtualTryOnPage />} />
        <Route path="/virtual-tryon" element={<VirtualTryOnPage />} />
        <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
        <Route path="/product-detail-modal" element={<ProductDetailModal />} />
        <Route path="/admin-product-management" element={<AdminProductManagement />} />
        <Route path="/style-recommendations" element={<StyleRecommendations />} />
        <Route path="/photo-upload-analysis" element={<PhotoUploadAnalysis />} />
        <Route path="/user-session-history" element={<UserSessionHistory />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
