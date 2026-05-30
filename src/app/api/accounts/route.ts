import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/accounts?email=xxx
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email wajib diisi' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('monitored_accounts')
    .select('id, instagram_username, last_scanned_at, created_at')
    .eq('parent_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ accounts: data });
}

// DELETE /api/accounts?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID akun wajib diisi' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('monitored_accounts')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}