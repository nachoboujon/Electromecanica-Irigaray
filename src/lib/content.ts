import { pool } from "@/lib/db";

export type SiteSettings = {
  workshop_name: string; description: string; about_text: string | null; logo_url: string | null;
  primary_color: string; secondary_color: string;
  whatsapp: string | null; phone: string | null; email: string | null; address: string | null;
  hours: string | null; instagram_url: string | null; facebook_url: string | null; map_url: string | null;
};
export type Service = { id: string; name: string; description: string; image_url: string | null };
export type Category = { id: string; name: string; description: string | null };
export type Part = { id: string; category_id: string | null; name: string; description: string | null; image_url: string | null; price: string | null; availability: string; };
export type Faq = { id: string; question: string; answer: string };

export const defaultSettings: SiteSettings = {
  workshop_name: "Nombre del taller pendiente",
  description: "Especialidad, zona de atención y propuesta del taller pendientes de completar.",
  about_text: null, logo_url: null, whatsapp: null, phone: null, email: null,
  primary_color: "#e52d35", secondary_color: "#101010",
  address: null, hours: null, instagram_url: null, facebook_url: null, map_url: null,
};

export async function getContent() {
  if (!process.env.DATABASE_URL) return { settings: defaultSettings, services: [], categories: [], parts: [], faqs: [], testimonials: [], contentState: "unconfigured" as const };
  try {
    const [settings, services, categories, parts, faqs, testimonials] = await Promise.all([
      pool.query("SELECT * FROM site_settings WHERE id = 1"),
      pool.query("SELECT id, name, description, image_url FROM services WHERE is_published = true ORDER BY display_order, created_at"),
      pool.query("SELECT id, name, description FROM parts_categories ORDER BY display_order, name"),
      pool.query("SELECT id, category_id, name, description, image_url, price, availability FROM parts WHERE is_published = true ORDER BY name"),
      pool.query("SELECT id, question, answer FROM faqs WHERE is_published = true ORDER BY display_order, created_at"),
      pool.query("SELECT id, name, comment FROM testimonials WHERE is_published = true ORDER BY created_at DESC"),
    ]);
    return { settings: settings.rows[0] ?? defaultSettings, services: services.rows as Service[], categories: categories.rows as Category[], parts: parts.rows as Part[], faqs: faqs.rows as Faq[], testimonials: testimonials.rows as { id: string; name: string; comment: string }[], contentState: "ready" as const };
  } catch (error) {
    console.error("Unable to load public site content:", error);
    return { settings: defaultSettings, services: [], categories: [], parts: [], faqs: [], testimonials: [], contentState: "unavailable" as const };
  }
}
