export type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UserProgressRow = {
  user_id: string;
  total_xp: number;
  current_kingdom_slug: string | null;
  current_mission_slug: string | null;
};

export type AuthIdentity = {
  userId: string;
  email: string | null;
  profile: ProfileRow | null;
  progress: UserProgressRow | null;
};
