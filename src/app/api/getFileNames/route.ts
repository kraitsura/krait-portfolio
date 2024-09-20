import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  
  const folderPath = request.nextUrl.searchParams.get('folderPath');

  if (!folderPath) {
    return NextResponse.json({ error: 'folderPath is required' }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), folderPath);

  try {
    const files = fs.readdirSync(fullPath);
    return NextResponse.json({ files });
  } catch (error) {
    console.error(`Error reading directory: ${error}`);
    return NextResponse.json({ error: 'Error reading directory' }, { status: 500 });
  }
}