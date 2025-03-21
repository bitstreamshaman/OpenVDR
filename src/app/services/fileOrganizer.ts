// src/services/fileOrganizer.ts
import * as Minio from 'minio';
import axios from 'axios';

interface MinioObject {
  name: string;
  size: number;
  lastModified: Date;
  etag?: string;
  prefix?: string;
}

interface FileMetadata {
  name: string;
  path: string;
  objectName: string;
  size: number;
  type: string;
  uploadDate: string;
}

interface OrganizationSuggestion {
  files: {
    objectName: string;
    suggestedFolder: string;
    originalFolder: string | null;
  }[];
  uniqueFolders: string[];
}

export class FileOrganizerService {
  private minioClient: Minio.Client;
  private bucketName: string;
  private ollamaEndpoint: string;
  private modelName: string;

  constructor() {
    // Initialize MinIO client
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.bucketName = process.env.MINIO_BUCKET_NAME || 'nextjs-uploads';
    this.ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    this.modelName = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';
  }

  /**
   * Get recent uploads that haven't been organized yet
   */
  async getRecentUploads(): Promise<FileMetadata[]> {
    const files: FileMetadata[] = [];
    
    // List all objects in the bucket
    const stream = this.minioClient.listObjects(this.bucketName, '', true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj: MinioObject) => {
        // Filter out already organized files (those in topic folders)
        // This assumes organized files are in folders created by the AI
        if (!obj.name || obj.name.includes('/_organized/')) {
          return;
        }
        
        files.push({
          name: obj.name.split('/').pop() ?? obj.name,
          path: obj.name,
          objectName: obj.name,
          size: obj.size,
          type: obj.name.split('.').pop() ?? '',
          uploadDate: obj.lastModified.toISOString(),
        });
      });
      
      stream.on('error', reject);
      
      stream.on('end', () => {
        resolve(files);
      });
    });
  }

  /**
   * Analyze file names and suggest organization
   */
  // Enhanced version of suggestOrganization with better debugging
