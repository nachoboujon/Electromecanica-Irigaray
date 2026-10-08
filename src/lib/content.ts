import { pool } from "@/lib/db";

export type SiteSettings = {
  workshop_name: string; description: string; about_text: string | null; logo_url: string | null; hero_image_url: string | null; about_image_url: string | null; hero_video_url: string | null; hero_video_poster_url: string | null;
  primary_color: string; secondary_color: string;
  whatsapp: string | null; phone: string | null; email: string | null; address: string | null;
  hours: string | null; instagram_url: string | null; facebook_url: string | null; map_url: string | null;
};
export type Service = { id: string; name: string; category: string; description: string; image_url: string | null };
export type Category = { id: string; name: string; description: string | null };
export type Part = { id: string; category_id: string | null; category_name?: string | null; barcode: string | null; name: string; description: string | null; image_url: string | null; price: string | null; availability: string; is_published: boolean };
export type Faq = { id: string; question: string; answer: string };

export const defaultServices: Service[] = [
  { id: "electricidad-automotriz", category: "Electricidad del automotor", name: "Electricidad automotriz", description: "Revisión de cableado y componentes eléctricos del vehículo.", image_url: "/images/services/electricidad-automotriz.webp" },
  { id: "arranques", category: "Electricidad del automotor", name: "Arranques", description: "Reparación de motores de arranque y sus componentes.", image_url: "/images/services/arranques.webp" },
  { id: "alternadores", category: "Electricidad del automotor", name: "Alternadores", description: "Revisión y reparación de alternadores.", image_url: "/images/services/alternadores.webp" },
  { id: "motores-electricos", category: "Electricidad del automotor", name: "Motores eléctricos", description: "Reparación de motores eléctricos en general.", image_url: "/images/services/motores-electricos.webp" },
  { id: "aire-acondicionado", category: "Climatización", name: "Aire acondicionado automotor", description: "Reparación e instalación del sistema de climatización.", image_url: "/images/services/aire-acondicionado.webp" },
  { id: "carga-refrigerante", category: "Climatización", name: "Carga de refrigerante", description: "Carga de gas refrigerante del aire acondicionado.", image_url: "/images/services/carga-refrigerante.webp" },
  { id: "recambio-compresores", category: "Climatización", name: "Recambio de compresores", description: "Recambio de compresores del aire acondicionado.", image_url: "/images/services/recambio-compresores.webp" },
  { id: "calefaccion-automotriz", category: "Climatización", name: "Calefacción automotriz", description: "Revisión del circuito de calefacción y circulación de aire al habitáculo.", image_url: "/images/services/calefaccion-automotriz.webp" },
  { id: "diagnostico-computarizado", category: "Diagnóstico electrónico", name: "Diagnóstico computarizado y detección de fallas", description: "Lectura electrónica para diagnosticar fallas del vehículo.", image_url: "/images/services/diagnostico-computarizado.webp" },
  { id: "reparacion-computadora-automotriz", category: "Diagnóstico electrónico", name: "Reparación de computadora automotriz", description: "Reparación de PC automotriz y módulos electrónicos.", image_url: "/images/services/reparacion-computadora-automotriz.webp" },
  { id: "puesta-a-punto-electronica", category: "Diagnóstico electrónico", name: "Puesta a punto electrónica", description: "Puesta a punto electrónica con instrumentos de diagnóstico.", image_url: "/images/services/puesta-a-punto-electronica.webp" },
  { id: "llaves-electronicas", category: "Seguridad electrónica", name: "Llaves electrónicas", description: "Programación de chips y duplicado de llaves para distintas marcas.", image_url: "/images/services/llaves-electronicas.webp" },
  { id: "venta-repuestos", category: "Repuestos", name: "Venta de repuestos", description: "Repuestos vinculados a los servicios del taller. Consultá por la pieza que necesitás.", image_url: "/images/services/venta-repuestos.webp" },
  { id: "sistemas-gas-vehicular", category: "Gas vehicular", name: "Instalación de sistemas de gas para vehículos", description: "Instalamos sistemas de gas para vehículos. Consultanos por la compatibilidad con tu auto y solicitá un presupuesto", image_url: "/images/services/sistemas-gas-vehicular.webp" },
];

