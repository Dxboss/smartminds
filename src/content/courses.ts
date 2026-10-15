import { Course } from "./types";
import {
  defaultPlan3Months,
  defaultPlan6Months,
  defaultPlan10Months,
  defaultPlan12Months,
} from "./plans";

export const courses: Course[] = [
  // 1. Regulated Qualification: Adult Care (Levels 2, 3, 5)
  {
    id: "course-adult-care",
    slug: "diploma-in-adult-care",
    title: "Diploma in Adult Care (RQF)",
    summary:
      "Ofqual-regulated qualification for care workers, senior carers, and team leaders delivering person-centred adult social care.",
    description:
      "This qualification develops the knowledge, skills, and competence required when working in adult social care environments across residential, domiciliary, and day-care settings. Taught through live weekly interactive classes with dedicated tutor support and free textbook included.",
    category: "Health & Social Care",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Monday", "First of each month"],
    awarding_body: "TQUK & NCFE",
    awarding_reference: "610/0103/6",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Eligible learners can access free funding routes through AEB & NSF or spread payments over 12 months with 0% interest.",
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
          "For Levels 3 and 5, access to a care workplace or voluntary placement is required to gather workplace observational evidence.",
      },
    ],
    job_prospects: [
      "Healthcare Assistant",
      "Senior Carer",
      "Care Team Leader / Care Manager",
      "Care Agency Founder",
    ],
    progression: [
      "Level 3 Diploma in Adult Care",
      "Level 5 Diploma in Leadership and Management for Adult Care",
      "University Nursing & Healthcare Degrees",
    ],
    image: "/images/hero-learner.jpg",
    imageAlt:
      "Adult care learner in clinical study environment with course materials",
    seo_title: "Diploma in Adult Care (RQF) Levels 2, 3 & 5 | Smartminds",
    seo_description:
      "Study the regulated Level 2, 3, and 5 Diploma in Adult Care with live online classes, 0% interest payment plans, and experienced tutors.",
    published: true,
    levels: [
      {
        course_id: "course-adult-care",
        level_label: "Level 2",
        price_gbp: 750,
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
        price_gbp: 1400,
        full_pay_discount_percent: 10,
        duration_text: "6 – 12 months",
        guided_learning_hours: 580,
        entry_requirements: [
          "Minimum level 2 literacy and numeracy or equivalent",
          "Current employment or voluntary placement in adult care",
          "Commitment to weekly live evening sessions",
        ],
        units: [
          {
            code: "AC3-01",
            title: "Agreed Ways of Working in Care Settings",
            credits: 4,
          },
          {
            code: "AC3-02",
            title: "Safeguarding in Care Settings",
            credits: 4,
          },
          {
            code: "AC3-03",
            title: "Mental Capacity and Restrictive Practice in Care Settings",
            credits: 4,
          },
          {
            code: "AC3-04",
            title: "Duty of Care in Care Settings",
            credits: 3,
          },
          {
            code: "AC3-05",
            title: "Person-Centred Practice in Care Settings",
            credits: 4,
          },
          {
            code: "AC3-06",
            title: "Health, Safety and Wellbeing in Care Settings",
            credits: 4,
          },
        ],
        plans: [
          {
            id: "plan-ac-12m",
            name: "Spread over 12 Months (0% Interest)",
            months: 12,
            deposit_type: "fixed",
            deposit_value: 200,
            grace_days: 7,
            after_grace: "pause_access",
          },
          defaultPlan3Months,
          defaultPlan6Months,
        ],
      },
      {
        course_id: "course-adult-care",
        level_label: "Level 5",
        price_gbp: 1750,
        full_pay_discount_percent: 10,
        duration_text: "8 – 12 months",
        guided_learning_hours: 692,
        entry_requirements: [
          "Substantial experience in the care sector (Level 3 or equivalent)",
          "In an appropriate supervisory or leadership role",
          "Minimum 19 years of age",
        ],
        units: [
          {
            code: "AC5-01",
            title: "Leadership and Management in Adult Care",
            credits: 6,
          },
          {
            code: "AC5-02",
            title: "Governance and Regulatory Processes in Adult Care",
            credits: 5,
          },
          {
            code: "AC5-03",
            title: "Team Leadership and Staff Supervision",
            credits: 6,
          },
          {
            code: "AC5-04",
            title: "Business and Resource Management for Adult Care",
            credits: 6,
          },
        ],
        plans: [
          {
            id: "plan-ac5-10m",
            name: "Spread over 10 Months (Deposit £250 + £150/mo)",
            months: 10,
            deposit_type: "fixed",
            deposit_value: 250,
            grace_days: 7,
            after_grace: "pause_access",
          },
          defaultPlan6Months,
        ],
      },
    ],
  },

  // 2. Regulated Qualification: Children & Young People Workforce (CYPW)
  {
    id: "course-cypw",
    slug: "children-young-people-workforce",
    title: "Children & Young People Workforce (CYPW)",
    summary:
      "Ofqual-regulated qualification for working with children and youth across community, residential care, and council settings.",
    description:
      "Designed for those who want to deliver quality care to children and young people. Covers child development, positive relationships, safeguarding, and behavioral support. Study online with live tutor webinars and placement mentoring.",
    category: "Health & Social Care",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Monday", "First of each month"],
    awarding_body: "TQUK & NCFE",
    awarding_reference: "600/567/23",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Government funding options (AEB & NSF) available or flexible 0% interest self-funding plans (Deposit £200 + £120/mo).",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Do I need a placement to complete this course?",
        answer:
          "Yes, you must be working or volunteering with children or young people to demonstrate practical competencies.",
      },
    ],
    job_prospects: [
      "Support Worker (Youth)",
      "Council Youth Practitioner",
      "Senior Youth Carer",
      "Residential Youth Care Worker",
      "Care Agency / Home Founder",
    ],
    progression: [
      "Level 5 Diploma in Leadership for Children and Young People's Services",
      "Foundation Degree in Child & Youth Studies",
    ],
    image: "/images/hero-learner.jpg",
    imageAlt: "Practitioner supporting youth in social care setting",
    seo_title: "Children & Young People Workforce (CYPW) Levels 3 & 5 | Smartminds",
    seo_description:
      "Earn your Ofqual-regulated CYPW qualification with live interactive classes and flexible 0% interest payments.",
    published: true,
    levels: [
      {
        course_id: "course-cypw",
        level_label: "Level 3",
        price_gbp: 1400,
        full_pay_discount_percent: 10,
        duration_text: "6 – 12 months",
        guided_learning_hours: 450,
        entry_requirements: [
          "Minimum 18 years of age",
          "Working or volunteering in a youth or childcare setting",
        ],
        units: [
          {
            code: "CYPW3-01",
            title: "Understand Child and Young Person Development",
            credits: 4,
          },
          {
            code: "CYPW3-02",
            title: "Promote Child and Young Person Development",
            credits: 4,
          },
          {
            code: "CYPW3-03",
            title: "Understand How to Safeguard Children and Young People",
            credits: 6,
          },
          {
            code: "CYPW3-04",
            title: "Professional Practice in Children and Young People's Social Care",
            credits: 4,
          },
        ],
        plans: [
          {
            id: "plan-cypw3-10m",
            name: "Spread over 10 Months (Deposit £200 + £120/mo)",
            months: 10,
            deposit_type: "fixed",
            deposit_value: 200,
            grace_days: 7,
            after_grace: "pause_access",
          },
          defaultPlan6Months,
        ],
      },
      {
        course_id: "course-cypw",
        level_label: "Level 5",
        price_gbp: 1750,
        full_pay_discount_percent: 10,
        duration_text: "8 – 12 months",
        guided_learning_hours: 570,
        entry_requirements: [
          "Level 3 qualification in health/social care or childcare",
          "Supervisory role in children or youth services",
        ],
        units: [
          {
            code: "CYPW5-01",
            title: "Lead Practice that Supports Positive Outcomes for Children",
            credits: 6,
          },
          {
            code: "CYPW5-02",
            title: "Lead and Develop Safeguarding Practices",
            credits: 6,
          },
          {
            code: "CYPW5-03",
            title: "Lead, Manage and Develop an Effective Team",
            credits: 6,
          },
        ],
        plans: [
          {
            id: "plan-cypw5-10m",
            name: "Spread over 10 Months (Deposit £250 + £150/mo)",
            months: 10,
            deposit_type: "fixed",
            deposit_value: 250,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 3. Regulated Qualification: Early Years Educator
  {
    id: "course-childcare-ey",
    slug: "diploma-early-years-educator",
    title: "Level 3 Diploma for the Early Years Educator",
    summary:
      "Fully recognised Early Years Educator qualification conferring full licence-to-practise status in nurseries and pre-schools.",
    description:
      "Develop deep expertise in child development from birth to 5 years, early years curriculum planning, safeguarding, and partnership working with parents. Combines live theoretical instruction with workplace observational practice.",
    category: "Childcare & Education",
    type: "regulated",
    delivery: "blended",
    start_mode: "rolling",
    start_dates: ["Every Monday", "First of each month"],
    awarding_body: "TQUK & NCFE",
    awarding_reference: "610/4164/6",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Free funding available via AEB & NSF for eligible applicants, or flexible monthly instalments over 12 months at 0% interest.",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Is this qualification recognised by Ofsted?",
        answer:
          "Yes, this is an official Ofsted and Department for Education recognised Early Years Educator (EYE) qualification conferring full licence-to-practise status.",
      },
      {
        question: "Are DBS checks required?",
        answer:
          "Yes, an Enhanced DBS check is mandatory prior to undertaking practical placement in an early years setting.",
      },
    ],
    job_prospects: [
      "Early Years Educator",
      "Nursery Practitioner / Room Leader",
      "Play Therapist Assistant",
      "Nursery Manager / Owner (Home or Commercial)",
    ],
    progression: [
      "Level 5 Diploma for the Early Years Senior Practitioner",
      "Higher Education & University Degrees in Early Childhood",
    ],
    image: "/images/hero-learner.jpg",
    imageAlt: "Early years childcare practitioner in modern education setting",
    seo_title: "Level 3 Diploma for the Early Years Educator | Smartminds",
    seo_description:
      "Gain your full licence to practise in nurseries and pre-schools with our Level 3 Early Years Educator diploma.",
    published: true,
    levels: [
      {
        course_id: "course-childcare-ey",
        level_label: "Level 3",
        price_gbp: 1400,
        full_pay_discount_percent: 10,
        duration_text: "6 – 12 months",
        guided_learning_hours: 864,
        entry_requirements: [
          "Minimum 18 years of age",
          "Working, volunteering, or practical placement in early years setting",
        ],
        units: [
          {
            code: "EYE-01",
            title: "Introduction to the Role of the Early Years Educator",
            credits: 4,
          },
          {
            code: "EYE-02",
            title: "Holistic Child Development",
            credits: 6,
          },
          {
            code: "EYE-03",
            title: "Children with Special Educational Needs and Disabilities",
            credits: 4,
          },
          {
            code: "EYE-04",
            title: "Promoting an Effective Early Years Curriculum",
            credits: 6,
          },
        ],
        plans: [
          {
            id: "plan-ey-10m",
            name: "Spread over 10 Months (Deposit £200 + £120/mo)",
            months: 10,
            deposit_type: "fixed",
            deposit_value: 200,
            grace_days: 7,
            after_grace: "pause_access",
          },
          defaultPlan6Months,
        ],
      },
    ],
  },

  // 4. Regulated Qualification: Leadership & Management in Adult Care
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
    awarding_body: "TQUK & NCFE",
    awarding_reference: "610/0955/6",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Funded routes available or 0% interest self-sponsor payment plan (£250 deposit & £150/month).",
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
      "Start Your Own Care Agency / Care Home",
    ],
    progression: [
      "Level 6 Diploma in Health and Social Care Management",
      "Level 7 Strategic Management & Leadership",
    ],
    image: "/images/certificate-moment.jpg",
    imageAlt:
      "Care home manager holding Level 5 leadership and management qualification award",
    seo_title:
      "Level 5 Diploma Leadership in Adult Care (CQC Registered Manager) | Smartminds",
    seo_description:
      "Achieve your CQC-recognised Level 5 Registered Manager qualification with live tutor mentorship and structured portfolio guidance.",
    published: false,
    levels: [
      {
        course_id: "course-leadership-care",
        level_label: "Level 5",
        price_gbp: 1750,
        full_pay_discount_percent: 10,
        duration_text: "8 – 12 months",
        guided_learning_hours: 692,
        entry_requirements: [
          "Minimum 19 years of age",
          "Working as a Manager, Deputy Manager, or Senior Carer in adult social care",
          "Authority to implement policies and lead staff teams",
        ],
        units: [
          {
            code: "LM5-01",
            title: "Leadership and Management in Adult Care",
            credits: 8,
          },
          {
            code: "LM5-02",
            title: "Governance and Regulatory Processes in Adult Care",
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
        plans: [
          {
            id: "plan-lead-10m",
            name: "Spread over 10 Months (Deposit £250 + £150/mo)",
            months: 10,
            deposit_type: "fixed",
            deposit_value: 250,
            grace_days: 7,
            after_grace: "pause_access",
          },
          defaultPlan6Months,
        ],
      },
    ],
  },

  // 5. Regulated Qualification: Certificate in Understanding Mental Health
  {
    id: "course-mental-health-cpd",
    slug: "understanding-mental-health",
    title: "Certificate in Understanding Mental Health (Level 3)",
    summary:
      "Develop deep knowledge of mental health conditions, treatment modalities, and supportive care worker responsibilities.",
    description:
      "The purpose of this qualification is to develop learners’ knowledge and understanding of mental health, mental well-being and working in the mental health sector. Covers context of mental health, living with mental conditions, treatments, and destructive behaviors.",
    category: "Health & Social Care",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Monday", "First of each month"],
    awarding_body: "TQUK & NCFE",
    awarding_reference: "603/3202/5",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Promotional fee: Was £1,400, Now £1,250 (Save £150). Pay deposit £120 & £90/mo, or 3 monthly instalments of £200.",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Can this qualification progress into university?",
        answer:
          "Yes, learners progress onto higher healthcare education or into specialist mental health support roles.",
      },
    ],
    job_prospects: [
      "Mental Health Support Worker",
      "Healthcare Assistant",
      "Senior Mental Health Carer",
      "Care Agency Founder",
    ],
    progression: [
      "Level 4 & Level 5 Health and Social Care Diplomas",
      "University Nursing and Psychology Pathways",
    ],
    image: "/images/hero-learner.jpg",
    imageAlt: "Healthcare professional studying mental health protocols",
    seo_title: "Certificate in Understanding Mental Health Level 3 | Smartminds",
    seo_description:
      "Gain an Ofqual-regulated Level 3 Certificate in Mental Health with live classes and flexible 0% interest payment plans.",
    published: true,
    levels: [
      {
        course_id: "course-mental-health-cpd",
        level_label: "Level 3",
        price_gbp: 1250,
        full_pay_discount_percent: 10,
        duration_text: "4 – 6 months",
        guided_learning_hours: 153,
        entry_requirements: [
          "Minimum 16 years of age",
          "Interest in healthcare or mental wellbeing support",
        ],
        units: [
          {
            code: "MH3-01",
            title: "Understand Mental Health Conditions in Context",
            credits: 4,
          },
          {
            code: "MH3-02",
            title: "Living with a Mental Health Condition",
            credits: 4,
          },
          {
            code: "MH3-03",
            title: "Understanding Treatment of Mental Health Conditions",
            credits: 4,
          },
          {
            code: "MH3-04",
            title: "Mental Health Conditions and Destructive Behaviour",
            credits: 5,
          },
          {
            code: "MH3-05",
            title: "Understand the Role of the Mental Health Care Worker",
            credits: 4,
          },
        ],
        plans: [
          {
            id: "plan-mh-instalments",
            name: "Deposit £120 + £90/month",
            months: 12,
            deposit_type: "fixed",
            deposit_value: 120,
            grace_days: 7,
            after_grace: "pause_access",
          },
          {
            id: "plan-mh-3x",
            name: "3 Monthly Payments of £200",
            months: 3,
            deposit_type: "fixed",
            deposit_value: 200,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 6. Regulated Qualification: Award in Education and Training (AET / PTLLS)
  {
    id: "course-aet",
    slug: "award-in-education-and-training-aet",
    title: "Level 3 Award in Education and Training (AET)",
    summary:
      "The premier introductory qualification for individuals wanting to teach or train in further education, colleges, and private training centres.",
    description:
      "Formerly known as PTLLS, the Level 3 AET equips aspiring trainers and educators with foundational teaching methods, session planning, assessment techniques, and includes a live 15-minute micro-teach delivery session observed and assessed by our centre staff team. Clear progression pathway to CET (Level 4) and DET (Level 5).",
    category: "Education & Teaching",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every second Monday"],
    awarding_body: "TQUK & NCFE",
    awarding_reference: "600/567/23",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Spread payments on our 0% interest flexible instalment plan (£100/month) or enquire about regional funding eligibility.",
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
          "You will deliver a 15-minute live micro-teaching session online observed and assessed by our centre team, with full constructive feedback.",
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
      "Level 5 Diploma in Education and Training (DET)",
      "Assessor Qualifications (CAVA / TAQA)",
    ],
    image: "/images/tutor-teaching.jpg",
    imageAlt: "Vocational tutor leading an adult education training session",
    seo_title: "Level 3 Award in Education and Training (AET) | Smartminds",
    seo_description:
      "Earn your Level 3 AET teaching qualification through live online tutor-led sessions. Flexible payment plans and full tutor mentorship.",
    published: true,
    levels: [
      {
        course_id: "course-aet",
        level_label: "Level 3",
        price_gbp: 450,
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
        plans: [
          {
            id: "plan-aet-monthly",
            name: "Deposit £150 + £100/month",
            months: 3,
            deposit_type: "fixed",
            deposit_value: 150,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 7. Regulated Qualification: Certificate in Assessing Vocational Achievement (CAVA)
  {
    id: "course-cava",
    slug: "certificate-assessing-vocational-achievement",
    title: "Level 3 Certificate in Assessing Vocational Achievement (CAVA)",
    summary:
      "Become a qualified NVQ/vocational assessor. Assess occupational competence in workplaces, colleges, and training centres.",
    description:
      "Formally known as A1 or TAQA Assessor qualification. Enables you to assess learners in their place of work and in training environments across your area of expertise. Enjoy high flexibility to assess on your own schedule or build a tutorial business.",
    category: "Education & Teaching",
    type: "regulated",
    delivery: "blended",
    start_mode: "rolling",
    start_dates: ["Every second Monday"],
    awarding_body: "TQUK",
    awarding_reference: "601/2389/8",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Flexible payment plan: Deposit £250 & £150/month with 0% interest.",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Can I assess in any subject?",
        answer:
          "You can assess competence and vocational qualifications within your existing occupational area of expertise.",
      },
    ],
    job_prospects: [
      "NVQ Assessor",
      "Apprenticeship Skills Assessor",
      "Workplace Competence Assessor",
      "Independent Assessment Consultant",
    ],
    progression: [
      "Level 4 Award in the Internal Quality Assurance of Assessment (IQA)",
    ],
    image: "/images/tutor-teaching.jpg",
    imageAlt: "Assessor evaluating student vocational evidence",
    seo_title: "Level 3 CAVA Assessor Course (A1 / TAQA) | Smartminds",
    seo_description:
      "Qualify as an accredited vocational assessor with our Level 3 CAVA course. Live classes and placement support.",
    published: true,
    levels: [
      {
        course_id: "course-cava",
        level_label: "Level 3",
        price_gbp: 850,
        full_pay_discount_percent: 10,
        duration_text: "3 – 6 months",
        guided_learning_hours: 84,
        entry_requirements: [
          "Minimum 18 years of age",
          "Occupational competence in the subject you wish to assess",
        ],
        units: [
          {
            code: "CAVA-01",
            title: "Understanding the Principles and Practices of Assessment",
            credits: 3,
          },
          {
            code: "CAVA-02",
            title: "Assess Vocational Skills, Knowledge and Understanding",
            credits: 6,
          },
          {
            code: "CAVA-03",
            title: "Assess Occupational Competence in the Work Environment",
            credits: 6,
          },
        ],
        plans: [
          {
            id: "plan-cava",
            name: "Deposit £250 + £150/month",
            months: 4,
            deposit_type: "fixed",
            deposit_value: 250,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 8. Regulated Qualification: Business Administration (Levels 2, 3)
  {
    id: "course-business-admin",
    slug: "diploma-in-business-administration",
    title: "Diploma in Business Administration (RQF)",
    summary:
      "Master modern office management, digital administration, stakeholder communication, and organisational workflows.",
    description:
      "Designed for administrative officers, executive assistants, and team coordinators seeking recognised qualifications to step into management. Develop practical skills in project coordination, information management, and commercial operations with live tutor classes.",
    category: "Business & Management",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Monday"],
    awarding_body: "TQUK & NCFE",
    awarding_reference: "603/2949/X",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Available via 0% interest flexible payment plans (from £100/month) or eligible government funding routes.",
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
    image: "/images/certificate-moment.jpg",
    imageAlt:
      "Certified graduate holding accredited British qualification certificate",
    seo_title: "Diploma in Business Administration Levels 2 & 3 | Smartminds",
    seo_description:
      "Accredited business administration qualifications with live online training. Enrol today with flexible monthly instalments.",
    published: true,
    levels: [
      {
        course_id: "course-business-admin",
        level_label: "Level 2",
        price_gbp: 750,
        full_pay_discount_percent: 10,
        duration_text: "4 – 6 months",
        guided_learning_hours: 155,
        entry_requirements: [
          "Minimum 16 years of age",
          "Working knowledge of computer applications and email",
        ],
        units: [
          {
            code: "BA2-01",
            title: "Principles of Providing Administrative Services",
            credits: 4,
          },
          {
            code: "BA2-02",
            title: "Principles of Business Document Production and Information",
            credits: 4,
          },
          {
            code: "BA2-03",
            title: "Understand Employer Organisations",
            credits: 3,
          },
          {
            code: "BA2-04",
            title: "Principles of Communication in a Business Environment",
            credits: 3,
          },
        ],
        plans: [
          {
            id: "plan-ba2",
            name: "Deposit £150 + £100/month",
            months: 6,
            deposit_type: "fixed",
            deposit_value: 150,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
      {
        course_id: "course-business-admin",
        level_label: "Level 3",
        price_gbp: 1200,
        full_pay_discount_percent: 10,
        duration_text: "6 – 12 months",
        guided_learning_hours: 282,
        entry_requirements: [
          "Level 2 qualification or relevant administrative work experience",
          "Ability to conduct research and draft business reports",
        ],
        units: [
          {
            code: "BA3-01",
            title: "Communicate in a Business Environment",
            credits: 4,
          },
          {
            code: "BA3-02",
            title: "Manage Personal and Professional Development",
            credits: 3,
          },
          {
            code: "BA3-03",
            title: "Principles of Business Communication and Information",
            credits: 4,
          },
          {
            code: "BA3-04",
            title: "Principles of Administration and Strategy",
            credits: 6,
          },
        ],
        plans: [
          {
            id: "plan-ba3",
            name: "Deposit £300 + £150/month",
            months: 6,
            deposit_type: "fixed",
            deposit_value: 300,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 9. Regulated Qualification: Functional Skills English & Maths Level 2
  {
    id: "course-functional-skills",
    slug: "functional-skills-maths-english",
    title: "Functional Skills English & Maths Level 2",
    summary:
      "GCSE-equivalent Level 2 qualifications in English and Maths accepted by UK employers and universities.",
    description:
      "Study from home with weekly live tutor-led classes, recorded revision sessions, and practice exam papers. Meets entry requirements for higher education, university nursing/teaching degrees, and apprenticeships.",
    category: "Education & Teaching",
    type: "regulated",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Monday", "First of each month"],
    awarding_body: "TQUK & NCFE",
    awarding_reference: "Level 2 GCSE Equivalent",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Free government funding available in selected regions (e.g. London & Essex) or self-funded at £300 each with flexible monthly instalments (£150 deposit + £70/mo).",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Is this accepted by universities instead of GCSEs?",
        answer:
          "Yes, Level 2 Functional Skills English and Maths are recognised as equivalent to GCSE Grade C/4 across UK universities and employers.",
      },
      {
        question: "Are classes live?",
        answer:
          "Yes, each week includes live interactive tutoring plus recorded revision sessions and mock exam practice.",
      },
    ],
    job_prospects: [
      "University Entry & UCAS Requirements",
      "Apprenticeship Gateway Standard",
      "NHS & Public Sector Roles",
    ],
    progression: [
      "Access to Higher Education Diplomas",
      "Level 3 & Level 5 Professional Diplomas",
      "University Degree Entry",
    ],
    image: "/images/tutor-teaching.jpg",
    imageAlt:
      "Tutor leading live online mathematics and english revision workshop",
    seo_title: "Functional Skills English & Maths Level 2 | Smartminds",
    seo_description:
      "Study GCSE-equivalent Functional Skills Level 2 in English and Maths with live online classes and flexible payments.",
    published: true,
    levels: [
      {
        course_id: "course-functional-skills",
        level_label: "Level 2 English",
        price_gbp: 300,
        full_pay_discount_percent: 0,
        duration_text: "8 – 12 weeks",
        guided_learning_hours: 55,
        entry_requirements: ["Working at Level 1 standard towards Level 2"],
        units: [
          {
            code: "ENG-L2-01",
            title: "Reading: Text Analysis & Comprehension",
          },
          {
            code: "ENG-L2-02",
            title: "Writing: Composition, Grammar & Punctuation",
          },
          {
            code: "ENG-L2-03",
            title: "Speaking, Listening & Communicating (SLC)",
          },
        ],
        plans: [
          {
            id: "plan-fs-eng",
            name: "Deposit £150 + £70/month",
            months: 3,
            deposit_type: "fixed",
            deposit_value: 150,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
      {
        course_id: "course-functional-skills",
        level_label: "Level 2 Maths",
        price_gbp: 300,
        full_pay_discount_percent: 0,
        duration_text: "8 – 12 weeks",
        guided_learning_hours: 55,
        entry_requirements: ["Working at Level 1 standard towards Level 2"],
        units: [
          {
            code: "MTH-L2-01",
            title: "Number & Arithmetic Operations",
          },
          {
            code: "MTH-L2-02",
            title: "Measures, Shape, Space & Geometry",
          },
          {
            code: "MTH-L2-03",
            title: "Handling Data, Probability & Statistics",
          },
        ],
        plans: [
          {
            id: "plan-fs-mth",
            name: "Deposit £150 + £70/month",
            months: 3,
            deposit_type: "fixed",
            deposit_value: 150,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 10. CPD Course: Phlebotomy Training (Theory, Practical & NHS Live Bloods)
  {
    id: "course-phlebotomy",
    slug: "phlebotomy-training",
    title: "Phlebotomy Training (CPD & Competence CHS132)",
    summary:
      "Comprehensive 2-stage phlebotomy course: theory and mannequin practicals, followed by NHS live bloods clinic session.",
    description:
      "Taught by NHS-trained experienced tutors. Stage 1 covers comprehensive theory and mannequin practicals (latest human-like arm simulators). Stage 2 takes place in an NHS facility under 1-to-1 supervision, measured against Skills for Health National Occupational Standard CHS132, leading to Dual Certification (CPD Accredited + Certificate of Competence).",
    category: "Health & Social Care",
    type: "cpd",
    delivery: "blended",
    start_mode: "rolling",
    start_dates: ["Every second weekend", "Monthly clinic cohorts"],
    awarding_body: "The CPD Group & Skills for Health",
    awarding_reference: "CHS132",
    assessment_method: "completion",
    funding: "self_pay",
    intro_video_url: null,
    free_textbook: true,
    faqs: [
      {
        question: "Where does the live blood practical take place?",
        answer:
          "Stage 2 takes place in an NHS facility under 1-to-1 supervision by experienced NHS practitioners.",
      },
      {
        question: "Do I need Hepatitis B vaccination?",
        answer:
          "Yes, Hepatitis B vaccination is required before attending Stage 2 live blood clinic sessions.",
      },
    ],
    job_prospects: [
      "NHS Hospital Phlebotomist",
      "GP Surgery Phlebotomist",
      "Council Blood Donation Stations",
      "Private Diagnostic Test Centres",
    ],
    progression: [
      "Advanced Cannulation Skills",
      "Level 3 Healthcare Assistant Diploma",
      "Nursing & Clinical Pathways",
    ],
    image: "/images/hero-learner.jpg",
    imageAlt:
      "Clinical practitioner demonstrating phlebotomy venepuncture techniques",
    seo_title: "Phlebotomy Training Course with NHS Live Blood Clinic | Smartminds",
    seo_description:
      "Dual-certification phlebotomy training accredited by The CPD Group with NHS live blood clinic sessions.",
    published: true,
    levels: [
      {
        course_id: "course-phlebotomy",
        level_label: "CPD & Competency",
        price_gbp: 250,
        full_pay_discount_percent: 0,
        duration_text: "2 Days + NHS Clinic",
        guided_learning_hours: 16,
        entry_requirements: [
          "Minimum 18 years of age",
          "Hepatitis B vaccination required for Stage 2 clinic",
        ],
        units: [
          {
            code: "PHL-01",
            title: "Theory & Scientific Background of Venepuncture",
          },
          {
            code: "PHL-02",
            title: "Mannequin Simulation & Practical Technique",
          },
          {
            code: "PHL-03",
            title: "NHS Clinical Placement & Live Blood Venous Sampling",
          },
        ],
        plans: [
          {
            id: "plan-phl-2",
            name: "2 Instalments (£150 deposit + £100 balance)",
            months: 2,
            deposit_type: "fixed",
            deposit_value: 150,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 11. CPD Course: Safe Administration of Medication
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
    awarding_reference: "CPD Accredited",
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
    image: "/images/hero-learner.jpg",
    imageAlt:
      "Healthcare worker studying safe medication administration protocols",
    seo_title: "Safe Administration of Medication CPD Training | Smartminds",
    seo_description:
      "Live online CPD training on safe medication administration, MAR charts, and regulatory compliance in social care.",
    published: true,
    levels: [
      {
        course_id: "course-cpd-medication",
        level_label: "Level 2 CPD",
        price_gbp: 180,
        full_pay_discount_percent: 0,
        duration_text: "4 weeks (Theory & Practical)",
        guided_learning_hours: 12,
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
            id: "plan-cpd-med",
            name: "Single Payment (£180) / Payment Plan Available",
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

  // 12. CPD Course: Introduction to Care (15 Care Certificate Standards)
  {
    id: "course-care-certificate",
    slug: "introduction-to-care-certificate",
    title: "Introduction to Care (15 Care Certificate Standards)",
    summary:
      "Master all 15 National Care Certificate standards through live interactive classes. Ideal for beginners or career changers.",
    description:
      "This training introduces you to the care sector with the fundamental knowledge required to work confidently and safely. Covers safeguarding, moving & handling, infection control, person-centred care, mental capacity, and health & safety basics.",
    category: "Continuing Professional Development",
    type: "cpd",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every week (Flexible schedule)"],
    awarding_body: "The CPD Group",
    awarding_reference: "CPD Accredited",
    assessment_method: "completion",
    funding: "self_pay",
    intro_video_url: null,
    free_textbook: false,
    faqs: [
      {
        question: "Does this cover all 15 Care Standards?",
        answer:
          "Yes, all 15 Care Certificate standards are taught comprehensively via interactive live classes.",
      },
    ],
    job_prospects: [
      "Care Assistant",
      "Support Worker",
      "Domiciliary Carer",
    ],
    progression: [
      "Level 2 Diploma in Care",
      "Level 3 Diploma in Adult Care",
    ],
    image: "/images/hero-learner.jpg",
    imageAlt: "Carer reviewing the 15 care certificate standards",
    seo_title: "Introduction to Care (Care Certificate) | Smartminds",
    seo_description:
      "Comprehensive Care Certificate training covering all 15 standards with live online classes.",
    published: true,
    levels: [
      {
        course_id: "course-care-certificate",
        level_label: "CPD Certificate",
        price_gbp: 108,
        full_pay_discount_percent: 0,
        duration_text: "2 days (Flexible hours)",
        guided_learning_hours: 15,
        entry_requirements: ["Open to all beginners and career changers"],
        units: [
          {
            code: "CC-01",
            title: "Principles of Care & Care Planning",
          },
          {
            code: "CC-02",
            title: "Safeguarding Adults & Children",
          },
          {
            code: "CC-03",
            title: "Infection Prevention, Control & Health & Safety",
          },
          {
            code: "CC-04",
            title: "Mental Capacity Act & DoLS Awareness",
          },
        ],
        plans: [
          {
            id: "plan-cc-full",
            name: "Single Payment (£108)",
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

  // 13. Regulated Qualification: Level 1 Certificate in IT User Skills (ITQ/RQF)
  {
    id: "course-it-user-skills",
    slug: "it-user-skills-level-1",
    title: "Level 1 Certificate in IT User Skills (ITQ/RQF)",
    summary:
      "Ofqual-regulated IT qualification accredited by TQUK. Build workplace computer, email, cloud and productivity skills.",
    description:
      "Ofqual regulated course with 130 Ofqual Total Learning Time accredited by TQUK (Reference 601/7963/6). Covers digital communication, document management, office productivity software, internet safety, and cybersecurity basics. Available online or blended.",
    category: "Business & Management",
    type: "regulated",
    delivery: "blended",
    start_mode: "rolling",
    start_dates: ["Every Monday"],
    awarding_body: "TQUK",
    awarding_reference: "601/7963/6",
    assessment_method: "criteria",
    funding: "both",
    funding_notes:
      "Course fee: Was £489, Now £440 with flexible payment plan options.",
    intro_video_url: null,
    free_textbook: false,
    faqs: [
      {
        question: "Is this course suitable for beginners?",
        answer:
          "Yes, this course steps you up from introductory IT to full workplace digital confidence.",
      },
    ],
    job_prospects: [
      "Administrative Assistant",
      "Customer Service Representative",
      "Digital Office Worker",
    ],
    progression: [
      "Level 2 Certificate in IT User Skills",
      "Level 2 & 3 Business Administration",
    ],
    image: "/images/certificate-moment.jpg",
    imageAlt: "Student working on digital laptop interface in modern office",
    seo_title: "Level 1 Certificate in IT User Skills (ITQ/RQF) | Smartminds",
    seo_description:
      "Gain an Ofqual-regulated Level 1 IT User Skills certificate with live online and blended classes.",
    published: true,
    levels: [
      {
        course_id: "course-it-user-skills",
        level_label: "Level 1",
        price_gbp: 440,
        full_pay_discount_percent: 10,
        duration_text: "2 – 6 months",
        guided_learning_hours: 130,
        entry_requirements: ["Basic computer access and willingness to learn"],
        units: [
          {
            code: "ITQ-01",
            title: "IT Fundamentals for Office Productivity",
          },
          {
            code: "ITQ-02",
            title: "Email and Digital Communication",
          },
          {
            code: "ITQ-03",
            title: "File, Document Management & Cloud Tools",
          },
          {
            code: "ITQ-04",
            title: "Cybersecurity Awareness & Basic Maintenance",
          },
        ],
        plans: [
          {
            id: "plan-itq-3m",
            name: "3 Monthly Payments (£150 deposit)",
            months: 3,
            deposit_type: "fixed",
            deposit_value: 150,
            grace_days: 7,
            after_grace: "pause_access",
          },
        ],
      },
    ],
  },

  // 14. CPD Course: IT & Digital Office Skills
  {
    id: "course-it-cpd",
    slug: "it-digital-office-skills",
    title: "IT & Digital Office Skills (CPD)",
    summary:
      "Master computer essentials, Microsoft Word, Excel spreadsheets, email etiquette, and cloud storage for modern workplaces.",
    description:
      "A practical, hands-on CPD-certified course developed for administrative staff, healthcare workers, and career returners. Learn essential computer navigation, document authoring, professional email communication, spreadsheet data recording, cloud file management, and workplace cybersecurity through interactive live sessions.",
    category: "Continuing Professional Development",
    type: "cpd",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Monday", "Weekend intensive workshops"],
    awarding_body: "The CPD Group",
    awarding_reference: "CPD Accredited",
    assessment_method: "completion",
    funding: "self_pay",
    intro_video_url: null,
    free_textbook: false,
    faqs: [
      {
        question: "Do I need any previous computer experience?",
        answer:
          "No previous IT experience is required. This course starts from foundational navigation and progresses step-by-step to workplace competence.",
      },
      {
        question: "Will I receive an accredited certificate?",
        answer:
          "Yes, upon completion of the live exercises and tutor assessment, you receive a CPD-accredited digital certificate.",
      },
    ],
    job_prospects: [
      "Administrative Assistant",
      "Office Support Worker",
      "Receptionist & Customer Care",
      "Care Home Office Administrator",
    ],
    progression: [
      "Level 1 Certificate in IT User Skills (RQF)",
      "Level 2 Diploma in Business Administration",
    ],
    image: "/images/certificate-moment.jpg",
    imageAlt: "Student working on digital laptop interface in modern office",
    seo_title: "IT & Digital Office Skills CPD Training | Smartminds",
    seo_description:
      "Gain workplace confidence with accredited IT and digital office skills CPD training from Smartminds Training College.",
    published: true,
    levels: [
      {
        course_id: "course-it-cpd",
        level_label: "CPD Certificate",
        price_gbp: 120,
        full_pay_discount_percent: 0,
        duration_text: "2 – 4 weeks",
        guided_learning_hours: 20,
        entry_requirements: [
          "Open to all learners",
          "Access to a computer or laptop with internet connection",
        ],
        units: [
          {
            code: "IT-CPD-01",
            title: "Computer Basics, Operating Systems & File Organisation",
          },
          {
            code: "IT-CPD-02",
            title: "Word Processing & Professional Document Presentation",
          },
          {
            code: "IT-CPD-03",
            title: "Spreadsheet Data Entry, Tables & Calculation Basics",
          },
          {
            code: "IT-CPD-04",
            title: "Professional Email Etiquette, Cloud Storage & Cybersecurity",
          },
        ],
        plans: [
          {
            id: "plan-it-cpd-full",
            name: "Single Payment (£120)",
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

  // 15. CPD Course: Job Skills & Workplace Employability
  {
    id: "course-job-skills-cpd",
    slug: "job-skills-workplace-employability",
    title: "Job Skills & Workplace Employability (CPD)",
    summary:
      "Practical career readiness training covering bespoke CV design, competency interview techniques, and professional workplace standards.",
    description:
      "Designed for individuals preparing to enter, re-enter, or transition careers. This CPD-accredited course equips you with tailored CV writing skills, job search strategies, competency-based interview answering, communication techniques, and core UK workplace expectations.",
    category: "Continuing Professional Development",
    type: "cpd",
    delivery: "live_online",
    start_mode: "rolling",
    start_dates: ["Every Wednesday", "Saturday mornings"],
    awarding_body: "The CPD Group",
    awarding_reference: "CPD Accredited",
    assessment_method: "completion",
    funding: "self_pay",
    intro_video_url: null,
    free_textbook: false,
    faqs: [
      {
        question: "Will a tutor review my actual CV during the course?",
        answer:
          "Yes, tutors provide 1-on-1 feedback on your real CV and offer recommendations for tailoring applications to your target sector.",
      },
      {
        question: "Is interview practice included?",
        answer:
          "Yes, the course includes live mock interview drills and STAR-method competency coaching.",
      },
    ],
    job_prospects: [
      "Entry-Level Social Care & Healthcare Roles",
      "Retail & Customer Service Positions",
      "Administrative & Support Roles",
    ],
    progression: [
      "Level 2 Diploma in Adult Care",
      "Level 2 Business Administration",
      "Sector-Specific Employment Pathways",
    ],
    image: "/images/hero-learner.jpg",
    imageAlt: "Candidate preparing job applications and practicing interview questions",
    seo_title: "Job Skills & Workplace Employability CPD | Smartminds",
    seo_description:
      "Master CV writing, interview techniques, and essential UK workplace standards with accredited CPD training.",
    published: true,
    levels: [
      {
        course_id: "course-job-skills-cpd",
        level_label: "CPD Certificate",
        price_gbp: 95,
        full_pay_discount_percent: 0,
        duration_text: "1 – 2 weeks",
        guided_learning_hours: 15,
        entry_requirements: [
          "Open to all jobseekers, career changers, and school leavers",
        ],
        units: [
          {
            code: "JS-CPD-01",
            title: "High-Impact CV Crafting & Tailored Cover Letters",
          },
          {
            code: "JS-CPD-02",
            title: "Competency-Based Interview Techniques & STAR Method",
          },
          {
            code: "JS-CPD-03",
            title: "Professional Communication, Punctuality & Team Collaboration",
          },
          {
            code: "JS-CPD-04",
            title: "Health & Safety, Equality & Workplace Rights in the UK",
          },
        ],
        plans: [
          {
            id: "plan-js-cpd-full",
            name: "Single Payment (£95)",
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

  // 16. Tutoring: 1-on-1 English & Maths Tutoring for Children
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
    image: "/images/tutor-teaching.jpg",
    imageAlt:
      "Dedicated one-on-one subject specialist teacher guiding student revision",
    seo_title: "1-on-1 Private Tutoring for Children (KS3 & GCSE) | Smartminds",
    seo_description:
      "Boost your child's academic confidence with live 1-on-1 private tutoring in English & Maths from verified DBS-checked tutors.",
    published: false,
    levels: [
      {
        course_id: "course-tutoring-children",
        level_label: "Key Stage 3",
        price_gbp: 360,
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
        price_gbp: 480,
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
