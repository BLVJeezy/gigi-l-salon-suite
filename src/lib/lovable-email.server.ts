// Server-only helper: send a transactional email via Resend through the
// Lovable connector gateway. Works when hosted on Lovable (secrets auto-available).
//
// Requires (Lovable secrets — set automatically via Resend connector):
//   - LOVABLE_API_KEY
//   - RESEND_API_KEY
const FROM_EMAIL = "Gigi L Coiffure <Info@gigilcoiffure.be>";
const REPLY_TO = "lahlamoussa18@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export type EnqueueResult = { ok: boolean; messageId?: string; error?: string };

/**
 * Render a registered template and send it via Resend.
 * Uses the Lovable connector gateway when LOVABLE_API_KEY is present,
 * falls back to direct Resend API otherwise.
 */
export async function enqueueTemplateEmail(
  templateName: string,
  to: string,
  props: Record<string, unknown> = {},
): Promise<EnqueueResult> {
  try {
    const React = await import("react");
    const { render } = await import("@react-email/components");
    const { TEMPLATES } = await import("./email-templates/registry");

    const tpl = TEMPLATES[templateName];
    if (!tpl) return { ok: false, error: `Unknown template ${templateName}` };

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      const error = "Missing RESEND_API_KEY";
      console.error(`[email] ${error}`);
      return { ok: false, error };
    }

    const element = React.createElement(tpl.component, props);
    const html = await render(element);
    const text = await render(element, { plainText: true });
    const subject = typeof tpl.subject === "function" ? tpl.subject(props) : tpl.subject;

    // Use Lovable gateway if LOVABLE_API_KEY is available, else direct Resend
    const lovableKey = process.env.LOVABLE_API_KEY;
    const url = lovableKey ? `${GATEWAY_URL}/emails` : "https://api.resend.com/emails";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey ?? resendKey}`,
    };
    if (lovableKey) headers["X-Connection-Api-Key"] = resendKey;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        reply_to: REPLY_TO,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] send failed [${res.status}]: ${body}`);
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("email_send_log").insert({
          template_name: templateName, recipient_email: to,
          status: "failed", error_message: body.slice(0, 500),
        });
      } catch { /* log table may not exist */ }
      return { ok: false, error: `${res.status}: ${body}` };
    }

    const json = (await res.json()) as { id?: string };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("email_send_log").insert({
        template_name: templateName, recipient_email: to,
        status: "sent", metadata: { provider_id: json.id ?? null },
      });
    } catch { /* best-effort */ }

    return { ok: true, messageId: json.id };
  } catch (e) {
    console.error(`[email] ${templateName} error`, e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
