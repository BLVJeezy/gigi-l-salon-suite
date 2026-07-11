// Server-only email helper.
// RESEND_API_KEY is a connector-managed key — must go through the Lovable gateway.
// Direct calls to api.resend.com return 401 because the key is only valid via the gateway.
const FROM_EMAIL = "Gigi L Coiffure <Info@gigilcoiffure.be>";
const REPLY_TO = "lahlamoussa18@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend/emails";

export type EnqueueResult = { ok: boolean; messageId?: string; error?: string };

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
    if (!tpl) return { ok: false, error: `Unknown template: ${templateName}` };

    const lovableKey = process.env.LOVABLE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!lovableKey || !resendKey) {
      const missing = [!lovableKey && "LOVABLE_API_KEY", !resendKey && "RESEND_API_KEY"].filter(Boolean).join(", ");
      console.error(`[email] Missing: ${missing}`);
      return { ok: false, error: `Missing env: ${missing}` };
    }

    const element = React.createElement(tpl.component, props);
    const html = await render(element);
    const text = await render(element, { plainText: true });
    const subject = typeof tpl.subject === "function" ? tpl.subject(props) : tpl.subject;

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], reply_to: REPLY_TO, subject, html, text }),
    });

    const json = await res.json() as { id?: string; message?: string; name?: string };

    if (!res.ok) {
      console.error(`[email] Gateway ${res.status}:`, json);
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("email_send_log").insert({
          template_name: templateName, recipient_email: to,
          status: "failed", error_message: JSON.stringify(json).slice(0, 500),
        });
      } catch { /* best-effort */ }
      return { ok: false, error: json.message ?? `HTTP ${res.status}` };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("email_send_log").insert({
        template_name: templateName, recipient_email: to,
        status: "sent", metadata: { provider_id: json.id ?? null },
      });
    } catch { /* best-effort */ }

    return { ok: true, messageId: json.id };
  } catch (e) {
    console.error(`[email] ${templateName} threw:`, e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
