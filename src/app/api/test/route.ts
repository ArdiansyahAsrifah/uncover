import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('monitored_accounts')
    .select('*')
    .limit(1);
  
  return NextResponse.json({ data, error });
}