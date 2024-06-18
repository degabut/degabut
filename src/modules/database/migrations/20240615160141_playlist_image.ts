import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("playlist", (table) => {
    table.json("images");
  });

  // get latest playlist media source images / thumbnails
  const result = await knex.raw(`
    select
        distinct on (playlist_id) playlist_id,
        media_source_id,
        images,
        thumbnails
    from
        playlist_media_source pms
    join media_source ms on
        ms.id = pms.media_source_id
    left join youtube_video yv on 
        yv.id = ms.youtube_video_id
    left join spotify_track st on
        st.id = ms.spotify_track_id
    left join spotify_album sa on
        st.album_id = sa.id
    order by
        playlist_id,
        pms.created_at desc
    `);

  const playlists = result.rows;

  // update images on playlist
  for (const playlist of playlists) {
    const images = playlist.images || playlist.thumbnails;
    if (!images?.length) continue;
    await knex("playlist")
      .where("id", playlist.playlist_id)
      .update({ images: JSON.stringify(images) });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("playlist", (table) => {
    table.dropColumn("images");
  });
}