async suggestOrganization(files: FileMetadata[]): Promise<OrganizationSuggestion> {
    console.log(`Attempting to organize ${files.length} files`);
    
    // If no files, return empty suggestion
    if (files.length === 0) {
      console.log('No files to organize');
      return { files: [], uniqueFolders: [] };
    }
  
    // Prepare a prompt for the Ollama model
    const fileNames = files.map(file => file.name).join('\n');
    const prompt = `
  I have the following files that need to be organized into topic folders for my Real Estate Deal:
  
  ${fileNames}
  
  For each file, suggest a single topic folder name where it should be placed.
  The folder name should be short (1-3 words), descriptive, and based solely on the filename.
  Use a consistent naming convention for similar files.
  Return the results in the following format without any additional explanation:
  
  filename1: folder_name
  filename2: folder_name
  (and so on for each file)
  `;
  
    console.log('Prompt for Ollama:', prompt);
  
    try {
      // Call the Ollama API
      console.log(`Calling Ollama API at ${this.ollamaEndpoint} with model ${this.modelName}`);
      const response = await axios.post(`${this.ollamaEndpoint}/api/generate`, {
        model: this.modelName,
        prompt: prompt,
        stream: false
      });
  
      // Parse the response
      const ollamaResponse = response.data.response;
      console.log('Raw Ollama response:', ollamaResponse);
      
      const suggestions: Record<string, string> = {};
      
      // Extract filename: folder pairs from the response
      const lines = ollamaResponse.split('\n');
      console.log(`Splitting response into ${lines.length} lines`);
      
      for (const line of lines) {
        console.log(`Processing line: "${line}"`);
        // More robust parsing - look for first colon only
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const filename = line.substring(0, colonIndex).trim();
          const folder = line.substring(colonIndex + 1).trim();
          
          // Normalize folder name
          const normalizedFolder = folder.replace(/\s+/g, '-').toLowerCase();
          suggestions[filename] = normalizedFolder;
          
          console.log(`Parsed suggestion: "${filename}" → "${normalizedFolder}"`);
        }
      }
  
      // Verify we got suggestions for all files
      for (const file of files) {
        if (!suggestions[file.name]) {
          console.warn(`No suggestion found for file: ${file.name}`);
        }
      }
  
      // Create the organization suggestion
      const result: OrganizationSuggestion = {
        files: [],
        uniqueFolders: []
      };
  
      // Map the suggestions to files
      for (const file of files) {
        const suggestedFolder = suggestions[file.name] || 'uncategorized';
        
        result.files.push({
          objectName: file.objectName,
          suggestedFolder: suggestedFolder,
          originalFolder: file.path.includes('/') 
            ? file.path.substring(0, file.path.lastIndexOf('/')) 
            : null
        });
        
        if (!result.uniqueFolders.includes(suggestedFolder)) {
          result.uniqueFolders.push(suggestedFolder);
        }
      }
  
      console.log('Organization suggestion result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error calling Ollama:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
      }
      
      // Fallback: put everything in 'uncategorized'
      console.log('Using fallback categorization');
      return {
        files: files.map(file => ({
          objectName: file.objectName,
          suggestedFolder: 'uncategorized',
          originalFolder: file.path.includes('/') 
            ? file.path.substring(0, file.path.lastIndexOf('/')) 
            : null
        })),
        uniqueFolders: ['uncategorized']
      };
    }
  }
  /**
   * Apply organization by moving files in MinIO
   */
  async applyOrganization(organization: OrganizationSuggestion): Promise<boolean> {
    try {
      // Keep track of organization actions for potential reverting
      const organizationActions = [];

      for (const file of organization.files) {
        const newObjectName = `_organized/${file.suggestedFolder}/${file.objectName.split('/').pop()}`;
        
        // Copy the object to the new location
        await this.minioClient.copyObject(
          this.bucketName,
          newObjectName,
          `${this.bucketName}/${file.objectName}`
        );
        
        // Store the action for history
        organizationActions.push({
          originalPath: file.objectName,
          newPath: newObjectName,
          timestamp: new Date().toISOString()
        });
        
        // Remove the original object
        await this.minioClient.removeObject(this.bucketName, file.objectName);
      }

      // Store the organization history in a special metadata file
      await this.storeOrganizationHistory(organizationActions);
      
      return true;
    } catch (error) {
      console.error('Error applying organization:', error);
      return false;
    }
  }

  /**
   * Store organization history for potential reverting
   */
  private async storeOrganizationHistory(actions: any[]): Promise<void> {
    try {
      // Get existing history if it exists
      let history: any[] = [];
      
      try {
        const historyData = await this.minioClient.getObject(
          this.bucketName, 
          '_metadata/organization_history.json'
        );
        
        // Convert stream to string
        let historyStr = '';
        await new Promise((resolve, reject) => {
          historyData.on('data', chunk => { historyStr += chunk; });
          historyData.on('end', resolve);
          historyData.on('error', reject);
        });
        
        history = JSON.parse(historyStr);
      } catch (err) {
        // File doesn't exist yet, start with empty history
        history = [];
      }
      
      // Add new actions to history
      history.push({
        batch: new Date().toISOString(),
        actions: actions
      });
      
      // Save updated history
      const historyBuffer = Buffer.from(JSON.stringify(history, null, 2));
      
      await this.minioClient.putObject(
        this.bucketName,
        '_metadata/organization_history.json',
        historyBuffer,
        historyBuffer.length,
        { 'Content-Type': 'application/json' }
      );
    } catch (error) {
      console.error('Error storing organization history:', error);
    }
  }

  /**
   * Revert the most recent organization action
   */
  async revertLastOrganization(): Promise<boolean> {
    try {
      // Get the organization history
      const historyData = await this.minioClient.getObject(
        this.bucketName, 
        '_metadata/organization_history.json'
      );
      
      // Convert stream to string
      let historyStr = '';
      await new Promise((resolve, reject) => {
        historyData.on('data', chunk => { historyStr += chunk; });
        historyData.on('end', resolve);
        historyData.on('error', reject);
      });
      
      const history = JSON.parse(historyStr);
      
      if (history.length === 0) {
        return false;
      }
      
      // Get the most recent batch
      const lastBatch = history.pop();
      
      // Revert each action in the batch
      for (const action of lastBatch.actions) {
        // Copy back to original location
        await this.minioClient.copyObject(
          this.bucketName,
          action.originalPath,
          `${this.bucketName}/${action.newPath}`
        );
        
        // Remove the organized file
        await this.minioClient.removeObject(this.bucketName, action.newPath);
      }
      
      // Update the history
      const historyBuffer = Buffer.from(JSON.stringify(history, null, 2));
      
      await this.minioClient.putObject(
        this.bucketName,
        '_metadata/organization_history.json',
        historyBuffer,
        historyBuffer.length,
        { 'Content-Type': 'application/json' }
      );
      
      return true;
    } catch (error) {
      console.error('Error reverting organization:', error);
      return false;
    }
  }

  /**
   * Move a file to a different folder
   */
  async moveFile(objectName: string, targetFolder: string): Promise<boolean> {
    try {
      const fileName = objectName.split('/').pop();
      const newObjectName = `_organized/${targetFolder}/${fileName}`;
      
      // Copy the object to the new location
      await this.minioClient.copyObject(
        this.bucketName,
        newObjectName,
        `${this.bucketName}/${objectName}`
      );
      
      // Remove the original object
      await this.minioClient.removeObject(this.bucketName, objectName);
      
      // Update history
      await this.storeOrganizationHistory([{
        originalPath: objectName,
        newPath: newObjectName,
        timestamp: new Date().toISOString(),
        action: 'manual-move'
      }]);
      
      return true;
    } catch (error) {
      console.error('Error moving file:', error);
      return false;
    }
  }
}

export default new FileOrganizerService();