export const defaultCategories: Category[] = [
  { id: "electricidad", name: "Electricidad del automotor", description: null },
  { id: "climatizacion", name: "Aire acondicionado", description: null },
  { id: "inyeccion", name: "Inyección electrónica", description: null },
  { id: "llaves", name: "Llaves electrónicas", description: null },
];

export const defaultFaqs: Faq[] = [
  { id: "servicios", question: "¿Qué servicios realiza el taller?", answer: "Electricidad automotriz, climatización, diagnóstico electrónico, llaves y los demás servicios listados en esta página. Escribinos para consultar por tu caso." },
  { id: "turnos", question: "¿Cómo puedo consultar por un turno?", answer: "Dejanos tu consulta en el formulario de contacto. Cuando se completen los datos del taller, también podrás comunicarte por los medios publicados en esta página." },
  { id: "repuestos", question: "¿Puedo consultar por un repuesto?", answer: "Sí. En la sección Repuestos podés escribirnos para consultar por piezas relacionadas con los servicios del taller. Precio y disponibilidad se confirman al responder." },
  { id: "pagos", question: "¿Qué medios de pago están disponibles?", answer: "Si hay productos habilitados para compra, Mercado Pago mostrará los medios disponibles para esa operación dentro de su checkout oficial." },
];

export const defaultSettings: SiteSettings = {
  workshop_name: "Electromecánica Irigaray",
  description: "Electricidad del automotor, aire acondicionado, inyección electrónica y llaves electrónicas. Consultá por tu necesidad.",
  about_text: null, logo_url: "/logo-taller-irigaray.png", hero_image_url: null, about_image_url: null, hero_video_url: null, hero_video_poster_url: null, whatsapp: null, phone: null, email: null,
  primary_color: "#e52d35", secondary_color: "#101010",
  address: null, hours: null, instagram_url: null, facebook_url: null, map_url: null,
};

export async function getContent() {
  if (!process.env.DATABASE_URL) return { settings: defaultSettings, services: defaultServices, categories: defaultCategories, parts: [], faqs: defaultFaqs, testimonials: [], contentState: "unconfigured" as const };
  try {
    const [settings, services, categories, parts, faqs, testimonials] = await Promise.all([
      pool.query("SELECT * FROM site_settings WHERE id = 1"),
      pool.query("SELECT id, name, category, description, image_url FROM services WHERE is_published = true ORDER BY display_order, created_at"),
      pool.query("SELECT id, name, description FROM parts_categories ORDER BY display_order, name"),
      pool.query("SELECT p.id, p.category_id, c.name AS category_name, p.barcode, p.name, p.description, p.image_url, p.price, p.availability, p.is_published FROM parts p LEFT JOIN parts_categories c ON c.id = p.category_id WHERE p.is_published = true ORDER BY p.name"),
      pool.query("SELECT id, question, answer FROM faqs WHERE is_published = true ORDER BY display_order, created_at"),
      pool.query("SELECT id, name, comment FROM testimonials WHERE is_published = true ORDER BY created_at DESC"),
    ]);
    return { settings: settings.rows[0] ?? defaultSettings, services: services.rows.length ? services.rows as Service[] : defaultServices, categories: categories.rows.length ? categories.rows as Category[] : defaultCategories, parts: parts.rows as Part[], faqs: faqs.rows.length ? faqs.rows as Faq[] : defaultFaqs, testimonials: testimonials.rows as { id: string; name: string; comment: string }[], contentState: "ready" as const };
  } catch (error) {
    console.error("Unable to load public site content:", error);
    return { settings: defaultSettings, services: defaultServices, categories: defaultCategories, parts: [], faqs: defaultFaqs, testimonials: [], contentState: "unavailable" as const };
  }
}
