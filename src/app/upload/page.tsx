// src/app/upload/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BulkUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadStats, setUploadStats] = useState({ processed: 0, total: 0 });
  
  // Check for status messages from the organization page
  const organizationComplete = searchParams?.get('organizationComplete') === 'true';
  const organizationSkipped = searchParams?.get('organizationSkipped') === 'true';
  
  // Display status message briefly
  useEffect(() => {
    if (organizationComplete || organizationSkipped) {
      const timer = setTimeout(() => {
        // Clear the URL parameters after a delay
        router.replace('/upload');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [organizationComplete, organizationSkipped, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Start upload immediately when files are dropped
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles);
    }
  }, []);

  // Handler for file selection
  const handleFileSelection = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    input.onchange = (e) => {
      if (e.target && (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files!.length > 0) {
        const files = Array.from((e.target as HTMLInputElement).files as FileList);
        handleUpload(files);
      }
    };
    
    input.click();
    setShowPopup(false);
  };
  
  // Handler for folder selection
  const handleFolderSelection = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    // Enable directory selection
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
    input.setAttribute('mozdirectory', '');
    
    input.onchange = (e) => {
      if (e.target && (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files!.length > 0) {
        const files = Array.from((e.target as HTMLInputElement).files as FileList);
        handleUpload(files);
      }
    };
    
    input.click();
    setShowPopup(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true,
    // Accept any file type
    accept: {}
  });

  const handleUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) {
      setError('No files selected for upload');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStats({ processed: 0, total: filesToUpload.length });
    
    try {
      let successCount = 0;
      
      // Upload files one by one
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const formData = new FormData();
        formData.append('file', file);
        
        // Add path information if available
        const filePath = (file as any).webkitRelativePath || (file as any).path || '';
        if (filePath) {
          formData.append('filePath', filePath);
        }
        
        try {
          await axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                // Calculate overall progress across all files
                // Each file contributes its portion to the overall progress
                const fileProgress = progressEvent.loaded / progressEvent.total;
                const overallProgress = ((i + fileProgress) / filesToUpload.length) * 100;
                setUploadProgress(Math.round(overallProgress));
              }
            }
          });
          
          successCount++;
        } catch (err: any) {
          console.error('Upload error for file:', file.name, err);
          // For large batches, we don't want to show individual errors
          // Just silently log them
        }
        
        // Update processed count
        setUploadStats(prev => ({
          ...prev,
          processed: i + 1
        }));
      }
      
      // Show the upload complete message
      setUploadComplete(true);
      
      // Redirect to the organization page after successful upload
      setTimeout(() => {
        router.push(`/organize?fromUpload=true&fileCount=${successCount}`);
      }, 2000);
      
    } catch (err) {
      setError('An error occurred during the upload process');
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Bulk File Upload</h1>
      
      {/* Organization success message */}
      {organizationComplete && (
        <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span>
            Files have been successfully organized into topic folders!
          </span>
        </div>
      )}
      
      {/* Organization skipped message */}
      {organizationSkipped && (
        <div className="p-4 mb-6 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
          <p>Original file structure has been preserved. No changes were made.</p>
        </div>
      )}
      
      {!uploading && !uploadComplete && (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed p-10 mb-6 text-center rounded-lg cursor-pointer ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-500">Drop the files here...</p>
          ) : (
            <div>
              <p className="mb-2">Drag and drop files or folders here, or select below</p>
              <p className="text-sm text-gray-500 mb-4">Upload will start automatically after selection</p>
              <button 
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopup(true);
                }}
              >
                Upload
              </button>
            </div>
          )}
        </div>
      )}

      {/* Popup for selecting upload type */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4 text-black">Choose Upload Type</h3>            
          <p className="mb-4 text-gray-600">Would you like to upload files or a folder?</p>
            <div className="flex space-x-4 justify-center">
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleFileSelection}
              >
                Files
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleFolderSelection}
              >
                Folder
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-500 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {uploading && (
        <div className="mb-6">
          {/* Upload Success Message */}
          {uploadComplete && (
            <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>
                Upload Successful! Files have been uploaded to MinIO. Redirecting to organization page...
              </span>
            </div>
          )}
          
          {/* Single progress bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                Uploading {uploadStats.processed} of {uploadStats.total} files
              </span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className="bg-blue-500 h-6 rounded-full transition-all duration-300 text-xs text-white flex items-center justify-center"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress > 10 ? `${uploadProgress}%` : ''}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Manual navigation to organization page */}
      {!uploading && !uploadComplete && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Already uploaded files? Organize them now.
          </p>
          <button
            onClick={() => router.push('/organize')}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Go to File Organization
          </button>
        </div>
      )}
    </div>
  );
}