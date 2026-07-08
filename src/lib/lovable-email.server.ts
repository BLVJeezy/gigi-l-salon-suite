// Server-only helper: send a transactional email via Resend (through the
// Lovable connector gateway). Templates are still the React Email components
// registered in ./email-templates/registry.
//
// Requires:
//   - LOVABLE_API_KEY (auto)
//   - RESEND_API_KEY  (via Resend connector)
//   - The FROM_EMAIL domain (gigilcoiffure.be) verified in Resend.
const FROM_EMAIL = "Gigi L Coiffure <Info@gigilcoiffure.be>";
const REPLY_TO = "lahlamoussa18@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export type EnqueueResult = { ok: boolean; messageId?: string; error?: string };

/**
 * Render a registered template and send it via Resend.
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const tpl = TEMPLATES[templateName];
    if (!tpl) return { ok: false, error: `Unknown template ${templateName}` };

    const lovableKey = process.env.LOVABLE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!lovableKey || !resendKey) {
      const error = "Missing LOVABLE_API_KEY or RESEND_API_KEY";
      console.error(`[email] ${error}`);
      return { ok: false, error };
    }

    const element = React.createElement(tpl.component, props);
    const html = await render(element);
    const text = await render(element, { plainText: true });
    const subject = typeof tpl.subject === "function" ? tpl.subject(props) : tpl.subject;
    const messageId = crypto.randomUUID();

    // Log pending
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: to,
      status: "pending",
    });

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
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
      console.error(`[email] Resend send failed [${res.status}]: ${body}`);
      await supabaseAdmin
        .from("email_send_log")
        .update({ status: "failed", error_message: body.slice(0, 500) })
        .eq("message_id", messageId);
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }

    const json = (await res.json()) as { id?: string };
    await supabaseAdmin
      .from("email_send_log")
      .update({ status: "sent", metadata: { provider: "resend", provider_id: json.id ?? null } })
      .eq("message_id", messageId);

    return { ok: true, messageId: json.id ?? messageId };
  } catch (e) {
    console.error(`[email] ${templateName} error`, e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
