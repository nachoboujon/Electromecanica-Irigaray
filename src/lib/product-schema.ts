import { z } from "zod";
export const productSchema = z.object({
  name: z.string().trim().min(1).max(180),
  barcode: z.string().trim().max(64).transform((v) => v ? v.toUpperCase().replace(/\s+/g, "") : null),
  category_id: z.string().uuid().nullable(),
  description: z.string().trim().max(2000).nullable(),
  image_url: z.string().trim().max(1000).nullable().refine((v) => !v || v.startsWith("/images/") || /^https:\/\//i.test(v), "La imagen debe ser una URL HTTPS o una ruta /images/ local."),
  price: z.number().finite().positive().nullable(),
  availability: z.enum(["consultar", "disponible", "sin_stock"]),
  is_published: z.boolean(),
});
