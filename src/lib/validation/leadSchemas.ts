import { z } from "zod";

// Base lead validation schema with required consent and anti-spam honeypot
export const baseLeadSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(120, "Email cannot exceed 120 characters")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .max(30, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to our Privacy Policy to submit your enquiry",
  }),
  botCheck: z.string().optional(),
  source_page: z.string().default("/"),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
});

// 1. Free advice enquiry schema
export const freeAdviceSchema = baseLeadSchema.extend({
  type: z.literal("free_advice").default("free_advice"),
  course_interest: z.string().optional(),
  preferred_time: z.string().optional(),
  message: z
    .string()
    .max(1000, "Message cannot exceed 1000 characters")
    .optional(),
});

// 2. Funded eligibility enquiry schema
export const fundedEligibilitySchema = baseLeadSchema.extend({
  type: z.literal("funded_eligibility").default("funded_eligibility"),
  phone: z
    .string()
    .min(6, "Please provide a valid contact phone number for funding review")
    .max(30),
  course_interest: z
    .string()
    .min(2, "Please select the qualification you wish to check funding for"),
  employment_status: z
    .string()
    .min(2, "Please indicate your employment status"),
  prior_qualification: z
    .string()
    .min(2, "Please indicate your highest prior qualification level"),
  postcode: z
    .string()
    .min(2, "Please provide your UK postcode for regional funding verification")
    .max(12),
  message: z.string().max(1000).optional(),
});

// 3. Private tutoring enquiry schema (Children / KS3 & GCSE)
export const privateTutoringSchema = baseLeadSchema.extend({
  type: z.literal("private_tutoring").default("private_tutoring"),
  student_name: z.string().min(2, "Please provide the student's name").max(80),
  student_year_group: z
    .string()
    .min(2, "Please select the student's current year group"),
  subject_interest: z.string().min(2, "Please select the subject interest"),
  parent_consent: z.boolean().refine((val) => val === true, {
    message:
      "Parent or legal guardian consent is required for tutoring enquiries",
  }),
  message: z.string().max(1000).optional(),
});

// 4. General contact form schema
export const generalContactSchema = baseLeadSchema.extend({
  type: z.literal("general_contact").default("general_contact"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(120),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export type FreeAdviceInput = z.infer<typeof freeAdviceSchema>;
export type FundedEligibilityInput = z.infer<typeof fundedEligibilitySchema>;
export type PrivateTutoringInput = z.infer<typeof privateTutoringSchema>;
export type GeneralContactInput = z.infer<typeof generalContactSchema>;

export type AnyLeadInput =
  | FreeAdviceInput
  | FundedEligibilityInput
  | PrivateTutoringInput
  | GeneralContactInput;
