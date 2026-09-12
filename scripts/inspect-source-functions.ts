import { createSupabaseSourcePool } from "./lib/pg-migration";

async function main() {
  const pool = createSupabaseSourcePool(
    process.env.SUPABASE_SOURCE_DATABASE_URL!
  );

  const fns = await pool.query(
    `SELECT p.proname, pg_get_functiondef(p.oid) AS def
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = ANY($1::text[])`,
    [
      [
        "handle_mission_completed",
        "handle_new_user",
        "set_updated_at",
        "is_username_available",
      ],
    ]
  );

  for (const row of fns.rows) {
    console.log(`\n===== ${row.proname} =====\n`);
    console.log(row.def);
  }

  const idCols = await pool.query(
    `SELECT a.attname, a.attidentity,
            pg_get_expr(ad.adbin, ad.adrelid) AS def
     FROM pg_attribute a
     LEFT JOIN pg_attrdef ad
       ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
     WHERE a.attrelid = 'public.mission_completions'::regclass
       AND a.attnum > 0 AND NOT a.attisdropped`
  );
  console.log("\n===== mission_completions cols =====");
  console.log(JSON.stringify(idCols.rows, null, 2));

  const ieCols = await pool.query(
    `SELECT a.attname, a.attidentity,
            pg_get_expr(ad.adbin, ad.adrelid) AS def
     FROM pg_attribute a
     LEFT JOIN pg_attrdef ad
       ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
     WHERE a.attrelid = 'public.integration_events'::regclass
       AND a.attnum > 0 AND NOT a.attisdropped`
  );
  console.log("\n===== integration_events cols =====");
  console.log(JSON.stringify(ieCols.rows, null, 2));

  const authTrig = await pool.query(
    `SELECT event_object_schema, event_object_table, trigger_name, action_statement
     FROM information_schema.triggers
     WHERE action_statement ILIKE '%handle_new_user%'`
  );
  console.log("\n===== handle_new_user triggers =====");
  console.log(JSON.stringify(authTrig.rows, null, 2));

  const sampleId = await pool.query(
    `SELECT provider,
            length(provider_id) AS provider_id_len,
            length(identity_data->>'sub') AS sub_len,
            (provider_id = identity_data->>'sub') AS provider_id_eq_sub,
            (provider_id = identity_data->>'provider_id') AS provider_id_eq_data_provider_id
     FROM auth.identities`
  );
  console.log("\n===== identity id mapping =====");
  console.log(JSON.stringify(sampleId.rows, null, 2));

  const meta = await pool.query(
    `SELECT
       (raw_user_meta_data ? 'full_name') AS has_full_name,
       (raw_user_meta_data ? 'name') AS has_name,
       (raw_user_meta_data ? 'avatar_url') AS has_avatar_url,
       (raw_user_meta_data ? 'picture') AS has_picture,
       email_confirmed_at IS NOT NULL AS email_confirmed
     FROM auth.users`
  );
  console.log("\n===== user metadata keys present =====");
  console.log(JSON.stringify(meta.rows, null, 2));

  await pool.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
