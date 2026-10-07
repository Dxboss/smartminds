import { Container } from "@/components/ui/Container";

export default function CourseDetailLoading() {
  return (
    <div className="bg-paper min-h-screen py-10 md:py-14">
      <Container>
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4 max-w-2xl">
            <div className="h-4 bg-line rounded w-40" />
            <div className="h-10 bg-line rounded w-3/4" />
            <div className="h-5 bg-line rounded w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="h-14 bg-white rounded border border-line" />
              <div className="h-14 bg-white rounded border border-line" />
              <div className="h-14 bg-white rounded border border-line" />
              <div className="h-14 bg-white rounded border border-line" />
            </div>
          </div>

          {/* 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="aspect-video bg-navy-900/10 rounded-lg" />
              <div className="h-14 bg-white rounded-lg border border-line" />
              <div className="h-48 bg-white rounded-lg border border-line" />
              <div className="h-40 bg-white rounded-lg border border-line" />
            </div>

            <div className="lg:col-span-4">
              <div className="h-96 bg-white rounded-lg border border-line" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
