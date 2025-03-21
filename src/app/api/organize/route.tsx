// src/app/api/organize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fileOrganizerService from '@/app/services/fileOrganizer';

export async function GET(request: NextRequest) {
  try {
    // Get recent uploads to suggest organization for
    const recentUploads = await fileOrganizerService.getRecentUploads();
    
    // Generate organization suggestions
    const suggestions = await fileOrganizerService.suggestOrganization(recentUploads);
    
    return NextResponse.json({
      message: 'Organization suggestions generated successfully',
      suggestions,
      fileCount: recentUploads.length
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating organization suggestions:', error);
    return NextResponse.json({
      message: 'Error generating organization suggestions',
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Apply the organization
    const success = await fileOrganizerService.applyOrganization(body.organization);
    
    if (success) {
      return NextResponse.json({
        message: 'Files organized successfully'
      }, { status: 200 });
    } else {
      return NextResponse.json({
        message: 'Error organizing files'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error organizing files:', error);
    return NextResponse.json({
      message: 'Error organizing files',
      error: error.message,
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle individual file move
    if (body.action === 'move' && body.objectName && body.targetFolder) {
      const success = await fileOrganizerService.moveFile(
        body.objectName,
        body.targetFolder
      );
      
      if (success) {
        return NextResponse.json({
          message: 'File moved successfully'
        }, { status: 200 });
      } else {
        return NextResponse.json({
          message: 'Error moving file'
        }, { status: 500 });
      }
    }
    
    // Handle reverting organization
    if (body.action === 'revert') {
      const success = await fileOrganizerService.revertLastOrganization();
      
      if (success) {
        return NextResponse.json({
          message: 'Organization reverted successfully'
        }, { status: 200 });
      } else {
        return NextResponse.json({
          message: 'Error reverting organization'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      message: 'Invalid action'
    }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing file action:', error);
    return NextResponse.json({
      message: 'Error processing file action',
      error: error.message,
    }, { status: 500 });
  }
}