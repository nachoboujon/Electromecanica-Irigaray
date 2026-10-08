import { getContent } from "@/lib/content";
import { InquiryForm } from "@/components/inquiry-form";
import { PartPurchase } from "@/components/part-purchase";
import { ScrollReveal } from "@/components/scroll-reveal";
import { LandingMotion } from "@/components/landing-motion";
import { TransitionDivider } from "@/components/transition-divider";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

function BoltIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M27 3 9 27h12l-2 18 20-26H26l1-16Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}

function ServiceIcon({ index }: { index: number }) {
  const paths = ["M27 4 12 25h11l-2 19 16-25H26l1-15Z", "M24 7v34M9 15l30 18M39 15 9 33M15 9l18 30M33 9 15 39", "M15 15h18v18H15zM20 20h8v8h-8zM10 18h5M10 24h5M10 30h5M33 18h5M33 24h5M33 30h5M18 10v5M24 10v5M30 10v5M18 33v5M24 33v5M30 33v5", "M29 7a11 11 0 0 0-13 14L7 30a6 6 0 0 0 8 8l9-9A11 11 0 0 0 38 16l-7 7-6-6 7-7a11 11 0 0 0-3-3Z"];
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d={paths[index % paths.length]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ContactLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <a href={href} aria-label={label}>{children}</a>;
}

export default async function Home() {
  const { settings, services, categories, parts, faqs, testimonials, contentState } = await getContent();
  const whatsapp = settings.whatsapp?.replace(/\D/g, "");
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola, quisiera hacer una consulta.")}` : "#contacto";
  const logoUrl = settings.logo_url || "/logo-taller-irigaray.png";

  return <main data-landing-motion style={{ "--red": settings.primary_color, "--ink": settings.secondary_color } as CSSProperties}>
    <LandingMotion />
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label={`Inicio, ${settings.workshop_name}`}>
        <span className="brand-mark brand-logo"><img src={logoUrl} alt="" /></span>
      </a>
      <nav aria-label="Navegación principal">
        <a href="#servicios">Servicios</a><a href="/repuestos">Repuestos</a><a href="#taller">El taller</a><a href="#preguntas">Preguntas</a>
      </nav>
        <a className="header-cta" href="#contacto"><span>Hablemos</span><span aria-hidden="true">↗</span></a>
    </header>
    <nav className="mobile-section-nav" aria-label="Secciones del sitio"><a href="#inicio">Inicio</a><a href="#servicios">Servicios</a><a href="/repuestos">Repuestos</a><a href="#taller">El taller</a><a href="#preguntas">Preguntas</a><a href="#contacto">Contacto</a></nav>
    {contentState === "unavailable" && <div className="content-unavailable" role="status">No pudimos cargar la información del taller en este momento. Intentá nuevamente más tarde.</div>}

    <section className="hero" id="inicio" data-motion-section="inicio">
      <ScrollReveal><div className="hero-copy" data-reveal>
        <p className="eyebrow"><span className="eyebrow-line" />Electricidad · Inyección · Climatización · Llaves</p>
        <h1>El movimiento<br />empieza con <em>confianza.</em></h1>
        <p className="hero-intro">{settings.description}</p>
        <div className="hero-actions"><a className="button button-red" href="#contacto">Pedir presupuesto <span>↗</span></a><a className="button button-outline" href={whatsappHref} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noreferrer" : undefined}>{whatsapp ? "Consultar por WhatsApp" : "Dejanos tu consulta"} <span>↗</span></a></div>
        <div className="hero-note"><span className="status-dot" /> Servicios y repuestos con consulta directa al taller</div>
      </div>
      <div className="hero-video-slot" data-reveal>{settings.hero_video_url ? <video controls playsInline preload="metadata" poster={settings.hero_video_poster_url || undefined} aria-label="Presentación del taller y sus servicios"><source src={settings.hero_video_url}/></video> : <div className="hero-video-placeholder"><span className="video-placeholder-tag">VIDEO</span><span className="video-placeholder-play" aria-hidden="true">▶</span><strong>Presentación del taller<br/>y sus servicios</strong><small>PRÓXIMAMENTE</small><span className="video-placeholder-url">hero_video_url · archivo MP4 o URL</span></div>}</div>
      <div className={`hero-image ${settings.hero_image_url ? "has-photo" : ""}`} data-reveal>
        {settings.hero_image_url ? <img className="hero-photo" src={settings.hero_image_url} alt="" /> : <>
          <div className="photo-corner corner-tl" /><div className="photo-corner corner-br" />
          <div className="image-grid" />
          <svg className="energy-diagram" viewBox="0 0 420 270" role="img" aria-label="Ilustración técnica de un circuito eléctrico automotor"><path className="hero-logo-trace" d="M25 70C91 69 143 51 198 28c52-21 103-19 150-1 28 11 42 25 62 34" pathLength="1000" /><path className="diagram-outline" d="M86 78h75l26 31h47l29-31h70v113h-70l-29-31h-47l-26 31H86z" /><path className="energy-track" d="M64 135h76l25-34h53l27 34h101" /><circle className="diagram-node" cx="64" cy="135" r="7" /><circle className="diagram-node" cx="346" cy="135" r="7" /><path className="diagram-mark" d="m207 112-17 27h16l-5 21 22-31h-17l1-17Z" /></svg>
          <div className="image-caption"><span className="caption-rule" /><span>Imagen real del taller<br /><b>espacio listo para agregarla</b></span></div>
          <span className="image-coordinate">ILUSTRACIÓN TÉCNICA · ELECTRICIDAD AUTOMOTOR</span>
        </>}
        {settings.hero_image_url && <span className="image-coordinate">TALLER · FOTO</span>}
      </div></ScrollReveal>
    </section>

    <TransitionDivider kind="diagonal"><div className="ticker" aria-label="Especialidad del taller"><span>DIAGNÓSTICO</span><i aria-hidden="true">·</i><span>REPARACIÓN</span><i aria-hidden="true">·</i><span>REPUESTOS</span><i aria-hidden="true">·</i><span>CONSULTA DIRECTA</span><i aria-hidden="true">·</i><span>DIAGNÓSTICO</span></div></TransitionDivider>

    <div className="services-parts-journey">
      <section className="services-section" id="servicios" data-motion-section="servicios">
        <ScrollReveal><div className="section services-content">
          <div className="section-heading" data-reveal><div><p className="eyebrow"><span className="eyebrow-line" />Lo que hacemos</p><h2>Servicios del <em>taller.</em></h2></div><p className="heading-aside">Cada necesidad merece una respuesta clara.<br />Consultanos para evaluar tu caso.</p></div>
          {services.length ? <div className="service-grid">{services.map((service, i) => <article className={`service-card ${service.id === "sistemas-gas-vehicular" ? "service-card--gas" : ""}`} data-reveal key={service.id}><div className="service-card-top"><span className="service-icon"><ServiceIcon index={i} /></span><span className="service-category">{service.category}</span></div>{service.image_url ? <img className="service-image" src={service.image_url} alt={`${service.name}: ${service.description}`} loading="lazy" decoding="async" /> : <div className="service-visual" aria-hidden="true"><ServiceIcon index={i} /><span>{String(i + 1).padStart(2, "0")}</span></div>}<h3>{service.name}</h3><ul className="service-offerings">{service.description.split(";").map((offering) => <li key={offering}>{offering.trim()}</li>)}</ul><a className="service-action" href="#contacto">Consultar este servicio <span aria-hidden="true">↗</span></a></article>)}</div> : <div className="empty-services" data-reveal><span className="empty-symbol"><ServiceIcon index={0} /></span><div><h3>Servicios por presentar</h3><p>La información se completará con la especialidad y los trabajos reales del taller.</p></div><a href="#contacto">Consultá por tu necesidad <span>↗</span></a></div>}
        </div></ScrollReveal>
      </section>

      <TransitionDivider kind="contour" />

      <section className="parts-section" id="repuestos" data-motion-section="repuestos">
        <ScrollReveal><div className="section parts-inner"><div className="section-heading" data-reveal><div><p className="eyebrow"><span className="eyebrow-line" />Repuestos</p><h2>La pieza justa.<br /><em>Sin vueltas.</em></h2></div><p className="heading-aside">Disponibilidad y precio se confirman al consultar.<br />Los valores publicados son los únicos habilitados para pagar.</p></div>
          {categories.length > 0 && <div className="category-tags" data-reveal aria-label="Categorías de repuestos">{categories.map((category) => <span key={category.id}>{category.name}</span>)}</div>}
          {parts.length ? <div className="parts-grid">{parts.map((part) => <article className="part-card" data-scroll-card key={part.id}><div className="part-photo">{part.image_url ? <img src={part.image_url} alt={part.name} loading="lazy" /> : <span className="part-photo-placeholder"><BoltIcon /></span>}{part.availability === "disponible" && part.price && <span className="available-tag">Disponible</span>}</div><div className="part-details"><div><h3>{part.name}</h3><p>{part.description || "Consultá compatibilidad y disponibilidad."}</p></div><div className="part-bottom"><span className="price">{part.price ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(part.price)) : "Consultar precio"}</span><PartPurchase partId={part.id} purchasable={part.availability === "disponible" && Boolean(part.price)} /></div></div></article>)}</div> : <div className="parts-empty" data-reveal><div className="parts-empty-symbol"><BoltIcon /></div><div><h3>Catálogo en preparación</h3><p>Consultanos por una pieza. Precio y existencia se confirman antes de cualquier compra.</p></div><a className="button button-dark" href={whatsappHref} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noreferrer" : undefined}>Consultar un repuesto <span>↗</span></a></div>}
          <a className="button button-dark parts-catalog-link" href="/repuestos" data-reveal>Ver catálogo completo <span aria-hidden="true">↗</span></a>
          <p className="payment-note" data-reveal><span>↗</span> Pagos procesados en el entorno seguro de Mercado Pago. Los medios y las cuotas disponibles se muestran allí para cada operación.</p>
        </div></ScrollReveal>
      </section>
    </div>

    <TransitionDivider kind="shutter" />
    <section className="about-section" id="taller" data-motion-section="taller"><ScrollReveal><div className="about-photo" data-scroll-scene role="img" aria-label={settings.about_image_url ? "Fotografía del taller" : "Espacio reservado para una fotografía real del equipo o del taller"}>{settings.about_image_url ? <img className="about-photo-image" src={settings.about_image_url} alt="" loading="lazy" /> : <><div className="about-photo-lines" /><span>FOTOGRAFÍA REAL DEL TALLER</span><div className="about-photo-stamp">ESPACIO<br />PARA TU<br />FOTOGRAFÍA</div></>}</div><div className="about-copy" data-reveal><p className="eyebrow"><span className="eyebrow-line" />Sobre el taller</p><h2>El taller y su<br /><em>historia.</em></h2><p>{settings.about_text || "Este espacio queda listo para presentar el taller, su equipo y su historia con información real."}</p><a className="text-link" href="#contacto">Conocé cómo podemos ayudarte <span>↗</span></a></div></ScrollReveal></section>

    {testimonials.length > 0 && <><TransitionDivider kind="simplify" /><section className="testimonials-section" data-motion-section="experiencias"><ScrollReveal><div className="section"><div className="section-heading" data-reveal><div><p className="eyebrow"><span className="eyebrow-line" />Experiencias</p><h2>Lo que dicen quienes <em>nos eligen.</em></h2></div></div><div className="testimonial-list">{testimonials.map((item) => <blockquote data-reveal key={item.id}><span className="quote-mark">“</span><p>{item.comment}</p><cite>{item.name}</cite></blockquote>)}</div></div></ScrollReveal></section></>}

    <TransitionDivider kind={testimonials.length ? "settle" : "simplify"} />
    <section className="faq-section" id="preguntas" data-motion-section="preguntas"><ScrollReveal><div className="section faq-layout"><div data-reveal><p className="eyebrow"><span className="eyebrow-line" />Ayuda</p><h2>Preguntas<br /><em>frecuentes.</em></h2><p className="faq-intro">Respuestas a las consultas más habituales.</p></div><div className="faq-list" data-reveal>{faqs.length ? faqs.map((faq) => <details key={faq.id}><summary>{faq.question}<span>+</span></summary><div className="faq-answer"><p>{faq.answer}</p></div></details>) : <div className="faq-empty"><span>Q.</span><div><h3>Preguntas y respuestas</h3><p>Esta sección se completará con información confirmada por el taller.</p></div></div>}</div></div></ScrollReveal></section>

    <TransitionDivider kind="red" />
    <section className="contact-section" id="contacto" data-motion-section="contacto"><ScrollReveal><div className="section contact-layout"><div className="contact-copy" data-reveal><p className="eyebrow"><span className="eyebrow-line" />Contacto</p><h2>Contanos qué<br />necesitás. <em>Estamos.</em></h2><p>Dejanos tu consulta con un medio de contacto y te responderemos.</p><div className="contact-details">
      {settings.whatsapp && <ContactLink href={`https://wa.me/${whatsapp}`} label="Escribir por WhatsApp"><span className="detail-index">01</span><span><small>WHATSAPP</small><b>{settings.whatsapp}</b></span><i>↗</i></ContactLink>}
      {settings.phone && <ContactLink href={`tel:${settings.phone.replace(/\s/g, "")}`} label="Llamar al taller"><span className="detail-index">02</span><span><small>TELÉFONO</small><b>{settings.phone}</b></span><i>↗</i></ContactLink>}
      {settings.email && <ContactLink href={`mailto:${settings.email}`} label="Enviar correo"><span className="detail-index">03</span><span><small>CORREO</small><b>{settings.email}</b></span><i>↗</i></ContactLink>}
      {(settings.address || settings.map_url) && <div className="contact-detail-static"><span className="detail-index">04</span><span><small>{settings.address ? "DIRECCIÓN" : "UBICACIÓN"}</small>{settings.address && <b>{settings.address}</b>}</span>{settings.map_url && <a href={settings.map_url} target="_blank" rel="noreferrer" aria-label="Ver ubicación">↗</a>}</div>}
      {settings.hours && <div className="contact-detail-static"><span className="detail-index">05</span><span><small>HORARIOS</small><b>{settings.hours}</b></span></div>}
      {(settings.instagram_url || settings.facebook_url) && <div className="contact-detail-static"><span className="detail-index">06</span><span><small>REDES</small><b className="social-links">{settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram ↗</a>}{settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook ↗</a>}</b></span></div>}
      {!settings.whatsapp && !settings.phone && !settings.email && !settings.address && !settings.hours && !settings.instagram_url && !settings.facebook_url && <p className="contact-pending">Los medios de contacto y la ubicación se publicarán cuando el taller los confirme.</p>}
    </div></div><div className="form-panel" data-reveal><div className="form-heading"><span>HACÉ TU CONSULTA</span><span>↘</span></div><InquiryForm /></div></div></ScrollReveal></section>

    <TransitionDivider kind="finish" />
    <footer className="site-footer" data-motion-section="pie"><div className="footer-top"><a className="brand footer-brand" href="#inicio" aria-label={`Inicio, ${settings.workshop_name}`}><span className="brand-mark brand-logo"><img src={logoUrl} alt="" /></span></a><span className="footer-note">Reparación, repuestos y una conversación clara.</span><a className="back-top" href="#inicio">Volver al inicio ↑</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {settings.workshop_name}</span><div><a href="#servicios">Servicios</a><a href="/repuestos">Repuestos</a><a href="#contacto">Contacto</a><a href="#preguntas">Preguntas</a></div><div className="footer-contact">{settings.whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}{settings.phone && <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}{settings.address && <span>{settings.address}</span>}{settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}{settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}</div></div></footer>
  </main>;
}
