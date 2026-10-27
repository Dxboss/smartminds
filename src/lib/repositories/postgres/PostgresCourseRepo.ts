import { Course } from "@/content/types";
import { courses as defaultCourses } from "@/content/courses";
import { CourseRepo } from "../interfaces";
import { PermissionDeniedError, SessionUser } from "../types";
import { sql, isDbConfigured } from "@/lib/db";
import { sanitizeDbError } from "@/lib/migrations";

/**
 * Normalizes course records to guarantee that public course pages
 * never throw Internal Server Errors from missing arrays or malformed prices.
 */
export function normalizeCourseRecord(course: Course): Course {
  const record = (course || {}) as Course;
  return {
    ...record,
    start_dates: Array.isArray(record.start_dates) ? record.start_dates : [],
    faqs: Array.isArray(record.faqs) ? record.faqs : [],
    job_prospects: Array.isArray(record.job_prospects) ? record.job_prospects : [],
    progression: Array.isArray(record.progression) ? record.progression : [],
    tutoring_slots: Array.isArray(record.tutoring_slots) ? record.tutoring_slots : [],
    training_locations: Array.isArray(record.training_locations) ? record.training_locations : [],
    tuition_includes: Array.isArray(record.tuition_includes) ? record.tuition_includes : [],
    levels: Array.isArray(record.levels)
      ? record.levels
          .filter((level) =>
            Boolean(level) &&
            level.price_gbp !== null &&
            level.price_gbp !== undefined &&
            String(level.price_gbp).trim() !== "" &&
            Number.isFinite(Number(level.price_gbp))
          )
          .map((level) => ({
            ...level,
            course_id: level.course_id || record.id,
            level_label: level.level_label || "Course level",
            price_gbp: Number(level.price_gbp),
            regular_price_gbp:
              level.regular_price_gbp !== undefined && level.regular_price_gbp !== null
                ? Number(level.regular_price_gbp)
                : undefined,
            full_pay_discount_percent:
              level.full_pay_discount_percent !== undefined && level.full_pay_discount_percent !== null
                ? Number(level.full_pay_discount_percent)
                : null,
            entry_requirements: Array.isArray(level.entry_requirements) ? level.entry_requirements : [],
            units: Array.isArray(level.units) ? level.units : [],
            plans: Array.isArray(level.plans) ? level.plans : [],
          }))
      : [],
  };
}

