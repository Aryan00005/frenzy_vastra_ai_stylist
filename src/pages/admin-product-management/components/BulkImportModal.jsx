import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BulkImportModal = ({ 
  isOpen = false, 
  onClose, 
  onImport, 
  isProcessing = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileSelect(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file?.type === 'text/csv') {
      setSelectedFile(file);
      setImportResults(null);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleFileInputChange = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileSelect(e?.target?.files?.[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    // Simulate file processing with progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Mock import results
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        const mockResults = {
          total: 150,
          successful: 142,
          failed: 8,
          errors: [
            { row: 15, error: 'Invalid SKU format' },
            { row: 23, error: 'Missing required field: name' },
            { row: 45, error: 'Invalid price value' },
            { row: 67, error: 'Duplicate SKU found' },
            { row: 89, error: 'Invalid color format' },
            { row: 101, error: 'Missing size information' },
            { row: 123, error: 'Invalid occasion value' },
            { row: 134, error: 'Image URL not accessible' }
          ]
        };
        
        setImportResults(mockResults);
        
        if (onImport) {
          onImport(mockResults);
        }
      }, 2000);
    } catch (error) {
      console.error('Import failed:', error);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setImportResults(null);
    setDragActive(false);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    // Mock CSV template download
    const csvContent = `SKU,Name,Description,Price,Sizes,Colors,Fit,Occasions,Status,Image
TSH001,"Classic White T-Shirt","Comfortable cotton t-shirt",19.99,"S,M,L,XL","#FFFFFF","regular","casual,office","active","https://example.com/tshirt1.jpg"
TSH002,"Navy Blue Polo","Premium polo shirt",29.99,"M,L,XL","#000080","slim","office,casual","active","https://example.com/polo1.jpg"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    window.URL?.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-modal max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-primary">Bulk Import Products</h2>
            <p className="text-sm text-text-secondary mt-1">
              Import multiple products from a CSV file
            </p>
          </div>
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
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Template Download */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="FileText" size={20} color="var(--color-accent)" />
              <div className="flex-1">
                <h3 className="font-medium text-primary mb-1">CSV Template</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Download our template to ensure your CSV file has the correct format and required columns.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  iconName="Download"
                  iconPosition="left"
                >
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${
              dragActive 
                ? 'border-accent bg-accent/5' :'border-border hover:border-accent/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <Icon name="Upload" size={48} color="var(--color-text-secondary)" className="mx-auto" />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="font-medium text-primary">{selectedFile?.name}</p>
                  <p className="text-sm text-text-secondary">
                    {(selectedFile?.size / 1024)?.toFixed(1)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    iconName="X"
                    iconPosition="left"
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-primary">
                    Drop your CSV file here, or click to browse
                  </p>
                  <p className="text-sm text-text-secondary">
                    Supports CSV files up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Processing...</span>
                <span className="text-sm text-text-secondary">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="space-y-4">
              <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                  <h3 className="font-medium text-primary">Import Complete</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{importResults?.total}</p>
                    <p className="text-sm text-text-secondary">Total Rows</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{importResults?.successful}</p>
                    <p className="text-sm text-text-secondary">Successful</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{importResults?.failed}</p>
                    <p className="text-sm text-text-secondary">Failed</p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {importResults?.errors?.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-3 flex items-center">
                    <Icon name="AlertTriangle" size={16} color="var(--color-destructive)" className="mr-2" />
                    Import Errors
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {importResults?.errors?.map((error, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">Row {error?.row}:</span>
                        <span className="text-text-secondary ml-2">{error?.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-primary mb-2">Import Guidelines</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Ensure your CSV file follows the template format</li>
              <li>• SKU values must be unique across all products</li>
              <li>• Sizes should be comma-separated (e.g., "S,M,L,XL")</li>
              <li>• Colors should be hex codes separated by commas</li>
              <li>• Image URLs should be publicly accessible</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {importResults ? 'Close' : 'Cancel'}
          </Button>
          
          {!importResults && (
            <Button
              variant="default"
              onClick={handleImport}
              disabled={!selectedFile || isProcessing}
              loading={isProcessing}
              iconName="Upload"
              iconPosition="left"
            >
              Import Products
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;