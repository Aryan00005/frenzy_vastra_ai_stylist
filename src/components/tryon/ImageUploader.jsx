import React, { useRef, useState } from 'react';
import Button from '../ui/Button';

export const ImageUploader = ({ onImageSelect }) => {
  const fileInput = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const processSelectedFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    // Check if file type is valid
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileType = selectedFile.type.toLowerCase();
    let isValidType = false;
    
    for (let i = 0; i < allowedTypes.length; i++) {
      if (fileType === allowedTypes[i]) {
        isValidType = true;
        break;
      }
    }
    
    if (!isValidType) {
      alert('Please upload a valid image file (JPG, PNG, or WEBP)');
      return;
    }

    // Check file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxFileSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // Read the file and create preview
    const fileReader = new FileReader();
    
    fileReader.onload = (event) => {
      const imageDataUrl = event.target.result;
      setImagePreview(imageDataUrl);
      onImageSelect(selectedFile, imageDataUrl);
    };
    
    fileReader.onerror = () => {
      alert('Failed to read file. Please try again.');
    };
    
    fileReader.readAsDataURL(selectedFile);
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      processSelectedFile(selectedFile);
    }
  };

  const handleDragEvents = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setIsDragging(true);
    } else if (event.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const openFileDialog = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  const clearSelectedImage = () => {
    setImagePreview(null);
    if (fileInput.current) {
      fileInput.current.value = '';
    }
    onImageSelect(null, null);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!imagePreview ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEvents}
          onDragLeave={handleDragEvents}
          onDragOver={handleDragEvents}
          onDrop={handleFileDrop}
          onClick={openFileDialog}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                Drop your photo here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse (JPG, PNG, WEBP)
              </p>
            </div>

            <Button variant="outline" type="button">
              Choose File
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <Button onClick={openFileDialog} variant="outline" className="flex-1">
              Change Photo
            </Button>
            <Button onClick={clearSelectedImage} variant="outline" className="flex-1">
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
