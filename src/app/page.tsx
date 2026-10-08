import { getContent } from "@/lib/content";
import { InquiryForm } from "@/components/inquiry-form";
import { PartPurchase } from "@/components/part-purchase";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

function BoltIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M27 3 9 27h12l-2 18 20-26H26l1-16Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}

function ServiceIcon({ index }: { index: number }) {
  const paths = ["M8 24h32M24 8v32M13 13l22 22M35 13 13 35", "M8 12h32v24H8zM15 19h18M15 26h12M15 31h7", "M24 8a14 14 0 1 0 14 14M24 8v14l10 6M33 8h7v7"];
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d={paths[index % paths.length]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ContactLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <a href={href} aria-label={label}>{children}</a>;
}

export default async function Home() {
  const { settings, services, categories, parts, faqs, testimonials, contentState } = await getContent();
  const whatsapp = settings.whatsapp?.replace(/\D/g, "");
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola, quisiera hacer una consulta.")}` : "#contacto";

  return <main style={{ "--red": settings.primary_color, "--ink": settings.secondary_color } as CSSProperties}>
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Ir al inicio">
        <span className="brand-mark">{settings.logo_url ? <img src={settings.logo_url} alt="" /> : <BoltIcon />}</span>
        <span className="brand-name">{settings.workshop_name}</span>
      </a>
      <nav aria-label="Navegación principal">
        <a href="#servicios">Servicios</a><a href="#repuestos">Repuestos</a><a href="#taller">El taller</a><a href="#preguntas">Preguntas</a>
      </nav>
      <a className="header-cta" href="#contacto"><span>Hablemos</span><span aria-hidden="true">↗</span></a>
    </header>
    {contentState === "unavailable" && <div className="content-unavailable" role="status">No pudimos cargar la información del taller en este momento. Intentá nuevamente más tarde.</div>}

    <section className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-line" />Electromecánica · Repuestos · Atención personalizada</p>
        <h1>El movimiento<br />empieza con <em>confianza.</em></h1>
        <p className="hero-intro">{settings.description}</p>
        <div className="hero-actions"><a className="button button-red" href="#contacto">Pedir presupuesto <span>↗</span></a><a className="button button-outline" href={whatsappHref} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noreferrer" : undefined}>Consultar por WhatsApp <span>↗</span></a></div>
        <div className="hero-note"><span className="status-dot" /> Servicios y repuestos con consulta directa al taller</div>
      </div>
      <div className="hero-image" role="img" aria-label="Espacio reservado para una fotografía real del taller">
        <div className="photo-corner corner-tl" /><div className="photo-corner corner-br" />
        <div className="image-grid" />
        <div className="image-mark"><BoltIcon /></div>
        <div className="image-caption"><span className="caption-rule" /><span>Fotografía del taller<br /><b>pendiente de incorporar</b></span></div>
        <span className="image-coordinate">IMAGEN 01 / TALLER</span>
      </div>
      <div className="hero-index"><span>01</span><span className="index-line" /><span>07</span></div>
    </section>

    <div className="ticker" aria-label="Especialidad del taller"><span>DIAGNÓSTICO</span><i>✳</i><span>REPARACIÓN</span><i>✳</i><span>REPUESTOS</span><i>✳</i><span>CONSULTA DIRECTA</span><i>✳</i><span>DIAGNÓSTICO</span></div>

    <section className="section services-section" id="servicios">
      <div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" />Lo que hacemos</p><h2>Servicios del <em>taller.</em></h2></div><p className="heading-aside">Cada necesidad merece una respuesta clara.<br />Consultanos para evaluar tu caso.</p></div>
      {services.length ? <div className="service-list">{services.map((service, i) => <article className="service-row" key={service.id}><span className="service-count">{String(i + 1).padStart(2, "0")}</span><div className="service-icon"><ServiceIcon index={i} /></div><div className="service-copy"><h3>{service.name}</h3><p>{service.description}</p></div>{service.image_url && <img className="service-image" src={service.image_url} alt={service.name} loading="lazy" />}<a className="row-arrow" href="#contacto" aria-label={`Consultar por ${service.name}`}>↗</a></article>)}</div> : <div className="empty-services"><span className="empty-symbol"><ServiceIcon index={0} /></span><div><h3>Servicios por presentar</h3><p>La información se completará con la especialidad y los trabajos reales del taller.</p></div><a href="#contacto">Consultá por tu necesidad <span>↗</span></a></div>}
    </section>

    <section className="parts-section" id="repuestos">
      <div className="section parts-inner"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" />Repuestos</p><h2>La pieza justa.<br /><em>Sin vueltas.</em></h2></div><p className="heading-aside">Disponibilidad y precio se confirman al consultar.<br />Los valores publicados son los únicos habilitados para pagar.</p></div>
        {categories.length > 0 && <div className="category-tags" aria-label="Categorías de repuestos">{categories.map((category) => <span key={category.id}>{category.name}</span>)}</div>}
        {parts.length ? <div className="parts-grid">{parts.map((part) => <article className="part-card" key={part.id}><div className="part-photo">{part.image_url ? <img src={part.image_url} alt={part.name} loading="lazy" /> : <span className="part-photo-placeholder"><BoltIcon /></span>}{part.availability === "disponible" && part.price && <span className="available-tag">Disponible</span>}</div><div className="part-details"><div><h3>{part.name}</h3><p>{part.description || "Consultá compatibilidad y disponibilidad."}</p></div><div className="part-bottom"><span className="price">{part.price ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(part.price)) : "Consultar precio"}</span><PartPurchase partId={part.id} purchasable={part.availability === "disponible" && Boolean(part.price)} /></div></div></article>)}</div> : <div className="parts-empty"><div className="parts-empty-symbol"><BoltIcon /></div><div><h3>Catálogo en preparación</h3><p>Consultanos por una pieza. Precio y existencia se confirman antes de cualquier compra.</p></div><a className="button button-dark" href={whatsappHref} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noreferrer" : undefined}>Consultar un repuesto <span>↗</span></a></div>}
        <p className="payment-note"><span>↗</span> Pagos procesados en el entorno seguro de Mercado Pago. Los medios y las cuotas disponibles se muestran allí para cada operación.</p>
      </div>
    </section>

    <section className="about-section" id="taller"><div className="about-photo" role="img" aria-label="Espacio reservado para una fotografía real del equipo o del taller"><div className="about-photo-lines" /><span>ESPACIO PARA FOTOGRAFÍA REAL</span><div className="about-photo-stamp">TALLER<br />ELECTRO<br />MECÁNICO</div></div><div className="about-copy"><p className="eyebrow"><span className="eyebrow-line" />Sobre el taller</p><h2>Oficio y atención<br /><em>de persona a persona.</em></h2><p>{settings.about_text || "La historia, el equipo, la experiencia y la zona de atención del taller se completarán con información real."}</p><a className="text-link" href="#contacto">Conocé cómo podemos ayudarte <span>↗</span></a></div></section>

    {testimonials.length > 0 && <section className="testimonials-section"><div className="section"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" />Experiencias</p><h2>Lo que dicen quienes <em>nos eligen.</em></h2></div></div><div className="testimonial-list">{testimonials.map((item) => <blockquote key={item.id}><span className="quote-mark">“</span><p>{item.comment}</p><cite>{item.name}</cite></blockquote>)}</div></div></section>}

    <section className="contact-section" id="contacto"><div className="section contact-layout"><div className="contact-copy"><p className="eyebrow"><span className="eyebrow-line" />Contacto</p><h2>Contanos qué<br />necesitás. <em>Estamos.</em></h2><p>Dejanos tu consulta con un medio de contacto y te responderemos.</p><div className="contact-details">
      {settings.whatsapp && <ContactLink href={`https://wa.me/${whatsapp}`} label="Escribir por WhatsApp"><span className="detail-index">01</span><span><small>WHATSAPP</small><b>{settings.whatsapp}</b></span><i>↗</i></ContactLink>}
      {settings.phone && <ContactLink href={`tel:${settings.phone.replace(/\s/g, "")}`} label="Llamar al taller"><span className="detail-index">02</span><span><small>TELÉFONO</small><b>{settings.phone}</b></span><i>↗</i></ContactLink>}
      {settings.email && <ContactLink href={`mailto:${settings.email}`} label="Enviar correo"><span className="detail-index">03</span><span><small>CORREO</small><b>{settings.email}</b></span><i>↗</i></ContactLink>}
      {(settings.address || settings.map_url) && <div className="contact-detail-static"><span className="detail-index">04</span><span><small>{settings.address ? "DIRECCIÓN" : "UBICACIÓN"}</small>{settings.address && <b>{settings.address}</b>}</span>{settings.map_url && <a href={settings.map_url} target="_blank" rel="noreferrer" aria-label="Ver ubicación">↗</a>}</div>}
      {settings.hours && <div className="contact-detail-static"><span className="detail-index">05</span><span><small>HORARIOS</small><b>{settings.hours}</b></span></div>}
      {(settings.instagram_url || settings.facebook_url) && <div className="contact-detail-static"><span className="detail-index">06</span><span><small>REDES</small><b className="social-links">{settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram ↗</a>}{settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook ↗</a>}</b></span></div>}
      {!settings.whatsapp && !settings.phone && !settings.email && !settings.address && !settings.hours && !settings.instagram_url && !settings.facebook_url && <p className="contact-pending">Los medios de contacto y la ubicación se publicarán cuando el taller los confirme.</p>}
    </div></div><div className="form-panel"><div className="form-heading"><span>HACÉ TU CONSULTA</span><span>↘</span></div><InquiryForm /></div></div></section>

    <section className="faq-section" id="preguntas"><div className="section faq-layout"><div><p className="eyebrow"><span className="eyebrow-line" />Ayuda</p><h2>Preguntas<br /><em>frecuentes.</em></h2><p className="faq-intro">Respuestas a las consultas más habituales.</p></div><div className="faq-list">{faqs.length ? faqs.map((faq) => <details key={faq.id}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>) : <div className="faq-empty"><span>Q.</span><div><h3>Preguntas y respuestas</h3><p>Esta sección se completará con información confirmada por el taller.</p></div></div>}</div></div></section>

    <footer className="site-footer"><div className="footer-top"><a className="brand footer-brand" href="#inicio"><span className="brand-mark">{settings.logo_url ? <img src={settings.logo_url} alt="" /> : <BoltIcon />}</span><span className="brand-name">{settings.workshop_name}</span></a><span className="footer-note">Reparación, repuestos y una conversación clara.</span><a className="back-top" href="#inicio">Volver al inicio ↑</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {settings.workshop_name}</span><div><a href="#servicios">Servicios</a><a href="#repuestos">Repuestos</a><a href="#contacto">Contacto</a><a href="#preguntas">Preguntas</a></div><span className="footer-credit">Sitio preparado para completar con datos reales.</span></div></footer>
  </main>;
}
