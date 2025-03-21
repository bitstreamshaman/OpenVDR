// src/app/organize/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface FileOrganization {
  objectName: string;
  suggestedFolder: string;
  originalFolder: string | null;
}

interface OrganizationSuggestion {
  files: FileOrganization[];
  uniqueFolders: string[];
}

export default function OrganizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizingSuggestion, setOrganizingSuggestion] = useState<OrganizationSuggestion | null>(null);
  const [organizationComplete, setOrganizationComplete] = useState(false);
  const [organizationInProgress, setOrganizationInProgress] = useState(false);

  // Edit state for folder assignments
  const [editedFolders, setEditedFolders] = useState<Record<string, string>>({});
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  // Check if we were redirected from an upload
  const fileCount = searchParams ? searchParams.get('fileCount') : null;
  const fromUpload = searchParams?.get('fromUpload') === 'true';
  
  // Load suggestions when component mounts
  useEffect(() => {
    if (fromUpload) {
      checkForUnorganizedFiles();
    }
  }, [fromUpload]);
  
  const checkForUnorganizedFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/organize');
      
      if (response.data.fileCount > 0) {
        setOrganizingSuggestion(response.data.suggestions);
        
        // Initialize edited folders with suggested ones
        const initialEditState: Record<string, string> = {};
        response.data.suggestions.files.forEach((file: FileOrganization) => {
          initialEditState[file.objectName] = file.suggestedFolder;
        });
        setEditedFolders(initialEditState);
      } else {
        setError('No files found to organize');
      }
    } catch (err) {
      console.error('Error checking for unorganized files:', err);
      setError('Failed to check for unorganized files');
    } finally {
      setLoading(false);
    }
  };
  
  const applyOrganization = async () => {
    try {
      setOrganizationInProgress(true);
      setError(null);
      
      if (!organizingSuggestion) {
        setError('No organization suggestion available');
        setOrganizationInProgress(false);
        return;
      }
      
      // Apply edited folders to the organization suggestion
      const updatedSuggestion = {
        ...organizingSuggestion,
        files: organizingSuggestion.files.map(file => ({
          ...file,
          suggestedFolder: editedFolders[file.objectName] || file.suggestedFolder
        }))
      };
      
      // Get all unique folders after edits
      const allFolders = new Set<string>();
      updatedSuggestion.files.forEach(file => {
        allFolders.add(file.suggestedFolder);
      });
      updatedSuggestion.uniqueFolders = Array.from(allFolders);
      
      const response = await axios.post('/api/organize', {
        organization: updatedSuggestion
      });
      
      setOrganizationComplete(true);
      
      // Reset state after a delay
      setTimeout(() => {
        router.push('/upload?organizationComplete=true');
      }, 3000);
    } catch (err) {
      console.error('Error applying organization:', err);
      setError('Failed to organize files');
    } finally {
      setOrganizationInProgress(false);
    }
  };
  
  const revertOrganization = async () => {
    try {
      setOrganizationInProgress(true);
      setError(null);
      
      await axios.put('/api/organize', {
        action: 'revert'
      });
      
      // Refresh unorganized files
      checkForUnorganizedFiles();
    } catch (err) {
      console.error('Error reverting organization:', err);
      setError('Failed to revert organization');
    } finally {
      setOrganizationInProgress(false);
    }
  };
  
  const handleFolderChange = (objectName: string, folder: string) => {
    setEditedFolders(prev => ({
      ...prev,
      [objectName]: folder
    }));
  };
  
  const createNewFolder = () => {
    if (!newFolderName.trim()) return;
    
    // Add the new folder to uniqueFolders
    setOrganizingSuggestion(prev => {
      if (!prev) return null;
      
      const normalizedFolderName = newFolderName.trim().toLowerCase().replace(/\s+/g, '-');
      
      if (prev.uniqueFolders.includes(normalizedFolderName)) {
        return prev; // Folder already exists
      }
      
      return {
        ...prev,
        uniqueFolders: [...prev.uniqueFolders, normalizedFolderName]
      };
    });
    
    setNewFolderName('');
    setCreatingFolder(false);
  };
  
  const keepOriginalStructure = () => {
    // Redirect back to upload page
    router.push('/upload?organizationSkipped=true');
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AI File Organization</h1>
      
      {fromUpload && fileCount && (
        <div className="p-4 mb-6 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
          <p>You've just uploaded {fileCount} file(s). Let's organize them!</p>
        </div>
      )}
      
      {loading && (
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3">Analyzing files...</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-500 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {/* Organization complete message */}
      {organizationComplete && (
        <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span>
            Files have been organized successfully! Redirecting...
          </span>
        </div>
      )}
      
      {/* Organization suggestion section */}
      {!loading && !organizationComplete && organizingSuggestion && (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">AI-Suggested File Organization</h2>
          
          <p className="mb-6">
            The AI suggests organizing your files into the following topic folders.
            You can edit the folder assignments before applying.
          </p>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Topic Folders:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {organizingSuggestion.uniqueFolders.map(folder => (
                <span 
                  key={folder}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {folder}
                </span>
              ))}
              
              {/* Create new folder button */}
              {!creatingFolder ? (
                <button
                  onClick={() => setCreatingFolder(true)}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Folder
                </button>
              ) : (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New folder name"
                    className="border rounded px-2 py-1 text-sm w-32"
                  />
                  <button
                    onClick={createNewFolder}
                    className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setCreatingFolder(false)}
                    className="ml-1 px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6 overflow-auto max-h-96">
            <h3 className="font-medium mb-2">File Organization:</h3>
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">File</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Original Folder</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Suggested Folder</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {organizingSuggestion.files.map((file) => (
                  <tr key={file.objectName} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      {file.objectName.split('/').pop()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {file.originalFolder || '(root)'}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={editedFolders[file.objectName] || file.suggestedFolder}
                        onChange={(e) => handleFolderChange(file.objectName, e.target.value)}
                      >
                        {organizingSuggestion.uniqueFolders.map(folder => (
                          <option key={folder} value={folder}>
                            {folder}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={keepOriginalStructure}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
              disabled={organizationInProgress}
            >
              Keep Original Structure
            </button>
            <button
              onClick={applyOrganization}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
              disabled={organizationInProgress}
            >
              {organizationInProgress ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Organizing...
                </>
              ) : (
                'Apply Organization'
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Manual organization actions */}
      {!loading && !organizationComplete && !organizingSuggestion && (
        <div className="text-center p-8 border rounded-lg">
          <p className="mb-6 text-gray-600">
            {error ? 
              'No files found to organize. Please upload files first.' : 
              'Click the button below to check for files that need organization.'
            }
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={checkForUnorganizedFiles}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              Check for Files to Organize
            </button>
            
            <button
              onClick={revertOrganization}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              disabled={loading}
            >
              Revert Last Organization
            </button>
            
            <Link href="/upload" className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
              Back to Upload
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}