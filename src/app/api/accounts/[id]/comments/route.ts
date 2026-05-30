import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: comments, error } = await supabase
    .from('flagged_comments')
    .select('*')
    .eq('account_id', id)
    .order('scanned_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ comments: comments || [] });
}