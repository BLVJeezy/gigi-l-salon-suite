-- Completes the email pipeline: stores the service-role key in vault and schedules
-- a pg_cron job that drains the email queues by calling the app's queue processor.
--
-- WHY: the earlier email_infra migration set up the queues, tables and RPCs, but the
-- cron job that actually triggers sending was only described in comments, never created.
-- Without this, enqueued emails sit in the queue forever and nothing is delivered.
--
-- IMPORTANT: this migration reads the service-role key from Vault under the name
-- 'email_queue_service_role_key'. You MUST store it once (see the SQL block we run
-- separately in the Supabase SQL editor) before the cron job can authenticate.

-- The deployed app endpoint that drains the queue.
-- If the production domain changes, update the URL in the cron.schedule below.

DO $$
DECLARE
  v_key text;
  v_url text := 'https://gigi-l-salon-suite.lovable.app/lovable/email/queue/process';
BEGIN
  -- Only schedule if pg_cron is available.
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron not installed — skipping email cron schedule';
    RETURN;
  END IF;

  -- Remove any previous version of the job so this migration is idempotent.
  BEGIN
    PERFORM cron.unschedule('process-email-queue');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Schedule: every 10 seconds, if either queue has messages and we're not in a
  -- rate-limit cooldown, POST to the processor with the vault-stored service key.
  PERFORM cron.schedule(
    'process-email-queue',
    '10 seconds',
    $cron$
    DO $inner$
    DECLARE
      svc_key text;
      has_msgs boolean;
      cooling boolean;
    BEGIN
      SELECT decrypted_secret INTO svc_key
        FROM vault.decrypted_secrets
        WHERE name = 'email_queue_service_role_key'
        LIMIT 1;
      IF svc_key IS NULL THEN
        RAISE NOTICE 'email_queue_service_role_key not in vault — skipping';
        RETURN;
      END IF;

      -- Skip while in rate-limit cooldown.
      SELECT COALESCE(retry_after_until > now(), false) INTO cooling
        FROM public.email_send_state WHERE id = 1;
      IF cooling THEN RETURN; END IF;

      -- Only fire if there is something to send. pgmq.metrics is the stable API
      -- for queue depth (internal table names vary by pgmq version).
      SELECT (
        COALESCE((SELECT queue_length FROM pgmq.metrics('transactional_emails')), 0) +
        COALESCE((SELECT queue_length FROM pgmq.metrics('auth_emails')), 0)
      ) > 0 INTO has_msgs;
      IF NOT has_msgs THEN RETURN; END IF;

      PERFORM net.http_post(
        url := 'https://gigi-l-salon-suite.lovable.app/lovable/email/queue/process',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || svc_key
        ),
        body := '{}'::jsonb
      );
    END
    $inner$;
    $cron$
  );

  RAISE NOTICE 'Scheduled process-email-queue cron job';
END $$;
