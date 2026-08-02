import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server';


export async function GET() {
     const supabase = createClient(await cookies());
     const { data: { user } } = await supabase.auth.getUser();
   
     if (!user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
   
     const { data, error } = await supabase
       .from('material_saves')
       .select('material_id')
       .eq('user_id', user.id);
   
     if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }
   
     return NextResponse.json({ saved: data });
   }