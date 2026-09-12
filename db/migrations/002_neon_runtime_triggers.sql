-- Runtime triggers for FUTURE Neon activity (Phase 2, after historical import).
-- Do NOT apply before importing Supabase historical rows, or you will:
--   - double-award XP on mission_completions import
--   - emit fresh user.created events for migrated users

CREATE OR REPLACE FUNCTION public.handle_new_better_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_display_name text;
  v_avatar_url text;
BEGIN
  v_display_name := coalesce(
    nullif(trim(NEW.name), ''),
    split_part(coalesce(NEW.email, ''), '@', 1),
    'Voyageur'
  );

  v_avatar_url := NEW.image;

  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, v_display_name, v_avatar_url)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_progress (user_id, total_xp)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Fired only on better_auth."user" INSERT (not on login).
  -- Historical migration must run with this trigger disabled.
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

DROP TRIGGER IF EXISTS on_better_auth_user_created ON better_auth."user";
CREATE TRIGGER on_better_auth_user_created
  AFTER INSERT ON better_auth."user"
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_better_auth_user();

CREATE OR REPLACE FUNCTION public.handle_mission_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.user_progress
  SET
    total_xp = total_xp + NEW.xp_awarded,
    current_kingdom_slug = NEW.kingdom_slug,
    current_mission_slug = NEW.mission_slug,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  INSERT INTO public.integration_events (
    event_type,
    user_id,
    payload
  )
  VALUES (
    'mission.completed',
    NEW.user_id,
    jsonb_build_object(
      'user_id', NEW.user_id,
      'kingdom_slug', NEW.kingdom_slug,
      'mission_slug', NEW.mission_slug,
      'xp_awarded', NEW.xp_awarded,
      'completed_at', NEW.completed_at
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_mission_completed ON public.mission_completions;
CREATE TRIGGER on_mission_completed
  AFTER INSERT ON public.mission_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_mission_completed();
