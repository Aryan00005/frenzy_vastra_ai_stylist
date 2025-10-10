import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PhotoUploadZone = ({ 
  onFileSelect, 
  selectedFile, 
  isUploading, 
  uploadProgress,
  error 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    if (files?.length > 0) {
      handleFileSelection(files?.[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e?.target?.files);
    if (files?.length > 0) {
      handleFileSelection(files?.[0]);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes?.includes(file?.type)) {
      onFileSelect(null, "Please select a JPG or PNG image file.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file?.size > maxSize) {
      onFileSelect(null, "File size must be less than 10MB.");
      return;
    }

    onFileSelect(file, null);
  };

  const handleBrowseClick = () => {
    fileInputRef?.current?.click();
  };

  const handleRemoveFile = () => {
    onFileSelect(null, null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-accent bg-accent/5'
              : error
              ? 'border-destructive bg-destructive/5' :'border-border bg-muted/30 hover:border-accent hover:bg-accent/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              error ? 'bg-destructive/10' : 'bg-accent/10'
            }`}>
              <Icon 
                name={error ? 'AlertCircle' : 'Upload'} 
                size={32} 
                color={error ? 'var(--color-destructive)' : 'var(--color-accent)'} 
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">
                Upload Your Photo
              </h3>
              <p className="text-text-secondary text-sm max-w-md">
                Drag and drop your photo here, or click to browse. We'll analyze your body type and size for personalized recommendations.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                variant="default"
                onClick={handleBrowseClick}
                iconName="Camera"
                iconPosition="left"
              >
                Choose Photo
              </Button>
              
              <div className="text-xs text-text-secondary text-center">
                <p>Supported: JPG, PNG</p>
                <p>Max size: 10MB</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected photo preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-primary truncate">
                    {selectedFile?.name}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatFileSize(selectedFile?.size)} • {selectedFile?.type}
                  </p>
                </div>
                
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0 ml-2"
                    aria-label="Remove photo"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                )}
              </div>
              
              {isUploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {!isUploading && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBrowseClick}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Replace Photo
              </Button>
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} color="var(--color-destructive)" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadZone;