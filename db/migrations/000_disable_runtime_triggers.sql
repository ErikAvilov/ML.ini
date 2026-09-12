-- Optional: drop Phase 2 runtime triggers (safe re-import of historical rows).
DROP TRIGGER IF EXISTS on_better_auth_user_created ON better_auth."user";
DROP TRIGGER IF EXISTS on_mission_completed ON public.mission_completions;
