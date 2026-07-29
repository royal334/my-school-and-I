// app/api/announcements/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAllowedScopes } from '@/utils/lib/announcements';

// GET /api/announcements - Fetch announcements visible to current user
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const includeRead = searchParams.get('include_read') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sort = searchParams.get('sort') || 'recent';

    // Base query - RLS automatically filters to visible announcements
    let query = supabase
      .from('announcements')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    // Sort
    if (sort === 'priority') {
      query = query.order('priority', { ascending: false }).order('created_at', { ascending: false });
    } else if (sort === 'unread_first') {
      // This requires a more complex query with left join
      // For MVP, just use recent
      query = query.order('created_at', { ascending: false });
    } else {
      // recent (default)
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: announcements, error, count } = await query;

    if (error) throw error;

    // Get read status for these announcements
    let readIds = new Set<string>();
    if (includeRead) {
      const { data: reads } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id);

      readIds = new Set((reads || []).map((r) => r.announcement_id));
    }

    // Count unread
    const { data: unreads } = await supabase
      .from('announcements')
      .select('id', { count: 'exact' })
      .eq('status', 'published')
      .not(
        'id',
        'in',
        `(${Array.from(readIds).join(',')})`
      );

    const authorIds = Array.from(
      new Set(
        (announcements || [])
          .map((a: any) => a.sender_id || a.author_id)
          .filter(Boolean) as string[]
      )
    );

    let profilesById = new Map<string, { id: string; full_name: string | null }>();
    let rolesByUserId = new Map<string, string | null>();

    if (authorIds.length > 0) {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('id, full_name').in('id', authorIds),
        supabase.from('admin_roles').select('user_id, role').in('user_id', authorIds),
      ]);

      profilesById = new Map((profiles || []).map((profile: any) => [profile.id, profile]));
      rolesByUserId = new Map((roles || []).map((role: any) => [role.user_id, role.role]));
    }

    const result = (announcements || []).map((a: any) => {
      const authorId = a.sender_id || a.author_id;
      const profile = authorId ? profilesById.get(authorId) : null;
      const role = authorId ? rolesByUserId.get(authorId) : null;
      const fallbackRole = typeof a.sender_role === 'string' && a.sender_role ? a.sender_role : null;
      const resolvedRole = fallbackRole || role;

      return {
        ...a,
        is_read: readIds.has(a.id),
        author: {
          full_name: profile?.full_name || 'Unknown author',
          role: resolvedRole ? { role: resolvedRole } : null,
        },
      };
    });

    return NextResponse.json({
      announcements: result,
      total_unread: unreads?.length || 0,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('Fetch announcements error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create a new announcement
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      type = 'academic',
      category,
      scope,
      faculty_id,
      department_id,
      level,
      priority = 'normal',
      expires_at,
    } = body;

    // Basic validation
    if (!title || !content || !scope) {
      return NextResponse.json(
        { error: 'title, content, and scope are required' },
        { status: 400 }
      );
    }

    const validScopes = ['general', 'faculty', 'department', 'level'];
    if (!validScopes.includes(scope)) {
      return NextResponse.json({ error: 'Invalid scope' }, { status: 400 });
    }

    // Validate scope requirements
    if (scope !== 'general' && !faculty_id) {
      return NextResponse.json(
        { error: 'faculty_id is required for this scope' },
        { status: 400 }
      );
    }

    if ((scope === 'department' || scope === 'level') && !department_id) {
      return NextResponse.json(
        { error: 'department_id is required for this scope' },
        { status: 400 }
      );
    }

    if (scope === 'level' && !level) {
      return NextResponse.json(
        { error: 'level is required for level scope' },
        { status: 400 }
      );
    }

       // Permission check via RPC
    const { data: canPost, error: permError } = await supabase.rpc(
      'can_user_send_announcement',
      {
        p_user_id: user.id,
        p_scope: scope,
        p_faculty_id: faculty_id || null,
        p_department_id: department_id || null,
        p_level: level || null,
      }
    );
 
    if (permError || !canPost) {
      return NextResponse.json(
        {
          error:
            'You do not have permission to send announcements to this audience',
        },
        { status: 403 }
      );
    }

    const { data: adminRoleRow, error: adminRoleError } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminRoleError) {
      console.error('admin_roles lookup failed:', adminRoleError);
      return NextResponse.json(
        { error: 'Unable to verify announcement permissions' },
        { status: 500 }
      );
    }

    const senderRole = adminRoleRow?.role || 'student';
    // const allowedScopes = getAllowedScopes(senderRole);

    // if (!allowedScopes.includes(scope)) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         'You do not have permission to send announcements to this audience',
    //     },
    //     { status: 403 }
    //   );
    // }

    // // Create announcement
    // const isGlobalAdmin = ['super_admin', 'admin'].includes(senderRole);

    // if (!isGlobalAdmin) {
    //   const { data: senderProfile, error: senderProfileError } = await supabase
    //     .from('profiles')
    //     .select('faculty_id, department_id')
    //     .eq('id', user.id)
    //     .maybeSingle();

    //   if (senderProfileError) throw senderProfileError;

    //   if (scope !== 'general' && faculty_id !== senderProfile?.faculty_id) {
    //     return NextResponse.json(
    //       { error: 'You can only send announcements within your own faculty' },
    //       { status: 403 }
    //     );
    //   }

    //   if (
    //     ['department', 'level'].includes(scope) &&
    //     department_id !== senderProfile?.department_id
    //   ) {
    //     return NextResponse.json(
    //       { error: 'You can only send announcements within your own department' },
    //       { status: 403 }
    //     );
    //   }
    // }

    const isGlobalAdmin = ['super_admin', 'admin'].includes(senderRole);

    if (!isGlobalAdmin) {
      const { data: senderProfile, error: senderProfileError } = await supabase
        .from('profiles')
        .select('faculty_id, department_id')
        .eq('id', user.id)
        .maybeSingle();

      if (senderProfileError) throw senderProfileError;

      if (scope !== 'general' && faculty_id !== senderProfile?.faculty_id) {
        return NextResponse.json(
          { error: 'You can only send announcements within your own faculty' },
          { status: 403 }
        );
      }

      if (
        ['department', 'level'].includes(scope) &&
        department_id !== senderProfile?.department_id
      ) {
        return NextResponse.json(
          { error: 'You can only send announcements within your own department' },
          { status: 403 }
        );
      }
    }

    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        sender_id: user.id,
        title,
        content,
        type,
        category: category || null,
        target_scope: scope,
        faculty_id: scope === 'general' ? null : faculty_id,
        department_id: ['department', 'level'].includes(scope) ? department_id : null,
        level: scope === 'level' ? level : null,
        priority,
        status: 'published',
        published_at: new Date().toISOString(),
        expires_at: expires_at || null,
        sender_role: senderRole,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('announcement_activity_logs').insert({
      announcement_id: announcement.id,
      user_id: user.id,
      action: 'created',
      new_values: announcement,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // TODO: Send notifications to affected students
    // await notifyStudents(announcement);

    return NextResponse.json({
      success: true,
      announcement,
      message: 'Announcement created and published successfully',
    });
  } catch (error: any) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

