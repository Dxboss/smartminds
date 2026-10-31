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
    relatedCourseId: "course-leadership-care",
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
    relatedCourseId: "course-adult-care",
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
    relatedCourseId: "course-aet",
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
  {
    id: "post-functional-skills-maths-english",
    slug: "functional-skills-maths-and-english-level-2-guide",
    title: "Functional Skills English & Maths Level 2: The Fast-Track GCSE Equivalent (2026 Guide)",
    metaTitle: "Functional Skills Level 2 Online: Fast GCSE Equivalent Guide 2026",
    metaDescription:
      "Everything you need to know about Functional Skills Level 2 in English and Maths. Compare to GCSEs (Grade 4/C), discover university nursing entry rules, online exam setups, and fast-track pass strategies.",
    publishedAt: "2026-10-02",
    updatedAt: "2026-10-25",
    category: "Funding & Advice",
    readTimeMinutes: 6,
    author: {
      name: "Marcus Adebayo",
      role: "Head of Functional Skills & Numeracy Lead",
      credentials: "BSc, PGCE, Level 5 Subject Specialist",
    },
    image: "/images/hero-learner-live.webp",
    imageAlt: "Adult learner preparing for Functional Skills Level 2 online exam at home with live tutor support",
    excerpt:
      "Missing a GCSE Grade 4 (C) in English or Maths to enter university, start an apprenticeship, or get promoted? A regulated Level 2 Functional Skills qualification offers the exact legal equivalence in a fraction of the time.",
    keyTakeaways: [
      "Functional Skills Level 2 in English and Maths is officially recognized by UK employers, the NHS, and over 95% of UK universities as identical to a GCSE Grade 4 / Grade C.",
      "Unlike traditional GCSEs that take 1 to 2 years and have fixed summer exams, Functional Skills exams can be booked year-round and completed 100% online from home.",
      "Most adult students pass their Level 2 exam in 4 to 8 weeks with targeted live tutor classes and past-paper revision.",
      "Assessment is focused on practical, real-world communication and calculations rather than abstract academic theories.",
    ],
    relatedCourseId: "course-functional-skills",
    sections: [
      {
        subheading: "What Is Functional Skills Level 2 and How Does It Compare to GCSE?",
        paragraphs: [
          "Functional Skills qualifications were created by the UK Department for Education (DfE) and regulated by Ofqual to provide a direct, practical alternative to traditional GCSE examinations.",
          "While GCSE Maths and English often test complex literary analysis or theoretical algebra, Functional Skills focuses on competencies required in modern British workplaces: interpreting statistics, calculating percentages and VAT, composing professional reports, and communicating effectively.",
        ],
        callout: {
          title: "Official Government & University Recognition",
          text: "Under the UK Regulated Qualifications Framework (RQF), a Level 2 Functional Skills qualification is legally equivalent to GCSE Grade 4 (legacy Grade C). It satisfies the entry criteria for UK university nursing degrees, teacher training, policing, and Level 3–5 apprenticeships.",
          variant: "highlight",
        },
      },
      {
        subheading: "Why Adult Learners Choose Functional Skills Over GCSE",
        paragraphs: [
          "For working adults with shift rotas, family responsibilities, or urgent promotion deadlines, enrolling in a 9-month evening GCSE course at a local college is impractical.",
          "Functional Skills provides four critical advantages for busy adults:",
        ],
        bulletPoints: [
          "Year-Round Flexible Exam Dates: Exams are available every month rather than waiting for May/June.",
          "Rapid Completion: Average study time is 4 to 8 weeks compared to 1 to 2 academic years for GCSE.",
          "Remote Online Invigilation: Sit your official exam securely from your own laptop at home without travelling to an exam centre.",
          "No Coursework Deadlines: You only take the mock exams when you and your tutor feel 100% ready.",
        ],
      },
      {
        subheading: "What Does the Functional Skills Level 2 Exam Involve?",
        paragraphs: [
          "Functional Skills English consists of three distinct components: Reading, Writing, and a Speaking, Listening & Communicating (SLC) session conducted in a small group via Zoom.",
          "Functional Skills Maths consists of two sections taken back-to-back: a 25-minute non-calculator section testing mental arithmetic and fundamental calculations, followed by an 80-minute calculator section applying maths to practical scenarios like household budgeting and workplace measurements.",
        ],
      },
      {
        subheading: "How Smartminds Guarantees First-Time Pass Readiness",
        paragraphs: [
          "At Smartminds Training College, learners receive weekly live evening classes on Zoom with an expert tutor, complete unlimited marked practice papers, and get direct 1-to-1 feedback before booking the real exam.",
          "We offer flexible payment instalment plans (£100 deposit) and free funding checks for eligible London and Essex residents.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does NHS and UCAS accept Functional Skills Level 2 for Nursing?",
        answer:
          "Yes. Almost all UK nursing programmes and NHS trusts accept Level 2 Functional Skills English and Maths as fulfilling the GCSE Grade 4/C entry criteria. Always check with your specific university admissions office to confirm course-specific guidelines.",
      },
      {
        question: "Can I take the exam online from home?",
        answer:
          "Yes. Our examinations are officially invigilated via secure remote proctoring software. You take the exam on your personal laptop or desktop computer with a working webcam and microphone in a quiet room.",
      },
      {
        question: "How quickly do I get my exam results and certificate?",
        answer:
          "Provisional results are returned within 6 to 10 working days, and your official Ofqual-regulated certificate from TQUK/NCFE is dispatched shortly thereafter.",
      },
    ],
  },
  {
    id: "post-early-years-educator-guide",
    slug: "how-to-become-a-qualified-early-years-educator",
    title: "How to Become a Qualified Early Years Educator (EYE) in the UK (2026 Route)",
    metaTitle: "How to Become an Early Years Educator (Level 3 EYE Guide 2026)",
    metaDescription:
      "Complete career guide to becoming a qualified Nursery Practitioner and Early Years Educator (EYE) in the UK. Understand Level 3 Diploma requirements, staff ratios, salary bands (£22k–£32k), and study options.",
    publishedAt: "2026-10-08",
    updatedAt: "2026-10-28",
    category: "Career Pathways",
    readTimeMinutes: 7,
    author: {
      name: "Sarah Jenkins",
      role: "Senior Admissions & Career Pathway Advisor",
      credentials: "BA (Hons), Level 4 Assessor Coach",
    },
    image: "/images/early-years-training.jpg",
    imageAlt: "Early Years Educator reading with young children in an accredited UK nursery setting",
    excerpt:
      "Working with young children from birth to 5 years is one of the most rewarding vocations in the UK education sector. Here is the verified regulatory route to gaining your full 'license to practise' as a qualified Early Years Educator.",
    keyTakeaways: [
      "The Level 3 Diploma for the Early Years Educator (EYE) is the mandatory benchmark qualification required by the UK Department for Education to count in staff-to-child ratios.",
      "Unqualified nursery assistants often earn minimum wage, while qualified Level 3 Early Years Practitioners command £22,000 to £32,000 per annum with opportunities to advance to Room Leader or Nursery Deputy Manager.",
      "You can study your theoretical modules live online via weekly Zoom evening seminars while working or volunteering in a registered nursery setting.",
      "Assessment is 100% coursework and practical workplace observations — there are zero timed written exams.",
    ],
    relatedCourseId: "course-childcare-ey",
    sections: [
      {
        subheading: "What Is a Full and Relevant Early Years Educator (EYE) Qualification?",
        paragraphs: [
          "In England, the Early Years Foundation Stage (EYFS) statutory framework strictly governs staff qualification ratios in nurseries, preschools, and reception classes.",
          "To count within the statutory staffing ratios as a qualified Level 3 practitioner, your qualification must be recognized by the Department for Education as 'full and relevant'. The Level 3 Diploma for the Early Years Educator (EYE) provides this exact regulatory license-to-practise.",
        ],
        callout: {
          title: "EYFS Staff-to-Child Ratio Benefit",
          text: "Nurseries are legally required to maintain at least 50% qualified staff in every room. Holding a recognised Level 3 EYE diploma makes you instantly employable across private day nurseries, school nurseries, and children's centres.",
          variant: "highlight",
        },
      },
      {
        subheading: "Key Subjects Covered in the Level 3 Diploma",
        paragraphs: [
          "The qualification equips you with deep professional expertise across child development and early pedagogy:",
        ],
        bulletPoints: [
          "Holistic child development milestones from birth to 5 years (and up to 7 years)",
          "Promoting speech, language, literacy, and early mathematical concepts through play",
          "Safeguarding children, child protection laws, and statutory EYFS reporting duties",
          "Supporting children with Special Educational Needs and Disabilities (SEND)",
          "Building effective working partnerships with parents, carers, and external health agencies",
        ],
      },
      {
        subheading: "How Practical Workplace Placement Works",
        paragraphs: [
          "Because this is a practice-based license, learners must complete placement hours in a registered early years setting (either through paid employment or voluntary placement).",
          "Your dedicated Smartminds workplace assessor evaluates your practical skills through direct observation and professional discussions, providing support every step of the way.",
        ],
      },
      {
        subheading: "Career Progression: From Room Leader to Nursery Manager",
        paragraphs: [
          "Earning your Level 3 EYE qualification opens the door to rapid career progression in early childhood education. Practitioners routinely advance to Senior Room Leader, Special Educational Needs Coordinator (SENCo), and Nursery Deputy Manager.",
          "Furthermore, it serves as the direct entry springboard to our Level 5 Diploma in Leadership & Management for Children and Young People's Services.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need GCSE Maths and English to enrol on the Level 3 EYE?",
        answer:
          "You can enrol without GCSEs, but to count in Level 3 ratios upon completion, government rules require holding Level 2 Functional Skills or GCSE Grade 4/C in English and Maths. Smartminds allows you to study Functional Skills alongside your Early Years diploma.",
      },
      {
        question: "Can I complete the placement in my current nursery job?",
        answer:
          "Yes! If you are already employed as a nursery assistant or support worker in an Ofsted-registered setting, your normal working hours count toward your practical placement requirements.",
      },
      {
        question: "Are there any exams on this course?",
        answer:
          "No. The qualification is assessed entirely through written coursework assignments, longitudinal child observations, and practical portfolio evidence verified by your 1-to-1 assessor.",
      },
    ],
  },
];