export class PostgresCourseRepo implements CourseRepo {
  private async ensureCatalogSeeded(): Promise<void> {
    try {
      const countResult = (await sql`SELECT count(*)::int as count FROM course_catalog;`) as { count: number }[];
      if (countResult[0]?.count === 0) {
        console.log("[PostgresCourseRepo] Seeding initial courses into course_catalog...");
        for (const c of defaultCourses) {
          const norm = normalizeCourseRecord(c);
          await sql`
            INSERT INTO course_catalog (id, slug, title, category, type, published, data, updated_at)
            VALUES (${norm.id}, ${norm.slug}, ${norm.title}, ${norm.category || ""}, ${norm.type}, ${norm.published ?? true}, ${JSON.stringify(norm)}::jsonb, now())
            ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
    } catch (err) {
      console.error("[PostgresCourseRepo] Catalog seed check failed:", sanitizeDbError(err));
    }
  }

  async listCourses(): Promise<Course[]> {
    if (!isDbConfigured) {
      return defaultCourses.map(normalizeCourseRecord);
    }
    try {
      await this.ensureCatalogSeeded();
      const rows = (await sql`
        SELECT data FROM course_catalog ORDER BY title ASC;
      `) as { data: Course }[];

      if (rows.length === 0) {
        return defaultCourses.map(normalizeCourseRecord);
      }
      return rows.map((r) => normalizeCourseRecord(r.data));
    } catch (err) {
      console.error("[PostgresCourseRepo] listCourses query error:", sanitizeDbError(err));
      throw new Error(`Failed to list courses from database: ${sanitizeDbError(err)}`);
    }
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    if (!isDbConfigured) {
      const found = defaultCourses.find((c) => c.slug === slug || c.id === slug);
      return found ? normalizeCourseRecord(found) : null;
    }
    try {
      await this.ensureCatalogSeeded();
      const rows = (await sql`
        SELECT data FROM course_catalog WHERE slug = ${slug} OR id = ${slug} LIMIT 1;
      `) as { data: Course }[];

      if (rows.length > 0 && rows[0]?.data) {
        return normalizeCourseRecord(rows[0].data);
      }

      // Check fallback default courses
      const fallback = defaultCourses.find((c) => c.slug === slug || c.id === slug);
      return fallback ? normalizeCourseRecord(fallback) : null;
    } catch (err) {
      console.error(`[PostgresCourseRepo] getCourseBySlug(${slug}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to fetch course by slug from database: ${sanitizeDbError(err)}`);
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    if (!isDbConfigured) {
      const found = defaultCourses.find((c) => c.id === id);
      return found ? normalizeCourseRecord(found) : null;
    }
    try {
      await this.ensureCatalogSeeded();
      const rows = (await sql`
        SELECT data FROM course_catalog WHERE id = ${id} LIMIT 1;
      `) as { data: Course }[];

      if (rows.length > 0 && rows[0]?.data) {
        return normalizeCourseRecord(rows[0].data);
      }
      const fallback = defaultCourses.find((c) => c.id === id);
      return fallback ? normalizeCourseRecord(fallback) : null;
    } catch (err) {
      console.error(`[PostgresCourseRepo] getCourseById(${id}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to fetch course by id from database: ${sanitizeDbError(err)}`);
    }
  }

  async updateCourse(actor: SessionUser, course: Course): Promise<Course> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin" && actor.role !== "admin_staff") {
      throw new PermissionDeniedError("Administrative privileges required to edit courses.");
    }

    const norm = normalizeCourseRecord(course);

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured for course updates in production.");
    }

    try {
      // If admin_staff (not owner), preserve existing pricing integrity
      if (actor.role === "admin_staff") {
        const existing = await this.getCourseById(norm.id);
        if (existing && existing.levels) {
          norm.levels = norm.levels.map((lvl, idx) => {
            const orig = existing.levels[idx];
            if (!orig) return lvl;
            return {
              ...lvl,
              price_gbp: orig.price_gbp,
              regular_price_gbp: orig.regular_price_gbp,
              full_pay_discount_percent: orig.full_pay_discount_percent,
              plans: orig.plans,
            };
          });
        }
      }

      await sql`
        INSERT INTO course_catalog (id, slug, title, category, type, published, data, updated_at)
        VALUES (${norm.id}, ${norm.slug}, ${norm.title}, ${norm.category || ""}, ${norm.type}, ${norm.published ?? true}, ${JSON.stringify(norm)}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          type = EXCLUDED.type,
          published = EXCLUDED.published,
          data = EXCLUDED.data,
          updated_at = now();
      `;

      return norm;
    } catch (err) {
      console.error(`[PostgresCourseRepo] updateCourse(${norm.id}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to update course in PostgreSQL database: ${sanitizeDbError(err)}`);
    }
  }

  async createCourse(actor: SessionUser, newCourse: Course): Promise<Course> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin" && actor.role !== "admin_staff") {
      throw new PermissionDeniedError("Administrative privileges required to create courses.");
    }

    const norm = normalizeCourseRecord(newCourse);

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured for course creation in production.");
    }

    try {
      await sql`
        INSERT INTO course_catalog (id, slug, title, category, type, published, data, created_at, updated_at)
        VALUES (${norm.id}, ${norm.slug}, ${norm.title}, ${norm.category || ""}, ${norm.type}, ${norm.published ?? true}, ${JSON.stringify(norm)}::jsonb, now(), now())
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          type = EXCLUDED.type,
          published = EXCLUDED.published,
          data = EXCLUDED.data,
          updated_at = now();
      `;
      return norm;
    } catch (err) {
      console.error(`[PostgresCourseRepo] createCourse error:`, sanitizeDbError(err));
      throw new Error(`Failed to create course in PostgreSQL database: ${sanitizeDbError(err)}`);
    }
  }

  async deleteCourse(actor: SessionUser, id: string): Promise<boolean> {
    if (actor.role !== "owner_admin" && actor.role !== "super_admin") {
      throw new PermissionDeniedError("Only the College Owner or Super Admin can delete courses from the catalogue.");
    }

    if (!isDbConfigured) {
      throw new Error("DATABASE_URL is not configured for course deletion in production.");
    }

    try {
      await sql`DELETE FROM course_catalog WHERE id = ${id};`;
      return true;
    } catch (err) {
      console.error(`[PostgresCourseRepo] deleteCourse(${id}) error:`, sanitizeDbError(err));
      throw new Error(`Failed to delete course in PostgreSQL database: ${sanitizeDbError(err)}`);
    }
  }
}
