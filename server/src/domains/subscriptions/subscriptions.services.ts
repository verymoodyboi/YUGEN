import supabase from '../../lib/supabase.js';

export async function checkSubscription(subscriberId: string, artistId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('artist_id', artistId)
    .eq('subscriber_id', subscriberId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return { isSubscribed: !!data, notify: data?.notify || false };
}

export async function subscribe(subscriberId: string, artistId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .insert([{ subscriber_id: subscriberId, artist_id: artistId }]);

  if (error) throw new Error(error.message);
}

export async function unsubscribe(subscriberId: string, artistId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('artist_id', artistId)
    .eq('subscriber_id', subscriberId);

  if (error) throw new Error(error.message);
}

export async function updateNotify(subscriberId: string, artistId: string, notify: boolean) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ notify })
    .eq('artist_id', artistId)
    .eq('subscriber_id', subscriberId);

  if (error) throw new Error(error.message);
}

export async function mySubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      `
      *,
      sub:users!fk_artist (
        username,
        pfp_path,
        films_count,
        sub_count,
        bio
      )
    `
    )
    .eq('subscriber_id', userId);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabase.rpc('fetch_notifications', {
    current_user_id: userId,
  });

  if (error) throw new Error(error.message);

  return data ?? [];
}