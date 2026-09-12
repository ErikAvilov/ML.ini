-- Auto-assign unique username on Better Auth user creation.
-- Format: <FirstNameToken>_<8 hex from user uuid> (fits 3–20 [A-Za-z0-9_]).
-- Also backfills existing NULL usernames.

CREATE OR REPLACE FUNCTION public.handle_new_better_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_display_name text;
  v_avatar_url text;
  v_prefix text;
  v_suffix text;
  v_username text;
BEGIN
  v_display_name := coalesce(
    nullif(trim(NEW.name), ''),
    split_part(coalesce(NEW.email, ''), '@', 1),
    'Voyageur'
  );

  v_avatar_url := NEW.image;

  v_prefix := split_part(v_display_name, ' ', 1);
  v_prefix := regexp_replace(v_prefix, '[^A-Za-z0-9_]', '', 'g');
  IF v_prefix IS NULL OR v_prefix = '' THEN
    v_prefix := 'Player';
  END IF;
  IF length(v_prefix) > 11 THEN
    v_prefix := substr(v_prefix, 1, 11);
  END IF;

  v_suffix := substr(replace(NEW.id::text, '-', ''), 1, 8);
  v_username := v_prefix || '_' || v_suffix;

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (NEW.id, v_username, v_display_name, v_avatar_url)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_progress (user_id, total_xp)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.integration_events (event_type, user_id, payload)
  VALUES (
    'user.created',
    NEW.id,
    jsonb_build_object(
      'user_id', NEW.id,
      'display_name', v_display_name,
      'email', NEW.email,
      'created_at', now()
    )
  );

  RETURN NEW;
END;
$$;

-- Backfill profiles that still have NULL username (existing OAuth users).
UPDATE public.profiles p
SET
  username = left(
    regexp_replace(
      split_part(coalesce(nullif(trim(p.display_name), ''), 'Player'), ' ', 1),
      '[^A-Za-z0-9_]',
      '',
      'g'
    ),
    11
  )
  || '_'
  || substr(replace(p.id::text, '-', ''), 1, 8),
  updated_at = now()
WHERE p.username IS NULL
  AND length(
    left(
      nullif(
        regexp_replace(
          split_part(coalesce(nullif(trim(p.display_name), ''), 'Player'), ' ', 1),
          '[^A-Za-z0-9_]',
          '',
          'g'
        ),
        ''
      ),
      11
    )
    || '_'
    || substr(replace(p.id::text, '-', ''), 1, 8)
  ) BETWEEN 3 AND 20;

-- Fallback if display_name sanitizes to empty → Player_<hex>
UPDATE public.profiles p
SET
  username = 'Player_' || substr(replace(p.id::text, '-', ''), 1, 8),
  updated_at = now()
WHERE p.username IS NULL;
