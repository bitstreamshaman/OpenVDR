// src/services/fileOrganizer.ts
import * as Minio from 'minio';
import { z } from 'zod';
import OpenAI from "openai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Define the schema for file organization
const FileOrganizationSchema = z.record(z.string(), z.string());

export class FileOrganizerService {
  private minioClient: Minio.Client;
  private openai: OpenAI;
  private bucketName: string;

  constructor() {
    // Initialize MinIO client
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.bucketName = process.env.MINIO_BUCKET_NAME || 'nextjs-uploads';
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
   * Analyze file names and suggest organization using OpenAI
   */
  async suggestOrganization(files: FileMetadata[]): Promise<OrganizationSuggestion> {
    console.log(`Attempting to organize ${files.length} files`);
    
    // If no files, return empty suggestion
    if (files.length === 0) {
      console.log('No files to organize');
      return { files: [], uniqueFolders: [] };
    }
  
    // Get just the file names for the prompt
    const fileNames = files.map(file => file.name);
    
    try {
      // Create the prompt with instructions for file organization
      const prompt = `
I have the following files that need to be organized into topic folders for my Real Estate Deal:
${fileNames.join('\n')}

For each file, suggest a single topic folder name where it should be placed. The folder name should be:
* Short (1-3 words)
* Descriptive
* Consistently named for similar types of documents

Return the result as a JSON object where each key is a filename and each value is the suggested folder name.

Include ALL files from the list above in your response. Format the response as a valid JSON object ONLY, with no additional text.
`;

      // Call the OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant that organizes files into logical folders. Respond with ONLY a JSON object, nothing else." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1 // Lower temperature for more consistent results
      });

      // Parse the JSON string response
      const responseContent = completion.choices[0].message.content || '{}';
      let fileOrganization;
      
      try {
        fileOrganization = JSON.parse(responseContent);
        // Validate with Zod schema
        fileOrganization = FileOrganizationSchema.parse(fileOrganization);
      } catch (parseError) {
        console.error("Failed to parse model response:", parseError);
        console.log("Raw response content:", responseContent);
        throw new Error("Failed to parse the API response as valid JSON");
      }
      
      // Verify that all files are included
      const missingFiles = fileNames.filter(file => !(file in fileOrganization));
      if (missingFiles.length > 0) {
        console.warn("Warning: The following files were not organized:", missingFiles);
        
        // For missing files, create placeholder folders based on filename patterns
        missingFiles.forEach(file => {
          fileOrganization[file] = this.categorizeFile(file);
        });
      }
      
      console.log("File organization suggestion:");
      console.log(JSON.stringify(fileOrganization, null, 2));
      
      // Check the quality of folder names and improve if needed
      const improvedOrganization = this.improveFolderNames(fileOrganization);
      
      // Create the organization suggestion
      const result: OrganizationSuggestion = {
        files: [],
        uniqueFolders: []
      };
      
      // Map the suggestions to files
      for (const file of files) {
        let suggestedFolder = improvedOrganization[file.name] || 'Uncategorized';
        
        // Normalize folder name (lowercase, replace spaces with hyphens)
        suggestedFolder = suggestedFolder.replace(/\s+/g, '-').toLowerCase();
        
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
      console.error('Error using OpenAI API:', error);
      
      // Use fallback categorization logic
      console.log('Using fallback categorization');
      return {
        files: files.map(file => ({
          objectName: file.objectName,
          suggestedFolder: this.categorizeFile(file.name).replace(/\s+/g, '-').toLowerCase(),
          originalFolder: file.path.includes('/') 
            ? file.path.substring(0, file.path.lastIndexOf('/')) 
            : null
        })),
        uniqueFolders: Array.from(new Set(files.map(file => 
          this.categorizeFile(file.name).replace(/\s+/g, '-').toLowerCase()
        )))
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
   * Function to categorize files based on filename patterns (fallback if API fails)
   */
  private categorizeFile(filename: string): string {
    if (filename.includes('1099')) return 'Tax Documents';
    if (filename.includes('Addendum')) return 'Contract Addendums';
    if (filename.includes('Affidavit')) return 'Legal Documents';
    if (filename.includes('Agent')) return 'Agent Communications';
    if (filename.includes('Appraisal')) return 'Property Valuation';
    if (filename.includes('Asbestos') || filename.includes('Inspection')) return 'Inspection Reports';
    if (filename.includes('Attorney')) return 'Legal Correspondence';
    if (filename.includes('Balance') || filename.includes('Statement')) return 'Financial Documents';
    if (filename.includes('Tenant') || filename.includes('Lease')) return 'Tenant Records';
    if (filename.includes('Insurance')) return 'Insurance Documents';
    if (filename.includes('Tax')) return 'Tax Documents';
    if (filename.includes('Title')) return 'Title Documents';
    if (filename.includes('Property')) return 'Property Documents';
    if (filename.includes('Loan')) return 'Loan Documents';
    if (filename.includes('HOA')) return 'HOA Documents';
    if (filename.includes('Utility')) return 'Utilities';
    if (filename.includes('Contract')) return 'Contracts';
    return 'Miscellaneous';
  }

  /**
   * Function to improve folder names for clarity and consistency
   */
  private improveFolderNames(organization: z.infer<typeof FileOrganizationSchema>) {
    const folderNameMap: Record<string, string> = {
      // Map inadequate folder names to better ones
      '1099': 'Tax Documents',
      'Forms': 'Tax Documents',
      'Addendum': 'Contract Addendums',
      'Emails': 'Communications',
      'Report': 'Reports',
      'Correspondence': 'Communications',
      'Financial': 'Financial Documents',
      'Statement': 'Financial Documents',
      'Loan': 'Loan Documents',
      'Insurance': 'Insurance Documents',
      'Tenant': 'Tenant Records',
      'HOA': 'HOA Documents',
      'Title': 'Title Documents',
      'Permits': 'Permits',
      'Inspection': 'Inspection Reports',
      'Legal': 'Legal Documents',
      'Utility': 'Utilities',
      'Tax': 'Tax Documents',
      'Property': 'Property Documents',
      'Contract': 'Contracts'
    };
    
    const improved = {...organization};
    
    // Replace any generic folder names with better alternatives
    Object.keys(improved).forEach(file => {
      const currentFolder = improved[file];
      if (folderNameMap[currentFolder]) {
        improved[file] = folderNameMap[currentFolder];
      }
    });
    
    // Ensure consistency for similar document types
    const fileGroups: { [key: string]: string[] } = {};
    Object.keys(improved).forEach(file => {
      const prefix = file.split('_')[0];
      if (!fileGroups[prefix]) {
        fileGroups[prefix] = [];
      }
      fileGroups[prefix].push(file);
    });
    
    // Make sure files with the same prefix go to the same folder
    Object.keys(fileGroups).forEach(prefix => {
      if (fileGroups[prefix].length > 1) {
        const folders = fileGroups[prefix].map(file => improved[file]);
        const mostCommonFolder = this.getMostCommonItem(folders);
        
        // Assign the most common folder to all files in this group
        fileGroups[prefix].forEach(file => {
          improved[file] = mostCommonFolder;
        });
      }
    });
    
    return improved;
  }

  /**
   * Helper function to find the most common item in an array
   */
  private getMostCommonItem(arr: string[]): string {
    const counts: { [key: string]: number } = {};
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostCommon = arr[0];
    
    Object.keys(counts).forEach(item => {
      if (counts[item] > maxCount) {
        maxCount = counts[item];
        mostCommon = item;
      }
    });
    
    return mostCommon;
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