import supabase from '../../lib/supabase.js';
import type { AddThoughtDTO, ReplyDTO } from './thoughts.types.js';

export async function getThoughts(filmId: string, userId?: string) {
  const { data, error } = await supabase
    .from('thoughtsv1')
    .select(`
      *,
      user:users(username, pfp_path),
      replies:thought_replies(
        *,
        user:users(username, pfp_path),
        reply_votes(vote_type, user_id)
      ),
      thought_votes(vote_type, user_id)
    `)
    .eq('film_uuid', filmId)
    .order('upvotes', { ascending: false });

  if (error) throw error;

  let hiddenThoughtIds = new Set<string>();
  let hiddenReplyIds = new Set<string>();

  if (userId) {
    // Flagged thoughts
    const { data: flaggedThoughts, error: flaggedThoughtsError } = await supabase
      .from('flagged_thoughts')
      .select('thought_id')
      .eq('auth_id', userId);
    if (flaggedThoughtsError) throw flaggedThoughtsError;
    hiddenThoughtIds = new Set(flaggedThoughts?.map((f) => f.thought_id) || []);

    // Flagged replies
    const { data: flaggedReplies, error: flaggedRepliesError } = await supabase
      .from('flagged_replies')
      .select('reply_id')
      .eq('auth_id', userId);
    if (flaggedRepliesError) throw flaggedRepliesError;
    hiddenReplyIds = new Set(flaggedReplies?.map((f) => f.reply_id) || []);
  }

  // Filter out flagged thoughts + replies
  const filteredThoughts = (data || [])
    .filter((t) => !hiddenThoughtIds.has(t.id))
    .map((t) => ({
      ...t,
      replies: t.replies?.filter((r: any) => !hiddenReplyIds.has(r.id)) || [],
    }));

  const upvotes: Record<string, boolean> = {};
  const downvotes: Record<string, boolean> = {};
  const upvoteReplies: Record<string, boolean> = {};
  const downvoteReplies: Record<string, boolean> = {};

  if (userId) {
    for (const thought of filteredThoughts) {
      const voteRecord = thought.thought_votes?.find((v: any) => v.user_id === userId);
      if (voteRecord?.vote_type === 'up') upvotes[thought.id] = true;
      if (voteRecord?.vote_type === 'down') downvotes[thought.id] = true;

      thought.replies?.forEach((reply: any) => {
        const rv = reply.reply_votes?.find((v: any) => v.user_id === userId);
        if (rv?.vote_type === 'up') upvoteReplies[reply.id] = true;
        if (rv?.vote_type === 'down') downvoteReplies[reply.id] = true;
      });
    }
  }

  return { thoughts: filteredThoughts, upvotes, downvotes, upvoteReplies, downvoteReplies };
}


export async function addThought(authId: string, dto: AddThoughtDTO) {
  const { error } = await supabase.from('thoughtsv1').insert([
    {
      film_uuid: dto.film_uuid,
      auth_id: authId,
      rating: dto.rating,
      comment: dto.comment || null,
    },
  ]);
  if (error) throw error;
  return true;
}

