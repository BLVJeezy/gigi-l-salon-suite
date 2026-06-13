// Server-only helper: send a transactional email via Lovable's queue (pgmq).
// No RESEND_API_KEY needed — Lovable's dispatcher (/lovable/email/queue/process)
// delivers using the verified sender domain below.
//
// To change the sender, edit SENDER_DOMAIN / FROM_DOMAIN here (one place).
// SENDER_DOMAIN must be the subdomain delegated to Lovable's nameservers.
const SENDER_DOMAIN = "notify.test-solyn.pw";
const FROM_DOMAIN = "notify.test-solyn.pw";
const SITE_NAME = "gigi-l";

export type EnqueueResult = { ok: boolean; messageId?: string; error?: string };

/**
 * Render a registered template and enqueue it for Lovable to send.
 * @param templateName key in email-templates/registry
 * @param to recipient email
 * @param props template data
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

    const element = React.createElement(tpl.component, props);
    const html = await render(element);
    const text = await render(element, { plainText: true });
    const subject = typeof tpl.subject === "function" ? tpl.subject(props) : tpl.subject;
    const messageId = crypto.randomUUID();

    // Record a pending log row (so a failed enqueue is still traceable).
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: to,
      status: "pending",
    });

    const { error } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: "transactional",
        label: templateName,
        idempotency_key: messageId,
        unsubscribe_token: "transactional",
        queued_at: new Date().toISOString(),
      },
    });

    if (error) {
      console.error(`[lovable-email] enqueue ${templateName} failed`, error);
      return { ok: false, error: error.message };
    }
    return { ok: true, messageId };
  } catch (e) {
    console.error(`[lovable-email] ${templateName} error`, e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
