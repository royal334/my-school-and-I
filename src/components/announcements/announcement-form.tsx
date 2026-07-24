// components/announcements/announcement-form.tsx
'use client';

import { createClient } from '@/utils/supabase/client'
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2, AlertCircle, CheckCircle2, Users } from 'lucide-react';

interface Faculty {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  faculty_id: string;
}

const announcementSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(300, 'Title must be 300 characters or less'),
    content: z
      .string()
      .trim()
      .min(1, 'Content is required')
      .max(10000, 'Content must be 10,000 characters or less'),
    type: z.enum(['academic', 'official_school']),
    category: z.string(),
    scope: z.enum(['general', 'faculty', 'department', 'level']),
    faculty_id: z.string(),
    department_id: z.string(),
    level: z.string(),
    priority: z.enum(['normal', 'important', 'urgent']),
    expires_at: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.scope !== 'general' && !data.faculty_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Faculty is required',
        path: ['faculty_id'],
      });
    }

    if (
      (data.scope === 'department' || data.scope === 'level') &&
      !data.department_id
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Department is required',
        path: ['department_id'],
      });
    }

    if (data.scope === 'level' && !data.level) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Level is required',
        path: ['level'],
      });
    }
  });

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

function getAllowedScopes(role: string | undefined): string[] {
  switch (role) {
    case 'super_admin':
      return ['general', 'faculty', 'department', 'level']
    case 'admin':
      return ['general', 'faculty', 'department', 'level'];
    case 'faculty_president':
      return ['faculty', 'department', 'level'];
    case 'departmental_president':
      return ['department', 'level'];
    case 'course_rep':
      return ['level', 'department'];
    case 'department_admin':
      return ['department', 'level'];
    case 'student_union_rep':
      return ['general'];
    default:
      return [];
  }
}

function getDefaultScope(
  allowedScopes: string[],
): AnnouncementFormValues['scope'] {
  if (allowedScopes.includes('department')) return 'department';
  return (allowedScopes[0] as AnnouncementFormValues['scope']) || 'department';
}

interface Profile {
  faculty_id: string | null;
  department_id: string | null;
  level: number | null;
  role: string | null;
}

