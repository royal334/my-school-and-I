import * as z from 'zod';

export const agentApplicationSchema = z.object({
  // Step 1 — About you
  display_name: z.string().trim().min(1, 'Full name / agency name is required'),
  phone_number: z.string().trim().min(1, 'Phone number is required'),

  // Step 2 — Areas & bio
  operating_areas: z.array(z.string()).min(1, 'Select at least one operating area'),
  bio: z.string(),
});

export type AgentApplicationValues = z.infer<typeof agentApplicationSchema>;

export const defaultValues: AgentApplicationValues = {
  display_name: '',
  phone_number: '',
  operating_areas: [],
  bio: '',
};

/** Fields validated as each step is passed. */
export const AGENT_STEP_FIELDS: Record<number, (keyof AgentApplicationValues)[]> = {
  0: ['display_name', 'phone_number'],
  1: ['operating_areas'],
};