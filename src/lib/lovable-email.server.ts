// Server-only helper: send a transactional email via Resend directly.
// Works from both Lovable and Vercel hosting.
//
// Requires:
//   - RESEND_API_KEY (Lovable secret or Vercel env var)
//   - FROM_EMAIL domain (gigilcoiffure.be) verified in Resend.
const FROM_EMAIL = "Gigi L Coiffure <Info@gigilcoiffure.be>";
const REPLY_TO = "lahlamoussa18@gmail.com";
const RESEND_API_URL = "https://api.resend.com/emails";

export type EnqueueResult = { ok: boolean; messageId?: string; error?: string };

/**
 * Render a registered template and send it via Resend directly.
 * Name kept as `enqueueTemplateEmail` for call-site compatibility.
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

    // Try Resend API key from env (Vercel) or Lovable secrets
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

    // Call Resend API directly — works from any hosting environment
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
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
      console.error(`[email] Resend API failed [${res.status}]: ${body}`);
      // Try to log to Supabase (best-effort)
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("email_send_log").insert({
          template_name: templateName,
          recipient_email: to,
          status: "failed",
          error_message: body.slice(0, 500),
        });
      } catch { /* log table may not exist */ }
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }

    const json = (await res.json()) as { id?: string };
    // Log success (best-effort)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("email_send_log").insert({
        template_name: templateName,
        recipient_email: to,
        status: "sent",
        metadata: { provider_id: json.id ?? null },
      });
    } catch { /* log table may not exist */ }

    return { ok: true, messageId: json.id };
  } catch (e) {
    console.error(`[email] ${templateName} error`, e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
