-- Phase 6B: n8n delivery state for public.integration_events
-- Canonical event rows stay owned by DB triggers (user.created / mission.completed).
-- Historical rows are marked skipped so deploy does NOT replay to n8n.

ALTER TABLE public.integration_events
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'integration_events_delivery_status_check'
  ) THEN
    ALTER TABLE public.integration_events
      ADD CONSTRAINT integration_events_delivery_status_check
      CHECK (
        delivery_status = ANY (
          ARRAY[
            'pending'::text,
            'delivered'::text,
            'failed'::text,
            'skipped'::text
          ]
        )
      );
  END IF;
END $$;

-- Do not replay Phase 1–5 / pre-n8n history.
UPDATE public.integration_events
SET delivery_status = 'skipped'
WHERE delivery_status = 'pending';

CREATE INDEX IF NOT EXISTS integration_events_delivery_pending_idx
  ON public.integration_events (delivery_status, event_type)
  WHERE delivery_status = 'pending';

COMMENT ON COLUMN public.integration_events.delivery_status IS
  'n8n webhook delivery: pending|delivered|failed|skipped';
