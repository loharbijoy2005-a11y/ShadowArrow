import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Resolve workspace root directory (one level up from admin-dashboard)
    const workspaceRoot = path.resolve(process.cwd(), '..');
    
    // Resolve targeted file path
    const resolvedPath = path.resolve(workspaceRoot, filePath);

    // Security check: prevent directory traversal outside of workspace root
    if (!resolvedPath.startsWith(workspaceRoot)) {
      return NextResponse.json({ error: 'Access Denied: Path traversal detected' }, { status: 403 });
    }

    // Check if the requested target is a file and exists
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file contents safely
    const content = fs.readFileSync(resolvedPath, 'utf8');
    
    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
