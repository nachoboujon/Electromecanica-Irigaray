import { isAdmin } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { AdminConsole } from "@/components/admin-console";
import { pool } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function AdminPage(){if(!await isAdmin())return <AdminLogin/>;try{const [products,categories]=await Promise.all([pool.query("SELECT p.id,p.category_id,c.name AS category_name,p.barcode,p.name,p.description,p.image_url,p.price,p.availability,p.is_published,p.created_at,p.updated_at FROM parts p LEFT JOIN parts_categories c ON c.id=p.category_id ORDER BY p.updated_at DESC"),pool.query("SELECT id,name FROM parts_categories ORDER BY display_order,name")]);return <AdminConsole initialProducts={products.rows} categories={categories.rows}/>;}catch{return <main className="admin-login"><section><h1>Catálogo <em>no disponible.</em></h1><p>Revisá la conexión de base de datos y que las migraciones estén aplicadas.</p><a className="button button-outline" href="/">Volver al sitio</a></section></main>}}
