import { Course } from "./types";
import {
  defaultPlan3Months,
  defaultPlan6Months,
  defaultPlan10Months,
  defaultPlan12Months,
} from "./plans";

export const courses: Course[] = [
  // 1. Regulated Qualification: Adult Care (Levels 2, 3, 4)
  {
    id: "course-adult-care",
    slug: "diploma-in-adult-care",
    title: "Diploma in Adult Care (RQF)",
    summary:
      "Ofqual-regulated qualification for care workers, senior carers, and team leaders delivering person-centred adult social care.",
    description:
      "This qualification develops the knowledge, skills, and competence required when working in adult social care environments across residential, domiciliary, and day-care settings. Taught through live weekly interactive classes with dedicated tutor support.",
    category: "Health & Social Care",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Monday", "First of each month"],
    awarding_body: "TQUK",
    awarding_reference: "603/2823/1", // PLACEHOLDER
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Eligible learners may access government adult education funding depending on residency and employment status. PLACEHOLDER",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Are classes live or pre-recorded?",
        answer:
          "All teaching sessions are delivered live online with qualified tutors. Recordings are made available for review throughout your course.",
      },
      {
        question: "Do I need to be currently working in care?",
        answer:
          "For Levels 3 and 4, access to a care workplace or voluntary placement is required to gather workplace observational evidence.",
      },
    ],
    job_prospects: [
      "Care Assistant",
      "Senior Care Worker",
      "Care Team Leader",
      "Domiciliary Care Coordinator",
    ],
    progression: [
      "Level 3 Diploma in Adult Care",
      "Level 4 Certificate in Principles of Leadership and Management in Adult Care",
      "Level 5 Diploma in Leadership and Management for Adult Care",
    ],
    image: "/courses/adult-care.jpg",
    seo_title: "Diploma in Adult Care (RQF) Levels 2, 3 & 4 | Smartminds",
    seo_description:
      "Study the regulated Level 2, 3, and 4 Diploma in Adult Care with live online classes, flexible payment plans, and experienced tutors.",
    published: true,
    levels: [
      {
        course_id: "course-adult-care",
        level_label: "Level 2",
        price_gbp: 750, // PLACEHOLDER
        full_pay_discount_percent: 10,
        duration_text: "4 – 6 months",
        guided_learning_hours: 280,
        entry_requirements: [
          "Minimum 16 years of age",
          "Basic English proficiency (Level 1 equivalent)",
          "Access to a computer and internet for live classes",
        ],
        units: [
          {
            code: "AC2-01",
            title: "Principles of Communication in Adult Social Care",
            credits: 3,
          },
          {
            code: "AC2-02",
            title: "Principles of Personal Development in Adult Social Care",
            credits: 3,
          },
          {
            code: "AC2-03",
            title: "Duty of Care in Health and Social Care",
            credits: 2,
          },
          {
            code: "AC2-04",
            title: "Equality and Inclusion in Adult Social Care",
            credits: 3,
          },
        ],
        plans: [defaultPlan3Months, defaultPlan6Months],
      },
      {
        course_id: "course-adult-care",
        level_label: "Level 3",
        price_gbp: 1250, // PLACEHOLDER
        full_pay_discount_percent: 10,
        duration_text: "6 – 9 months",
        guided_learning_hours: 315,
        entry_requirements: [
          "Level 2 qualification or equivalent experience in social care",
          "Current employment or verified voluntary placement in adult care",
          "Commitment to weekly live evening sessions",
        ],
        units: [
          {
            code: "AC3-01",
            title: "Promote Communication in Care Settings",
            credits: 3,
          },
          {
            code: "AC3-02",
            title: "Promote Effective Personal Development in Care",
            credits: 3,
          },
          {
            code: "AC3-03",
            title: "Promote Equality and Inclusion in Adult Social Care",
            credits: 4,
          },
          {
            code: "AC3-04",
            title: "Promote Health, Safety and Wellbeing in Care Settings",
            credits: 6,
          },
          {
            code: "AC3-05",
            title: "Responsibilities of a Care Worker",
            credits: 2,
          },
        ],
        plans: [defaultPlan3Months, defaultPlan6Months, defaultPlan10Months],
      },
      {
        course_id: "course-adult-care",
        level_label: "Level 4",
        price_gbp: 1650, // PLACEHOLDER
        full_pay_discount_percent: 12, // Course override test
        duration_text: "9 – 12 months",
        guided_learning_hours: 375,
        entry_requirements: [
          "Level 3 Diploma in Adult Care or substantial supervisory experience",
          "Lead role or senior responsibility in a social care environment",
        ],
        units: [
          {
            code: "AC4-01",
            title: "Leadership and Management in Adult Care Settings",
            credits: 6,
          },
          {
            code: "AC4-02",
            title: "Governance and Regulatory Processes",
            credits: 5,
          },
          {
            code: "AC4-03",
            title: "Facilitate Person-Centred Assessment and Planning",
            credits: 6,
          },
        ],
        plans: [defaultPlan6Months, defaultPlan10Months, defaultPlan12Months],
      },
    ],
  },

  // 2. Regulated Qualification: Award in Education and Training (AET)
  {
    id: "course-aet",
    slug: "award-in-education-and-training-aet",
    title: "Level 3 Award in Education and Training (AET)",
    summary:
      "The premier introductory qualification for individuals wanting to teach or train in further education, colleges, and private training centres.",
    description:
      "Formerly known as PTLLS, the Level 3 AET equips aspiring trainers and educators with foundational teaching methods, session planning, assessment techniques, and includes a live micro-teach delivery session.",
    category: "Education & Teaching",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every second Monday"],
    awarding_body: "TQUK",
    awarding_reference: "601/0161/1", // PLACEHOLDER
    assessment_method: "criteria",
    funding: "self_pay",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Do I need existing teaching experience?",
        answer:
          "No teaching experience is required. The Level 3 AET is specifically designed as the gateway qualification for new teachers and trainers.",
      },
      {
        question: "How is the micro-teach assessed?",
        answer:
          "You will deliver a 15-minute live teaching session online to your tutor and peer group, followed by constructive feedback and self-evaluation.",
      },
    ],
    job_prospects: [
      "College Lecturer",
      "Corporate Trainer",
      "Vocational Skills Instructor",
      "Private College Tutor",
    ],
    progression: [
      "Level 4 Certificate in Education and Training (CET)",
      "Level 5 Diploma in Teaching (FE and Skills)",
      "Assessor Qualifications (TAQA)",
    ],
    image: "/courses/education-training.jpg",
    seo_title: "Level 3 Award in Education and Training (AET) | Smartminds",
    seo_description:
      "Earn your Level 3 AET teaching qualification through live online tutor-led sessions. Flexible payment plans and full tutor mentorship.",
    published: true,
    levels: [
      {
        course_id: "course-aet",
        level_label: "Level 3",
        price_gbp: 495, // PLACEHOLDER
        full_pay_discount_percent: 10,
        duration_text: "6 – 8 weeks",
        guided_learning_hours: 48,
        entry_requirements: [
          "Minimum 19 years of age",
          "Good standard of literacy and numeracy",
          "Passion for teaching in your subject specialism",
        ],
        units: [
          {
            code: "AET-01",
            title:
              "Understanding Roles, Responsibilities and Relationships in Education",
            credits: 3,
          },
          {
            code: "AET-02",
            title:
              "Understanding and Using Inclusive Teaching and Learning Approaches",
            credits: 6,
          },
          {
            code: "AET-03",
            title: "Understanding Assessment in Education and Training",
            credits: 3,
          },
        ],
        plans: [defaultPlan3Months],
      },
    ],
  },

  // 3. Regulated Qualification: Business Administration (Levels 2, 3)
  {
    id: "course-business-admin",
    slug: "diploma-in-business-administration",
    title: "Diploma in Business Administration (RQF)",
    summary:
      "Master modern office management, digital administration, stakeholder communication, and organisational workflows.",
    description:
      "Designed for administrative officers, executive assistants, and team coordinators seeking recognised qualifications to step into management. Develop practical skills in project coordination, information management, and commercial operations.",
    category: "Business & Management",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Monday"],
    awarding_body: "TQUK",
    awarding_reference: "601/3965/3", // PLACEHOLDER
    assessment_method: "criteria",
    funding: "both",
    intro_video_url: null,
    free_textbook: false,
    faqs: [
      {
        question: "Can I complete assignments alongside my job?",
        answer:
          "Yes. Our rolling programme is structured around evening classes and independent coursework tailored for working professionals.",
      },
    ],
    job_prospects: [
      "Office Administrator",
      "Executive Assistant",
      "Operations Coordinator",
      "Office Manager",
    ],
    progression: [
      "Level 4 Business and Professional Administration",
      "Level 5 Leadership and Management",
    ],
    image: "/courses/business-admin.jpg",
    seo_title: "Diploma in Business Administration Levels 2 & 3 | Smartminds",
    seo_description:
      "Accredited business administration qualifications with live online training. Enrol today with flexible monthly instalments.",
    published: true,
    levels: [
      {
        course_id: "course-business-admin",
        level_label: "Level 2",
        price_gbp: 650, // PLACEHOLDER
        full_pay_discount_percent: 10,
        duration_text: "4 – 6 months",
        guided_learning_hours: 229,
        entry_requirements: [
          "Minimum 16 years of age",
          "Working knowledge of computer applications and email",
        ],
        units: [
          {
            code: "BA2-01",
            title: "Communication in a Business Environment",
            credits: 3,
          },
          {
            code: "BA2-02",
            title: "Principles of Business Administration",
            credits: 4,
          },
          {
            code: "BA2-03",
            title: "Manage Personal Performance and Development",
            credits: 4,
          },
        ],
        plans: [defaultPlan3Months, defaultPlan6Months],
      },
      {
        course_id: "course-business-admin",
        level_label: "Level 3",
        price_gbp: 995, // PLACEHOLDER
        full_pay_discount_percent: 10,
        duration_text: "6 – 9 months",
        guided_learning_hours: 282,
        entry_requirements: [
          "Level 2 qualification or relevant administrative work experience",
          "Ability to conduct research and draft business reports",
        ],
        units: [
          {
            code: "BA3-01",
            title: "Principles of Business Communication and Information",
            credits: 4,
          },
          {
            code: "BA3-02",
            title: "Principles of Business Administration and Strategy",
            credits: 6,
          },
          {
            code: "BA3-03",
            title: "Manage Information and Data Systems",
            credits: 4,
          },
          {
            code: "BA3-04",
            title: "Negotiate in a Business Environment",
            credits: 4,
          },
        ],
        plans: [defaultPlan3Months, defaultPlan6Months, defaultPlan10Months],
      },
    ],
  },

  // 4. Regulated Qualification: Early Years Educator
  {
    id: "course-early-years",
    slug: "diploma-early-years-educator",
    title: "Level 3 Diploma for the Early Years Educator",
    summary:
      "Fully recognised Early Years Educator qualification conferring full licence-to-practise status in nurseries and pre-schools.",
    description:
      "Develop deep expertise in child development from birth to 5 years, early years curriculum planning, safeguarding, and partnership working with parents. Combines live theoretical instruction with workplace observational practice.",
    category: "Childcare & Education",
    type: "regulated",
    delivery: "blended",
    start_mode: "fixed",
    start_dates: ["15th of next month", "First Monday of September"],
    awarding_body: "TQUK",
    awarding_reference: "601/4000/X", // PLACEHOLDER
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Subject to government funding rules for 19+ learners. PLACEHOLDER",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Is this qualification recognised by Ofsted?",
        answer:
          "Yes, this is an official Ofsted and Department for Education recognised Early Years Educator (EYE) qualification.",
      },
      {
        question: "Are DBS checks required?",
        answer:
          "Yes, an Enhanced DBS check is mandatory prior to undertaking practical hours in an early years setting.",
      },
    ],
    job_prospects: [
      "Early Years Educator",
      "Nursery Practitioner",
      "Pre-school Room Leader",
      "Childminder",
    ],
    progression: [
      "Level 4 Certificate in Early Years Advanced Practice",
      "Level 5 Diploma in Leadership for Children and Young People's Services",
    ],
    image: "/courses/early-years.jpg",
    seo_title: "Level 3 Diploma for the Early Years Educator | Smartminds",
    seo_description:
      "Gain your full licence to practise in nurseries and pre-schools with our Level 3 Early Years Educator diploma.",
    published: true,
    levels: [
      {
        course_id: "course-early-years",
        level_label: "Level 3",
        price_gbp: 1450, // PLACEHOLDER
        full_pay_discount_percent: 10,
        duration_text: "9 – 12 months",
        guided_learning_hours: 486,
        entry_requirements: [
          "Minimum 18 years of age",
          "GCSE English and Maths at Grade C/4 or Functional Skills Level 2",
          "Placement or employment in a registered early years setting (min 250 hours)",
        ],
        units: [
          {
            code: "EYE-01",
            title: "Support Healthy Lifestyles for Children Through Exercise",
            credits: 3,
          },
          {
            code: "EYE-02",
            title: "Promote Children's Emotional Well-being",
            credits: 4,
          },
          {
            code: "EYE-03",
            title: "Understand the Needs of the Ill Child",
            credits: 2,
          },
          {
            code: "EYE-04",
            title: "Plan, Lead and Review Play Opportunities",
            credits: 6,
          },
        ],
        plans: [defaultPlan6Months, defaultPlan10Months, defaultPlan12Months],
      },
    ],
  },

  // 5. Regulated Qualification: Leadership & Management in Adult Care
  {
    id: "course-leadership-care",
    slug: "leadership-management-adult-care",
    title: "Level 5 Diploma in Leadership and Management for Adult Care",
    summary:
      "The benchmark qualification required by CQC for Registered Managers and Deputy Managers in adult social care.",
    description:
      "Designed for existing and aspiring registered managers in care homes, domiciliary agencies, and supported living services. Master strategic resource management, statutory compliance, quality assurance, safeguarding governance, and continuous service improvement.",
    category: "Health & Social Care",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every second Monday"],
    awarding_body: "TQUK",
    awarding_reference: "603/3593/4", // PLACEHOLDER
    assessment_method: "criteria",
    funding: "both",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Is this accepted by the Care Quality Commission (CQC)?",
        answer:
          "Yes, this is the nationally recognised qualification required by CQC when applying for Registered Manager registration.",
      },
    ],
    job_prospects: [
      "Registered Care Manager",
      "Deputy Care Home Manager",
      "Head of Care Services",
      "Regional Operations Director",
    ],
    progression: [
      "Level 7 Strategic Management & Leadership",
      "University degree pathways in Healthcare Management",
    ],
    image: "/courses/leadership-care.jpg",
    seo_title:
      "Level 5 Diploma Leadership in Adult Care (CQC Registered Manager) | Smartminds",
    seo_description:
      "Achieve your CQC-recognised Level 5 Registered Manager qualification with live tutor mentorship and structured portfolio guidance.",
    published: true,
    levels: [
      {
        course_id: "course-leadership-care",
        level_label: "Level 5",
        price_gbp: 2100, // PLACEHOLDER
        full_pay_discount_percent: 10,
        duration_text: "12 – 18 months",
        guided_learning_hours: 580,
        entry_requirements: [
          "Minimum 19 years of age",
          "Working as a Manager, Deputy Manager, or Team Leader in adult social care",
          "Authority to implement policies and lead staff teams",
        ],
        units: [
          {
            code: "LM5-01",
            title: "Principles of Leadership and Management in Adult Care",
            credits: 8,
          },
          {
            code: "LM5-02",
            title: "Regulatory Processes and Compliance in Adult Care",
            credits: 6,
          },
          {
            code: "LM5-03",
            title: "Leading and Managing People in Care Services",
            credits: 6,
          },
          {
            code: "LM5-04",
            title: "Governance, Quality and Outcome Management",
            credits: 8,
          },
        ],
        plans: [defaultPlan6Months, defaultPlan10Months, defaultPlan12Months],
      },
    ],
  },

  // 6. CPD Course: Safeguarding
  {
    id: "course-cpd-safeguarding",
    slug: "safeguarding-children-vulnerable-adults",
    title: "Safeguarding Children and Vulnerable Adults (CPD)",
    summary:
      "Essential certified continuing professional development course on legislation, identifying signs of abuse, and reporting protocols.",
    description:
      "A fast-paced, interactive certified training course providing statutory safeguarding knowledge for teachers, social care workers, community leaders, and healthcare staff. Includes real-world case analysis and UK legal frameworks.",
    category: "Continuing Professional Development",
    type: "cpd",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Wednesday evening", "Saturday morning"],
    awarding_body: "The CPD Group",
    awarding_reference: "CPD-SG-2026", // PLACEHOLDER
    assessment_method: "completion",
    funding: "self_pay",
    intro_video_url: null,
    free_textbook: false,
    faqs: [
      {
        question: "How long is the certificate valid?",
        answer:
          "CPD certificates are generally renewed every 2 years in line with industry care compliance standards.",
      },
    ],
    job_prospects: [
      "Care Worker Compliance",
      "Designated Safeguarding Lead support",
      "Community Support Worker",
    ],
    progression: [
      "Level 3 Safeguarding Lead Training",
      "Level 3 Diploma in Adult Care",
    ],
    image: "/courses/cpd-safeguarding.jpg",
    seo_title:
      "Safeguarding Children and Vulnerable Adults CPD Certificate | Smartminds",
    seo_description:
      "Earn a recognised CPD certificate in Safeguarding Children and Vulnerable Adults. Live online interactive session.",
    published: true,
    levels: [
      {
        course_id: "course-cpd-safeguarding",
        level_label: "Level 2 CPD",
        price_gbp: 95, // PLACEHOLDER
        full_pay_discount_percent: 0, // No discount for low price point
        duration_text: "1 day (6 hours)",
        guided_learning_hours: 6,
        entry_requirements: ["Open to all learners aged 16+"],
        units: [
          {
            code: "CPD-SG1",
            title: "Recognising Signs and Indicators of Abuse",
          },
          {
            code: "CPD-SG2",
            title: "Legal Frameworks and Reporting Procedures",
          },
          {
            code: "CPD-SG3",
            title: "Multi-Agency Working and Confidentiality",
          },
        ],
        plans: [
          {
            id: "plan-cpd-full",
            name: "Single Payment",
            months: 1,
            deposit_type: "fixed",
            deposit_value: 0,
            grace_days: 0,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 7. CPD Course: Medication Administration
  {
    id: "course-cpd-medication",
    slug: "safe-medication-administration-care",
    title: "Safe Administration of Medication in Social Care (CPD)",
    summary:
      "Comprehensive compliance training covering safe handling, administration protocols, MAR charts, and errors avoidance.",
    description:
      "Taught by experienced healthcare trainers, this certified CPD programme covers the 6 rights of medication administration, storage regulations, controlled drugs protocols, and standard documentation procedures.",
    category: "Continuing Professional Development",
    type: "cpd",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Thursday"],
    awarding_body: "The CPD Group",
    awarding_reference: "CPD-MED-2026", // PLACEHOLDER
    assessment_method: "completion",
    funding: "self_pay",
    intro_video_url: null,
    free_textbook: false,
    faqs: [
      {
        question: "Does this cover competency assessments?",
        answer:
          "This programme covers the theoretical and simulated competency training. Workplace observation should be validated by your registered manager.",
      },
    ],
    job_prospects: [
      "Medication-Trained Carer",
      "Senior Healthcare Assistant",
      "Support Worker",
    ],
    progression: [
      "Level 3 Certificate in Working in End of Life Care",
      "Level 3 Diploma in Adult Care",
    ],
    image: "/courses/cpd-medication.jpg",
    seo_title: "Safe Administration of Medication CPD Training | Smartminds",
    seo_description:
      "Live online CPD training on safe medication administration, MAR charts, and regulatory compliance in social care.",
    published: true,
    levels: [
      {
        course_id: "course-cpd-medication",
        level_label: "Level 2 CPD",
        price_gbp: 110, // PLACEHOLDER
        full_pay_discount_percent: 0,
        duration_text: "1 day (6 hours)",
        guided_learning_hours: 6,
        entry_requirements: [
          "Working or intending to work in health or social care",
        ],
        units: [
          {
            code: "CPD-MED1",
            title:
              "Legislation, Policy and Accountability in Medication Handling",
          },
          {
            code: "CPD-MED2",
            title: "Routes of Administration and the Six Rights",
          },
          {
            code: "CPD-MED3",
            title:
              "Medication Administration Records (MAR) and Error Protocols",
          },
        ],
        plans: [
          {
            id: "plan-cpd-full",
            name: "Single Payment",
            months: 1,
            deposit_type: "fixed",
            deposit_value: 0,
            grace_days: 0,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 8. Tutoring: 1-on-1 English & Maths Tutoring for Children
  {
    id: "course-tutoring-children",
    slug: "private-tutoring-english-maths",
    title: "1-on-1 Private Tutoring: English & Mathematics",
    summary:
      "Personalised live tutoring for children (KS3 & GCSE) led by DBS-checked subject teachers to boost confidence and exam grades.",
    description:
      "Targeted one-on-one sessions tailored to your child's specific exam board (AQA, Edexcel, OCR). We identify learning gaps, teach core techniques, and provide regular structured progress feedback to parents.",
    category: "Private Tutoring",
    type: "tutoring",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Flexible weekday and weekend slots"],
    awarding_body: null,
    awarding_reference: null,
    assessment_method: "completion",
    funding: "self_pay",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Are your tutors DBS checked?",
        answer:
          "Yes, every private tutor holds an active Enhanced DBS check and completes mandatory child safeguarding checks.",
      },
      {
        question: "How do parents receive feedback?",
        answer:
          "Parents receive a written report after every 4 sessions outlining topics covered, homework completion, and exam technique progress.",
      },
    ],
    job_prospects: [
      "Secondary school academic advancement",
      "GCSE Grade 7–9 target achievement",
    ],
    progression: ["A-Level Preparation", "Further education pathways"],
    image: "/courses/tutoring-children.jpg",
    seo_title: "1-on-1 Private Tutoring for Children (KS3 & GCSE) | Smartminds",
    seo_description:
      "Boost your child's academic confidence with live 1-on-1 private tutoring in English & Maths from verified DBS-checked tutors.",
    published: true,
    levels: [
      {
        course_id: "course-tutoring-children",
        level_label: "Key Stage 3",
        price_gbp: 360, // PLACEHOLDER: 12-session term block
        full_pay_discount_percent: 10,
        duration_text: "12 weekly sessions",
        guided_learning_hours: 12,
        entry_requirements: [
          "Years 7, 8, or 9 pupils",
          "Parent or legal guardian consent required",
        ],
        units: [
          {
            code: "TUT-KS3-1",
            title: "Diagnostic Skill Assessment and Gap Analysis",
          },
          {
            code: "TUT-KS3-2",
            title:
              "Targeted Curriculum Focus (Algebra, Comprehension, Writing)",
          },
          { code: "TUT-KS3-3", title: "Term Progress Review and Assessment" },
        ],
        plans: [defaultPlan3Months],
      },
      {
        course_id: "course-tutoring-children",
        level_label: "GCSE Prep",
        price_gbp: 480, // PLACEHOLDER: 12-session term block
        full_pay_discount_percent: 10,
        duration_text: "12 weekly sessions",
        guided_learning_hours: 12,
        entry_requirements: [
          "Years 10 or 11 pupils preparing for GCSE exams",
          "Parent or legal guardian consent required",
        ],
        units: [
          {
            code: "TUT-GCSE-1",
            title: "Exam Board Specification Review (AQA / Edexcel / OCR)",
          },
          {
            code: "TUT-GCSE-2",
            title: "Past Paper Question Technique and Timed Practice",
          },
          {
            code: "TUT-GCSE-3",
            title: "Mock Exam Marking and Grade Improvement Coaching",
          },
        ],
        plans: [defaultPlan3Months, defaultPlan6Months],
      },
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getCoursesByType(type: Course["type"]): Course[] {
  return courses.filter((c) => c.type === type);
}

export function getCoursesByCategory(category: string): Course[] {
  return courses.filter((c) => c.category === category);
}
