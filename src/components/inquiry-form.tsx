"use client";

import { FormEvent, useState } from "react";

export function InquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending"); setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos enviar la consulta.");
      form.reset(); setState("sent");
    } catch (cause) { setState("error"); setError(cause instanceof Error ? cause.message : "No pudimos enviar la consulta."); }
  }
  return <form className="inquiry-form" onSubmit={submit}>
    <label>Tu nombre<input name="name" type="text" placeholder="¿Cómo te llamás?" autoComplete="name" minLength={2} maxLength={120} required /></label>
    <div className="form-row"><label>Teléfono<input name="phone" type="tel" placeholder="Código de área + número" autoComplete="tel" maxLength={40} /></label><label>Correo<input name="email" type="email" placeholder="tu@correo.com" autoComplete="email" maxLength={254} /></label></div>
    <label>¿Sobre qué querés consultar?<select name="reason" defaultValue="" required><option value="" disabled>Elegí un motivo</option><option value="servicio">Servicio o reparación</option><option value="repuesto">Repuesto</option><option value="presupuesto">Presupuesto</option><option value="otro">Otra consulta</option></select></label>
    <label>Tu mensaje<textarea name="message" placeholder="Contanos brevemente qué necesitás…" rows={3} minLength={10} maxLength={4000} required /></label>
    <p className="form-hint">Completá al menos un teléfono o correo para que podamos responderte.</p>
    <button className="button button-red form-submit" type="submit" disabled={state === "sending"}>{state === "sending" ? "Enviando…" : "Enviar consulta"}<span>↗</span></button>
    {state === "sent" && <p className="form-feedback success" role="status">Recibimos tu consulta. Gracias por escribirnos.</p>}
    {state === "error" && <p className="form-feedback" role="alert">{error}</p>}
  </form>;
}
