import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

export const dynamic = "force-dynamic";

const execAsync = promisify(exec);

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = [
  'npm run db:push',
  'npm run db:studio',
  'npm run db:generate',
  'npm run build',
  './scripts/build-mobile.sh development',
  './scripts/build-mobile.sh staging',
  './scripts/build-mobile.sh production',
  'npm run lint',
  'npx tsc --noEmit',
  'npm test',
  'rm -rf .next && rm -rf node_modules/.cache',
  'ps aux | grep node',
  'npm run db:push'
];

export async function POST(req: NextRequest) {
  // Block dev tools API in production
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Dev tools are only available in development environment' },
      { status: 403 }
    );
  }
  
  try {
    const { command, scriptId } = await req.json();

    if (!command || !scriptId) {
      return NextResponse.json(
        { success: false, error: "Command and scriptId are required" },
        { status: 400 }
      );
    }

    // Security check: only allow whitelisted commands
    if (!ALLOWED_COMMANDS.includes(command)) {
      return NextResponse.json(
        { success: false, error: "Command not allowed" },
        { status: 403 }
      );
    }

    console.log(`[Dev Tools] Executing script: ${scriptId} - ${command}`);

    try {
      // Set execution timeout - longer for mobile builds, shorter for other commands
      const isMobileBuild = command.includes('mobile-build');
      const timeout = isMobileBuild ? 600000 : 120000; // 10 minutes for mobile builds, 2 minutes for others
      
      const { stdout, stderr } = await execAsync(command, {
        timeout,
        cwd: process.cwd(),
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'development'
        }
      });

      const output = stdout || stderr || 'Command executed successfully';
      
      console.log(`[Dev Tools] Script ${scriptId} completed successfully`);
      console.log(`[Dev Tools] Output:`, output.substring(0, 500));

      return NextResponse.json({
        success: true,
        output: output,
        scriptId: scriptId,
        timestamp: new Date().toISOString()
      });

    } catch (execError: any) {
      const errorOutput = execError.stdout || execError.stderr || execError.message;
      
      console.error(`[Dev Tools] Script ${scriptId} failed:`, errorOutput);

      return NextResponse.json({
        success: false,
        error: errorOutput,
        scriptId: scriptId,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("[Dev Tools] Execute error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}