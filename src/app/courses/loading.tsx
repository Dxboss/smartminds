import { Container } from "@/components/ui/Container";

export default function CoursesLoading() {
  return (
    <div className="bg-paper min-h-screen py-12">
      <Container>
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4 max-w-xl">
            <div className="h-4 bg-line rounded w-32" />
            <div className="h-10 bg-line rounded w-3/4" />
            <div className="h-5 bg-line rounded w-full" />
          </div>

          {/* Filter Bar Skeleton */}
          <div className="h-14 bg-white rounded-lg border border-line p-4 flex gap-4">
            <div className="h-6 bg-line rounded w-24" />
            <div className="h-6 bg-line rounded w-24" />
            <div className="h-6 bg-line rounded w-24" />
          </div>

          {/* Course Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-line p-6 space-y-4 h-96 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 bg-line rounded w-20" />
                    <div className="h-4 bg-line rounded w-16" />
                  </div>
                  <div className="h-6 bg-line rounded w-3/4" />
                  <div className="h-4 bg-line rounded w-full" />
                  <div className="h-4 bg-line rounded w-5/6" />
                </div>
                <div className="h-12 bg-line rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