export default function AnnouncementForm() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled || !user) { setLoading(false); return; }

        const [profileResult, roleResult] = await Promise.all([
          supabase.from('profiles').select('faculty_id, department_id, level').eq('id', user.id).maybeSingle(),
          supabase.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle(),
        ]);

        if (cancelled) return;

        setProfile({
          faculty_id: profileResult.data?.faculty_id ?? null,
          department_id: profileResult.data?.department_id ?? null,
          level: profileResult.data?.level ?? null,
          role: roleResult.data?.role ?? null,
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const allowedScopes = useMemo(
    () =>
      getAllowedScopes(
        profile?.role || '',
      ),
    [profile],
  );

  const { 
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'academic',
      category: '',
      scope: 'department',
      faculty_id: '',
      department_id: '',
      level: '',
      priority: 'normal',
      expires_at: '',
    },
  });

  const scope = watch('scope');
  const facultyId = watch('faculty_id');
  const departmentId = watch('department_id');
  const level = watch('level');
  const title = watch('title');
  const content = watch('content');
  const type = watch('type');
  const category = watch('category');
  const priority = watch('priority');
  const expiresAt = watch('expires_at');

  useEffect(() => {
    loadFacultiesAndDepartments();
  }, []);

  useEffect(() => {
    if (!profile || allowedScopes.length === 0) return;

    reset((current) => ({
      ...current,
      scope: getDefaultScope(allowedScopes),
      faculty_id: profile.faculty_id || '',
      department_id: profile.department_id || '',
      level: profile.level?.toString().padStart(3, '0') || '',
    }));
  }, [profile, allowedScopes, reset]);

  async function loadFacultiesAndDepartments() {
    try {
      const [facResult, deptResult] = await Promise.all([
        supabase.from('faculties').select('id, name'),
        supabase.from('departments').select('id, name, faculty_id'),
      ]);

      if (facResult.error) throw facResult.error;
      if (deptResult.error) throw deptResult.error;

      setFaculties(facResult.data || []);
      setDepartments(deptResult.data || []);
    } catch (err) {
      console.error('Failed to load faculties/departments:', err);
    }
  }

  const audiencePreview = useMemo(() => {
    if (scope === 'general') {
      return 'All students (University-wide)';
    }

    if (scope === 'faculty') {
      const faculty = faculties.find((f) => f.id === facultyId);
      return `All ${faculty?.name || 'selected faculty'} students`;
    }

    if (scope === 'department') {
      const dept = departments.find((d) => d.id === departmentId);
      return `All ${dept?.name || 'selected department'} students`;
    }

    if (scope === 'level') {
      const dept = departments.find((d) => d.id === departmentId);
      return `${level} level in ${dept?.name || 'selected department'}`;
    }

    return '';
  }, [scope, facultyId, departmentId, level, faculties, departments]);

  const filteredDepartments = useMemo(
    () =>
      departments.filter(
        (department) => !facultyId || department.faculty_id === facultyId,
      ),
    [departments, facultyId],
  );

  function handleScopeChange(
    newScope: AnnouncementFormValues['scope'],
  ) {
    setValue('scope', newScope, { shouldValidate: true });

    if (newScope === 'general') {
      setValue('faculty_id', '');
      setValue('department_id', '');
      setValue('level', '');
      return;
    }

    if (newScope === 'faculty') {
      setValue('department_id', '');
      setValue('level', '');
      return;
    }

    if (newScope === 'department') {
      setValue('level', '');
    }
  }

  const onSubmit = async (data: AnnouncementFormValues) => {
    if (!allowedScopes.includes(data.scope)) {
      setError('scope', {
        message: 'You do not have permission to send to this audience',
      });
      return;
    }

    try {
      const payload = {
        title: data.title.trim(),
        content: data.content.trim(),
        type: data.type,
        category: data.category || undefined,
        scope: data.scope,
        faculty_id: data.faculty_id || undefined,
        department_id: data.department_id || undefined,
        level: data.scope === 'level' ? parseInt(data.level, 10) : undefined,
        priority: data.priority,
        expires_at: data.expires_at
          ? new Date(data.expires_at).toISOString()
          : undefined,
      };

      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create announcement');
      }

      const result = await response.json();
      setSuccess(true);

      setTimeout(() => {
        router.push(`/dashboard/announcements/${result.announcement.id}`);
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create announcement';
      setError('root', { message });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!allowedScopes.length) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You do not have permission to create announcements.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {(errors.root || success) && (
                  <>
                    {errors.root && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {errors.root.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Announcement published successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="E.g., EEE 301 Test has been moved"
                    disabled={isSubmitting}
                    {...register('title')}
                  />
                  <p className="text-xs text-slate-500">
                    {title.length}/300 characters
                  </p>
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement details here..."
                    rows={8}
                    disabled={isSubmitting}
                    {...register('content')}
                  />
                  <p className="text-xs text-slate-500">
                    {content.length}/10,000 characters
                  </p>
                  {errors.content && (
                    <p className="text-sm text-red-500">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="official_school">
                              Official School
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || 'none'}
                          onValueChange={(value) =>
                            field.onChange(value === 'none' ? '' : value)
                          }
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No category</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="lecture">Lecture</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="deadline">Deadline</SelectItem>
                            <SelectItem value="policy">Policy</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">
                              Normal (Blue)
                            </SelectItem>
                            <SelectItem value="important">
                              Important (Orange)
                            </SelectItem>
                            <SelectItem value="urgent">Urgent (Red)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires_at">Expires At</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      disabled={isSubmitting}
                      {...register('expires_at')}
                    />
                    <p className="text-xs text-slate-500">
                      Optional - announcement auto-archives after this date
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Who should see this?</h3>

                  <div className="mb-4 space-y-2">
                    <Label>Announcement Scope</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {allowedScopes.map((scopeOption) => (
                        <button
                          key={scopeOption}
                          type="button"
                          onClick={() =>
                            handleScopeChange(
                              scopeOption as AnnouncementFormValues['scope'],
                            )
                          }
                          className={`p-2 rounded border-2 transition ${
                            scope === scopeOption
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span className="text-sm font-medium capitalize">
                            {scopeOption === 'general'
                              ? 'University'
                              : scopeOption.replace('_', ' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.scope && (
                      <p className="text-sm text-red-500">
                        {errors.scope.message}
                      </p>
                    )}
                  </div>

                  {scope !== 'general' && (
                    <div className="mb-4 space-y-2">
                      <Label>Faculty</Label>
                      <Controller
                        name="faculty_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setValue('department_id', '');
                            }}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select faculty" />
                            </SelectTrigger>
                            <SelectContent>
                              {faculties.map((faculty) => (
                                <SelectItem key={faculty.id} value={faculty.id}>
                                  {faculty.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.faculty_id && (
                        <p className="text-sm text-red-500">
                          {errors.faculty_id.message}
                        </p>
                      )}
                    </div>
                  )}

                  {(scope === 'department' || scope === 'level') && (
                    <div className="mb-4 space-y-2">
                      <Label>Department</Label>
                      <Controller
                        name="department_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredDepartments.map((department) => (
                                <SelectItem
                                  key={department.id}
                                  value={department.id}
                                >
                                  {department.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.department_id && (
                        <p className="text-sm text-red-500">
                          {errors.department_id.message}
                        </p>
                      )}
                    </div>
                  )}

                  {scope === 'level' && (
                    <div className="mb-4 space-y-2">
                      <Label>Level</Label>
                      <Controller
                        name="level"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {['100', '200', '300', '400', '500'].map(
                                (levelOption) => (
                                  <SelectItem
                                    key={levelOption}
                                    value={levelOption}
                                  >
                                    {levelOption} Level
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.level && (
                        <p className="text-sm text-red-500">
                          {errors.level.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium">
                        Audience Preview
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{audiencePreview}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('preview')}
                    disabled={isSubmitting}
                  >
                    Preview
                  </Button>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-lg border">
                <div className="mb-4">
                  <Badge
                    variant={
                      priority === 'urgent'
                        ? 'destructive'
                        : priority === 'important'
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {priority.toUpperCase()}
                  </Badge>
                  {category && <Badge className="ml-2">{category}</Badge>}
                </div>

                <h1 className="text-2xl font-bold mb-4">
                  {title || 'Untitled'}
                </h1>

                <div className="prose max-w-none mb-6 whitespace-pre-wrap">
                  {content || 'Your announcement content will appear here'}
                </div>

                <div className="border-t pt-4 text-sm text-slate-600">
                  <p>
                    <strong>Type:</strong> {type}
                  </p>
                  <p>
                    <strong>Reaches:</strong> {audiencePreview}
                  </p>
                  {expiresAt && (
                    <p>
                      <strong>Expires:</strong>{' '}
                      {new Date(expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
