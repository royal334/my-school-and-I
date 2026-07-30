// components/providers/posthog-identify.tsx
'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { createClient } from '@/utils/supabase/client';

export default function PostHogIdentify() {
  const posthog = usePostHog();

  useEffect(() => {
    const supabase = createClient();

    async function identifyUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && posthog) {
          // Get user profile with full details
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          // Identify user in PostHog
          posthog.identify(user.id, {
            email: user.email,
            name: profile?.full_name,
            account_type: profile?.account_type,
            role: profile?.announcement_role,
            faculty_id: profile?.faculty_id,
            department_id: profile?.department_id,
            level: profile?.level,
            created_at: profile?.created_at,
            // Add more properties as needed
            $set: {
              email: user.email,
              name: profile?.full_name,
            },
          });

        } else if (!user && posthog) {
          // Reset if logged out
          posthog.reset();
        }
      } catch (error) {
        console.error('Error identifying user in PostHog:', error);
      }
    }

    identifyUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          identifyUser();
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [posthog]);

  return null;
}