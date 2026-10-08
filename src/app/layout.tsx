import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electromecánica Irigaray | Servicios y repuestos",
  description: "Electricidad del automotor, aire acondicionado, inyección electrónica, llaves electrónicas y repuestos.",
  icons: { icon: "/logo-taller-irigaray.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}</body></html>;
}
