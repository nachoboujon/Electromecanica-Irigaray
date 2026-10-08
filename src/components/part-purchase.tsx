"use client";

import { useState } from "react";

export function PartPurchase({ partId, purchasable }: { partId: string; purchasable: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function checkout() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/payments/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [{ partId, quantity: 1 }] }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos iniciar el checkout.");
      window.location.assign(result.checkoutUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos iniciar el checkout."); setLoading(false); }
  }
  return <div className="purchase-action">{purchasable ? <button className="buy-button" onClick={checkout} disabled={loading}>{loading ? "Conectando…" : "Pagar con Mercado Pago"}<span>↗</span></button> : <span className="availability-note">Consultar disponibilidad</span>}{error && <small className="purchase-error" role="alert">{error}</small>}</div>;
}
