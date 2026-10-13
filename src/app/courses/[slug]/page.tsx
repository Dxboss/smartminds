import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseRepo } from "@/lib/repositories";
import { CourseDetailClient, CourseStructuredData } from "@/components/course";

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const courseRepo = getCourseRepo();
  const allCourses = await courseRepo.listCourses();
  return allCourses
    .filter((c) => c.published)
    .map((c) => ({
      slug: c.slug,
    }));
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const courseRepo = getCourseRepo();
  const course = await courseRepo.getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Course Not Found | Smartminds Training College",
    };
  }

  return {
    title: course.seo_title,
    description: course.seo_description,
    openGraph: {
      title: course.seo_title,
      description: course.seo_description,
      type: "article",
      locale: "en_GB",
    },
    alternates: {
      canonical: `/courses/${course.slug}`,
    },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const courseRepo = getCourseRepo();
  const [course, allCourses] = await Promise.all([
    courseRepo.getCourseBySlug(slug),
    courseRepo.listCourses(),
  ]);

  if (!course || !course.published) {
    notFound();
  }

  return (
    <main>
      <CourseStructuredData course={course} />
      <CourseDetailClient course={course} allCourses={allCourses} />
    </main>
  );
}
