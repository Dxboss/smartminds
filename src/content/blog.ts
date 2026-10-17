export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
  credentials?: string;
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogSection {
  subheading: string;
  paragraphs: string[];
  callout?: {
    title: string;
    text: string;
    variant?: "info" | "tip" | "highlight";
  };
  bulletPoints?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
  updatedAt: string;
  category: "Health & Social Care" | "Teacher Training" | "Career Pathways" | "Funding & Advice";
  readTimeMinutes: number;
  featured?: boolean;
  author: BlogAuthor;
  image: string;
  imageAlt: string;
  excerpt: string;
  keyTakeaways: string[];
  relatedCourseId?: string;
  sections: BlogSection[];
  faqs: BlogFaq[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "post-registered-care-manager",
    slug: "how-to-become-a-registered-care-manager-uk",
    title: "How to Become a Registered Care Home Manager in the UK (2026 Pathway)",
    metaTitle: "How to Become a Registered Care Manager UK (2026 Qualifications Guide)",
    metaDescription:
      "A complete guide to becoming a CQC Registered Care Home Manager in the UK. Understand Level 5 Diploma requirements, CQC fit person interviews, salary expectations (£38k–£55k), and study options.",
    publishedAt: "2026-09-15",
    updatedAt: "2026-10-10",
    category: "Health & Social Care",
    readTimeMinutes: 7,
    featured: true,
    author: {
      name: "Dr. Eleanor Vance",
      role: "Lead Healthcare Assessor & Former Registered Care Manager",
      credentials: "RN, BSc (Hons), CAVA, Level 5 Leadership & Management",
    },
    image: "/images/adult-care-training.jpg",
    imageAlt: "Registered Care Manager reviewing healthcare care plans in a modern residential care setting",
    excerpt:
      "Stepping up to Registered Manager is the most significant career milestone in adult social care. Here is the verified regulatory route, qualification criteria, and practical timeline required by the Care Quality Commission (CQC).",
    keyTakeaways: [
      "The Level 5 Diploma in Leadership and Management for Adult Care (RQF) is the recognised qualification benchmark required by the CQC.",
      "You do not need to sit timed written exams; assessment is 100% coursework, workplace competency evidence, and professional discussions.",
      "Average UK Registered Care Manager salaries range from £38,000 to over £55,000, depending on home size and specialist nursing provision.",
      "Working adults can complete the qualification in 12 months through weekly evening Zoom seminars without stepping down from their current shift roles.",
    ],
    relatedCourseId: "c-adult-care-l5",
    sections: [
      {
        subheading: "What Does a Registered Care Manager Actually Do?",
        paragraphs: [
          "In England and Wales, a Registered Care Manager holds formal statutory responsibility for the day-to-day operations of a care service—whether that is a residential care home, supported living facility, or domiciliary care agency.",
          "Unlike an unregistered deputy manager, your name appears alongside the registered provider on the Care Quality Commission (CQC) registry. You are legally responsible for upholding fundamental standards of quality, safety, staffing competency, safeguarding, and medicine administration.",
        ],
        callout: {
          title: "Regulatory Benchmark (CQC Health and Social Care Act 2008)",
          text: "Regulation 7 requires that every registered manager is of good character, has the necessary qualifications, skills, and experience, and is physically and mentally fit to manage the regulated activity.",
          variant: "highlight",
        },
      },
      {
        subheading: "The Essential Qualification: Level 5 Diploma in Leadership for Adult Care",
        paragraphs: [
          "While exceptional experience counts, regulatory expectations mean providers almost universally require the Level 5 Diploma in Leadership and Management for Adult Care (RQF).",
          "This qualification replaced the legacy Registered Manager Award (RMA) and Level 5 NVQ in Health and Social Care. It is fully regulated by Ofqual and accredited through premier UK awarding organisations including NCFE CACHE and TQUK.",
        ],
        bulletPoints: [
          "Governance, regulatory compliance, and quality assurance frameworks",
          "Safeguarding vulnerable adults and implementing whistleblowing protocols",
          "Managing person-centred care delivery across complex dementia and physical care needs",
          "Financial resource management and workforce leadership in care environments",
        ],
      },
      {
        subheading: "How Can You Study While Working Full-Time Shifts?",
        paragraphs: [
          "The greatest hurdle senior carers and deputy managers face is time. Traditional college attendance is incompatible with 12-hour shifts, weekend on-call duties, and staff rotas.",
          "Modern distance learning solves this through blended evening timetables. At Smartminds Training College, live classes run every Tuesday from 18:30 to 20:30 UK time via interactive Zoom webinars. If you are called onto the floor, every session is recorded in HD and archived 24/7 in your student portal.",
          "Furthermore, there are zero timed written exams. You build a practical evidence portfolio using your real workplace policies, team leadership evidence, and professional discussions with your dedicated 1-to-1 assessor.",
        ],
      },
      {
        subheading: "The CQC 'Fit Person' Interview",
        paragraphs: [
          "Once you hold your Level 5 diploma and are appointed by a provider, you will apply directly to the CQC for registration. This culminates in the 'Fit Person' interview with a CQC inspector.",
          "The inspector tests your understanding of the Health and Social Care Act 2008 (Regulated Activities) Regulations 2014, the Key Lines of Enquiry (KLOEs) or single assessment framework, and how you handle real-life safeguarding crises.",
          "Holding a recognised Level 5 diploma gives you the exact legislative terminology and evidence base needed to pass this interview with confidence on your first attempt.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I take the Level 5 Diploma if I am currently a Senior Carer or Deputy?",
        answer:
          "Yes. You do not already need to be a Registered Manager to enrol. However, you must be in a position where you have supervisory responsibility or access to senior workplace tasks (such as care planning, staff supervisions, or quality audits) so your assessor can validate your leadership evidence.",
      },
      {
        question: "How long does it take to complete the Level 5 Diploma?",
        answer:
          "Most working adults complete the programme within 9 to 12 months with 4 to 6 hours of weekly study. Fast-track options are available for experienced deputy managers with existing portfolios.",
      },
      {
        question: "Are there any exams?",
        answer:
          "No. Vocational RQF diplomas in Health and Social Care are 100% coursework, evidence portfolio, and professional discussion based. You are never required to sit a timed written exam.",
      },
    ],
  },
  {
    id: "post-level3-vs-level5",
    slug: "level-3-vs-level-5-health-and-social-care",
    title: "Level 3 vs Level 5 in Health & Social Care: Which Diploma Fits Your Role?",
    metaTitle: "Level 3 vs Level 5 Health and Social Care (Full Career & Salary Comparison)",
    metaDescription:
      "Confused between Level 3 and Level 5 diplomas in Adult Care? Compare entry requirements, job titles (Senior Carer vs Care Manager), salaries, study hours, and career trajectories.",
    publishedAt: "2026-09-22",
    updatedAt: "2026-10-12",
    category: "Career Pathways",
    readTimeMinutes: 6,
    author: {
      name: "Sarah Jenkins",
      role: "Senior Admissions & Career Pathway Advisor",
      credentials: "BA (Hons), Level 4 Assessor Coach",
    },
    image: "/images/certificate-moment.jpg",
    imageAlt: "Adult care students discussing vocational progression diplomas at Smartminds Training College",
    excerpt:
      "Choosing the right diploma level is the difference between qualifying quickly for your next promotion or feeling overwhelmed by premature managerial theory. Here is the objective breakdown.",
    keyTakeaways: [
      "Level 3 is designed for practicing Care Workers, Senior Carers, and Team Leaders focused on clinical excellence and mentoring junior colleagues.",
      "Level 5 is an advanced management qualification designed for Deputy Managers, Registered Managers, and Service Directors running care services.",
      "You do NOT always need to complete Level 3 before Level 5 if you already possess substantial workplace supervisory experience.",
      "Both qualifications are fully regulated by Ofqual and feature 0% written exams (100% evidence portfolio).",
    ],
    relatedCourseId: "c-adult-care-l3",
    sections: [
      {
        subheading: "Understanding the RQF Level Framework",
        paragraphs: [
          "In England and Northern Ireland, all vocational qualifications sit on the Regulated Qualifications Framework (RQF) overseen by Ofqual. Understanding where you sit on this ladder helps avoid enrolling in a programme that is either too basic or inappropriately advanced.",
          "A Level 3 Diploma is academically equivalent to an A-Level or advanced apprenticeship. A Level 5 Diploma is equivalent to a Foundation Degree or Higher National Diploma (HND).",
        ],
      },
      {
        subheading: "Level 3 Diploma in Adult Care: For Senior Practitioners",
        paragraphs: [
          "The Level 3 Diploma is the gold-standard benchmark for Senior Carers, Healthcare Assistants, and Care Coordinators. It demonstrates to employers and the CQC that you can safely handle complex individual care plans, manage medication, lead shifts, and champion safeguarding.",
        ],
        bulletPoints: [
          "Target Roles: Senior Care Assistant, Support Worker Lead, Care Coordinator, Domiciliary Field Supervisor",
          "Average Salary Range: £24,000 – £31,000 per annum",
          "Typical Duration: 6 to 9 months",
          "Study Commitment: 3 to 4 hours per week",
        ],
      },
      {
        subheading: "Level 5 Diploma in Leadership for Adult Care: For Managers & Leaders",
        paragraphs: [
          "If your objective is to register with the CQC, run a residential care home, or direct a domiciliary care service, Level 3 will not suffice. The Level 5 Diploma shifts focus from frontline clinical delivery to regulatory compliance, service auditing, recruitment, budgets, and strategic leadership.",
        ],
        bulletPoints: [
          "Target Roles: Registered Care Manager, Deputy Home Manager, Supported Living Service Lead, Care Operations Director",
          "Average Salary Range: £38,000 – £55,000+ per annum",
          "Typical Duration: 9 to 12 months",
          "Study Commitment: 5 to 7 hours per week",
        ],
      },
      {
        subheading: "Can You Skip Level 3 and Go Straight to Level 5?",
        paragraphs: [
          "A common misconception is that you must hold a Level 3 certificate before applying for Level 5. In reality, awarding bodies allow direct entry to Level 5 if you demonstrate prior supervisory experience.",
          "If you have worked in healthcare for over 2 years and currently coordinate shifts, audit medication logs, or supervise care staff, our admissions team can assess your CV for direct Level 5 enrolment.",
        ],
      },
    ],
    faqs: [
      {
        question: "Will holding Level 3 increase my hourly pay as a carer?",
        answer:
          "Yes. In most UK residential homes and NHS trusts, progressing from an entry-level carer to an RQF Level 3 Senior Carer qualifies you for a higher pay band, typically increasing hourly rates by £1.50 to £3.50 per hour.",
      },
      {
        question: "Can I pay in monthly instalments?",
        answer:
          "Yes. Smartminds provides direct college instalment schedules spread over 3, 6, 10, or 12 months with zero credit checks and zero third-party finance contracts.",
      },
    ],
  },
  {
    id: "post-aet-vs-cava",
    slug: "aet-vs-cava-difference-explained",
    title: "AET vs CAVA: Which Qualification Do You Need to Teach or Assess?",
    metaTitle: "AET vs CAVA Difference Explained (2026 UK Teacher & Assessor Guide)",
    metaDescription:
      "Understand the key differences between the Level 3 Award in Education and Training (AET) and the Level 3 Certificate in Assessing Vocational Achievement (CAVA).",
    publishedAt: "2026-09-28",
    updatedAt: "2026-10-14",
    category: "Teacher Training",
    readTimeMinutes: 5,
    author: {
      name: "Dr. Eleanor Vance",
      role: "Lead Healthcare Assessor & Former Registered Care Manager",
      credentials: "RN, BSc (Hons), CAVA, Level 5 Leadership & Management",
    },
    image: "/images/teacher-training.jpg",
    imageAlt: "Teacher training microteaching classroom session at Smartminds Training College",
    excerpt:
      "Want to train the next generation of healthcare workers or assess vocational apprenticeships? Here is the exact distinction between becoming an accredited Tutor (AET) vs an accredited Assessor (CAVA).",
    keyTakeaways: [
      "AET (Level 3 Award in Education and Training) certifies you to TEACH in the post-16 adult education sector.",
      "CAVA (Level 3 Certificate in Assessing Vocational Achievement) certifies you to ASSESS and grade vocational qualifications in workplaces and classrooms.",
      "Many UK healthcare practitioners hold BOTH qualifications to work as dual Lecturer/Assessors or freelance internal verifiers.",
      "Neither course requires written exams; AET involves a 15-minute micro-teach, while CAVA requires observing real vocational learners.",
    ],
    relatedCourseId: "c-aet-l3",
    sections: [
      {
        subheading: "The Teaching Route: Level 3 AET (Formerly PTLLS)",
        paragraphs: [
          "The Level 3 Award in Education and Training (AET)—previously known as PTLLS—is the introductory threshold qualification for anyone teaching adults in colleges, community centres, corporate workshops, or private training academies.",
          "It teaches you pedagogical fundamentals: how to plan inclusive lesson sessions, understand learning styles, manage classroom dynamics, and use constructive assessment.",
        ],
        bulletPoints: [
          "Who it is for: Healthcare trainers, salon educators, corporate instructors, college lecturers",
          "Assessment: 3 written unit assignments + one 15-minute 'micro-teach' delivered online via Zoom",
          "Duration: 4 to 8 weeks",
        ],
      },
      {
        subheading: "The Assessing Route: Level 3 CAVA (Formerly A1 / D32/D33)",
        paragraphs: [
          "While an AET qualifies you to deliver lessons, it does not give you regulatory authority to sign off national NVQ or RQF certificates. For that, you need the Level 3 CAVA.",
          "CAVA is the comprehensive UK assessor qualification. It qualifies you to assess occupational competence in the learner's actual workplace, as well as vocational skills in training suites and classrooms.",
        ],
        bulletPoints: [
          "Who it is for: Apprenticeship assessors, clinical competency validators, college NVQ assessors",
          "Assessment: Evidence portfolio assessing two real vocational learners in an accredited setting",
          "Duration: 8 to 16 weeks",
        ],
      },
      {
        subheading: "Which One Should You Choose?",
        paragraphs: [
          "If your goal is to lead classes, run induction seminars, and teach theory, begin with AET.",
          "If your goal is to evaluate care staff on the floor, observe healthcare practices, and sign off unit portfolios for an awarding body, choose CAVA.",
          "Many senior practitioners complete AET first to gain teaching confidence, then immediately progress to CAVA to become a fully dual-qualified Lecturer & Assessor.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I teach in secondary schools with an AET?",
        answer:
          "No. AET is specifically designed for the Further Education (FE) and post-16 adult lifelong learning sector. To teach in primary or secondary schools, you need QTS (Qualified Teacher Status) via a university PGCE.",
      },
      {
        question: "How do I do the micro-teach if I am studying online?",
        answer:
          "At Smartminds, you deliver your 15-minute micro-teach live on Zoom to your tutor and fellow adult students. You receive immediate constructive feedback and complete the requirement in an evening.",
      },
    ],
  },
];
