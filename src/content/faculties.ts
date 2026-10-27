export interface FacultyRecord {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: "active" | "enrolments_opening_soon";
  createdAt?: string;
}

export const DEFAULT_COLLEGE_FACULTIES: FacultyRecord[] = [
  {
    id: "health-care",
    name: "Health & Social Care",
    description: "Adult social care, leadership & management diplomas (Levels 2–5)",
    icon: "shield-check",
    color: "navy",
    status: "active",
  },
  {
    id: "childcare-early-years",
    name: "Childcare & Early Years",
    description: "Early years educator and nursery practitioner awards",
    icon: "user",
    color: "gold",
    status: "active",
  },
  {
    id: "education-training",
    name: "Education & Training",
    description: "AET, CAVA assessor and internal quality assurance qualifications",
    icon: "graduation-cap",
    color: "navy",
    status: "active",
  },
  {
    id: "business-admin",
    name: "Business & Office Administration",
    description: "Corporate administration, executive assistant & management credentials",
    icon: "briefcase",
    color: "slate",
    status: "active",
  },
  {
    id: "cpd-compliance",
    name: "Department of CPD & Compliance",
    description: "Short-course mandatory compliance certifications and CQC readiness",
    icon: "award",
    color: "gold",
    status: "active",
  },
  {
    id: "academic-tutoring",
    name: "Academic Tutoring (Kids & GCSE)",
    description: "1-on-1 private tuition for KS3/GCSE English, Maths and Sciences",
    icon: "book-open",
    color: "teal",
    status: "active",
  },
  {
    id: "maths-english",
    name: "Maths & English",
    description: "Functional Skills qualifications in English and mathematics",
    icon: "book-open",
    color: "navy",
    status: "active",
  },
];
