import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taller electromecánico | Servicios y repuestos",
  description: "Consultá por servicios electromecánicos, repuestos y presupuestos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}</body></html>;
}
