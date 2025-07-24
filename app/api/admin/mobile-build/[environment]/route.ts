import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(
  request: NextRequest,
  { params }: { params: { environment: string } }
) {
  try {
    // Check authentication and permissions
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const canManageMobile = await hasPermission(user.id, 'update:organizations', user.primaryOrganizationId);
    if (!canManageMobile) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const environment = params.environment;

    // Validate environment
    if (!['development', 'staging', 'production'].includes(environment)) {
      return NextResponse.json({ error: 'Invalid environment' }, { status: 400 });
    }

    // Get the project root directory
    const projectRoot = process.cwd();
    const scriptPath = path.join(projectRoot, 'scripts', 'build-mobile.sh');

    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({ error: 'Build script not found' }, { status: 500 });
    }

    // Make script executable
    await execAsync(`chmod +x "${scriptPath}"`);

    // Execute the mobile build script
    console.log(`Starting mobile build for environment: ${environment}`);
    
    const { stdout, stderr } = await execAsync(
      `cd "${projectRoot}" && ./scripts/build-mobile.sh ${environment}`,
      { 
        timeout: 300000, // 5 minutes timeout
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }
    );

    console.log('Build stdout:', stdout);
    if (stderr) {
      console.log('Build stderr:', stderr);
    }

    // Extract package name and build info from stdout
    const packageMatch = stdout.match(/Package: (rishi-mobile-[^\\s]+\\.zip)/);
    const packageName = packageMatch ? packageMatch[1] : `rishi-mobile-${environment}-${new Date().toISOString().slice(0, 16).replace(/[:-]/g, '')}.zip`;

    const timestamp = new Date().toLocaleString();

    return NextResponse.json({
      success: true,
      message: `${environment} mobile app built successfully!`,
      packageName,
      buildTime: timestamp,
      environment,
      output: stdout
    });

  } catch (error: any) {
    console.error('Mobile build error:', error);
    
    let errorMessage = 'Build failed';
    if (error.message) {
      errorMessage = error.message;
    }
    if (error.stdout) {
      console.log('Error stdout:', error.stdout);
    }
    if (error.stderr) {
      console.log('Error stderr:', error.stderr);
      errorMessage = error.stderr;
    }

    return NextResponse.json({
      error: errorMessage,
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}