export async function deleteThought(authId: string, id: string) {
  const { data: thought, error: fetchError } = await supabase
    .from('thoughtsv1')
    .select('auth_id')
    .eq('id', id)
    .single();

  if (fetchError || !thought) throw new Error('Thought not found');
  if (thought.auth_id !== authId) throw new Error('Not authorized');

  const { error } = await supabase.from('thoughtsv1').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function voteThought(userId: string, thoughtId: string, type: 'up' | 'down') {
  // Handles toggle/switch logic
  const { data: existingVote, error: fetchError } = await supabase
    .from('thought_votes')
    .select('vote_type')
    .eq('thought_id', thoughtId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  if (existingVote?.vote_type === type) {
    await supabase.rpc(type === 'up' ? 'remove_upvotes' : 'remove_downvotes', { row_id: thoughtId });
    await supabase.from('thought_votes').delete().eq('thought_id', thoughtId).eq('user_id', userId);
    return { action: `removed_${type}vote` };
  }

  if (existingVote?.vote_type && existingVote.vote_type !== type) {
    await supabase.rpc(type === 'up' ? 'increment_upvotes' : 'increment_downvotes', { row_id: thoughtId });
    await supabase.rpc(type === 'up' ? 'remove_downvotes' : 'remove_upvotes', { row_id: thoughtId });
    await supabase.from('thought_votes').update({ vote_type: type }).eq('thought_id', thoughtId).eq('user_id', userId);
    return { action: `switched_to_${type}vote` };
  }

  await supabase.rpc(type === 'up' ? 'increment_upvotes' : 'increment_downvotes', { row_id: thoughtId });
  await supabase.from('thought_votes').insert({ thought_id: thoughtId, user_id: userId, vote_type: type });
  return { action: `added_${type}vote` };
}

export async function addReply(userId: string, dto: ReplyDTO) {
  const { error } = await supabase.from('thought_replies').insert([
    {
      comment: dto.comment,
      thought_id: dto.thoughtId,
      auth_id: userId,
    },
  ]);
  if (error) throw error;
  return true;
}

export async function voteReply(userId: string, replyId: string, type: 'up' | 'down') {
  const { data: existingVote, error: fetchError } = await supabase
    .from('reply_votes')
    .select('vote_type')
    .eq('reply_id', replyId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  if (existingVote?.vote_type === type) {
    await supabase.rpc(type === 'up' ? 'remove_upvotes_reply' : 'remove_downvotes_reply', { row_id: replyId });
    await supabase.from('reply_votes').delete().eq('reply_id', replyId).eq('user_id', userId);
    return { action: `removed_${type}vote` };
  }

  if (existingVote?.vote_type && existingVote.vote_type !== type) {
    await supabase.rpc(type === 'up' ? 'increment_upvotes_reply' : 'increment_downvotes_reply', { row_id: replyId });
    await supabase.rpc(type === 'up' ? 'remove_downvotes_reply' : 'remove_upvotes_reply', { row_id: replyId });
    await supabase.from('reply_votes').update({ vote_type: type }).eq('reply_id', replyId).eq('user_id', userId);
    return { action: `switched_to_${type}vote` };
  }

  await supabase.rpc(type === 'up' ? 'increment_upvotes_reply' : 'increment_downvotes_reply', { row_id: replyId });
  await supabase.from('reply_votes').insert({ reply_id: replyId, user_id: userId, vote_type: type });
  return { action: `added_${type}vote` };
}

export async function deleteReply(userId: string, replyId: string) {
  const { error } = await supabase.from('thought_replies').delete().eq('id', replyId).eq('auth_id', userId);
  if (error) throw error;
  return true;
}


/** Flag a thought */
export async function flagThought(userId: string, thoughtId: string, reason: string) {
  // Attempt insert (duplicate flag will throw 23505)
  const { error: insertError } = await supabase
    .from('flagged_thoughts')
    .insert([{ thought_id: thoughtId, auth_id: userId, reason }]);

  if (insertError) throw insertError;

  // Get count of flags for this thought
  const { count: flagCount, error: countError } = await supabase
    .from('flagged_thoughts')
    .select('*', { count: 'exact', head: true })
    .eq('thought_id', thoughtId);

  if (countError) throw countError;

  let deleted = false;
  if ((flagCount ?? 0) > 5) {
    const { error: delError } = await supabase.from('thoughtsv1').delete().eq('id', thoughtId);
    if (delError) throw delError;
    deleted = true;
  }

  return { success: true, count: flagCount ?? 0, deleted };
}

/** Flag a reply */
export async function flagReply(userId: string, replyId: string, reason: string) {
  const { error: insertError } = await supabase
    .from('flagged_replies')
    .insert([{ reply_id: replyId, auth_id: userId, reason }]);

  if (insertError) throw insertError;

  const { count: flagCount, error: countError } = await supabase
    .from('flagged_replies')
    .select('*', { count: 'exact', head: true })
    .eq('reply_id', replyId);

  if (countError) throw countError;

  let deleted = false;
  if ((flagCount ?? 0) > 5) {
    const { error: delError } = await supabase.from('thought_replies').delete().eq('id', replyId);
    if (delError) throw delError;
    deleted = true;
  }

  return { success: true, count: flagCount ?? 0, deleted };
}
