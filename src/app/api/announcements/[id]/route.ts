import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// =====================================================
// PATCH /api/announcements/[id]
// =====================================================

export async function PATCH(request: Request) {
     try {
       const supabase = createClient(await cookies());
       const { data: { user } } = await supabase.auth.getUser();
   
       if (!user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
   
       // Extract ID from URL
       const url = new URL(request.url);
       const id = url.pathname.split('/').pop();
   
       if (!id) {
         return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
       }
   
       // Get existing announcement
       const { data: existing } = await supabase
         .from('announcements')
         .select('*')
         .eq('id', id)
         .single();
   
       if (!existing) {
         return NextResponse.json({ error: 'Not found' }, { status: 404 });
       }
    const body = await request.json();
   
    const editable = ['title', 'content', 'type', 'category', 'priority', 'expires_at'] as const;
    const updates: Record<string, unknown> = {};
    for (const key of editable) {
      if (key in body) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
    }

    // Update announcement
    const { data: updated, error } = await supabase
      .from('announcements')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
   
       if (error) throw error;
   
       // Log activity
       await supabase.from('announcement_activity_logs').insert({
         announcement_id: id,
         user_id: user.id,
         action: 'updated',
         old_values: existing,
         new_values: updated,
       });
   
       return NextResponse.json({ success: true, announcement: updated });
     } catch (error: any) {
       console.error('Update announcement error:', error);
       return NextResponse.json(
         { error: error.message || 'Failed to update announcement' },
         { status: 500 }
       );
     }
   }
   
   



// =====================================================
// DELETE /api/announcements/[id]
// =====================================================

export async function DELETE(request: Request) {
     try {
       const supabase = createClient(await cookies());
       const { data: { user } } = await supabase.auth.getUser();
   
       if (!user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
   
       const url = new URL(request.url);
       const id = url.pathname.split('/').pop();
   
       if (!id) {
         return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
       }
   
       // Get existing announcement
       const { data: existing } = await supabase
         .from('announcements')
         .select('*')
         .eq('id', id)
         .single();
   
       if (!existing) {
         return NextResponse.json({ error: 'Not found' }, { status: 404 });
       }
   
        // Check permission
        const isOwner = existing.sender_id === user.id || existing.author_id === user.id;
        const { data: adminRoleRow } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        const userRole = adminRoleRow?.role as string | undefined;
        if (!isOwner && !['super_admin', 'admin'].includes(userRole || '')) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
   
       // Soft delete (archive)
       const { error } = await supabase
         .from('announcements')
         .update({
           status: 'archived',
           updated_at: new Date().toISOString(),
         })
         .eq('id', id);
   
       if (error) throw error;
   
       // Log activity
       await supabase.from('announcement_activity_logs').insert({
         announcement_id: id,
         user_id: user.id,
         action: 'deleted',
         old_values: existing,
       });
   
       return NextResponse.json({ success: true, message: 'Announcement archived' });
     } catch (error: any) {
       console.error('Delete announcement error:', error);
       return NextResponse.json(
         { error: error.message || 'Failed to delete announcement' },
         { status: 500 }
       );
     }
   }