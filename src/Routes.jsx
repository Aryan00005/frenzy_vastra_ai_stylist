import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";

import NotFound from "pages/NotFound";
import Login from "pages/Login";
import Signup from "pages/Signup";
import AnalyticsDashboard from './pages/analytics-dashboard';
import ProductDetailModal from './pages/product-detail-modal';
import AdminProductManagement from './pages/admin-product-management';
import StyleRecommendations from './pages/style-recommendations';
import PhotoUploadAnalysis from './pages/photo-upload-analysis';
import UserSessionHistory from './pages/user-session-history';
import VirtualTryOnPage from "pages/virtual-tryon";
import TestClothSwap from "./pages/TestClothSwap";
const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><VirtualTryOnPage /></ProtectedRoute>} />
            <Route path="/virtual-tryon" element={<ProtectedRoute><VirtualTryOnPage /></ProtectedRoute>} />
            <Route path="/test-cloth-swap" element={<ProtectedRoute><TestClothSwap /></ProtectedRoute>} />
            <Route path="/analytics-dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/product-detail-modal" element={<ProtectedRoute><ProductDetailModal /></ProtectedRoute>} />
            <Route path="/admin-product-management" element={<ProtectedRoute><AdminProductManagement /></ProtectedRoute>} />
            <Route path="/style-recommendations" element={<ProtectedRoute><StyleRecommendations /></ProtectedRoute>} />
            <Route path="/photo-upload-analysis" element={<ProtectedRoute><PhotoUploadAnalysis /></ProtectedRoute>} />
            <Route path="/user-session-history" element={<ProtectedRoute><UserSessionHistory /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
