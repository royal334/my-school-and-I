import { NextResponse } from 'next/server';
import { getCachedFacultiesDepartments } from '@/utils/cache';

// GET /api/reference - Cached static reference data (faculties + departments)
export async function GET() {
  try {
    const data = await getCachedFacultiesDepartments();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load reference data';
    console.error('Fetch reference data error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
