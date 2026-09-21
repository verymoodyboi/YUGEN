import supabase from '../../lib/supabase.js';

/**
 * Send a poke
 */
export async function sendPoke(pokerId: string, targetId: string) {
  if (pokerId === targetId) {
    throw new Error('Cannot poke yourself');
  }

  // Optional: prevent duplicate unaccepted poke
  const { data: existing, error: checkError } = await supabase
    .from('pokes')
    .select('id')
    .eq('poker_id', pokerId)
    .eq('poked_id', targetId)
    .eq('accepted', false)
    .maybeSingle();

  if (checkError) throw new Error(checkError.message);

  if (existing) {
    throw new Error('You already poked this user');
  }

  const { error } = await supabase
    .from('pokes')
    .insert([
      {
        poker_id: pokerId,
        poked_id: targetId,
      },
    ]);

  if (error) throw new Error(error.message);
}

/**
 * Accept a poke
 */
export async function acceptPoke(userId: string, pokeId: string) {
  const { data: poke, error: fetchError } = await supabase
    .from('pokes')
    .select('*')
    .eq('id', pokeId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!poke) throw new Error('Poke not found');

  if (poke.poked_id !== userId) {
    throw new Error('Not authorized to accept this poke');
  }

  const { error } = await supabase
    .from('pokes')
    .update({
      accepted: true,
      seen: true,
    })
    .eq('id', pokeId);

  if (error) throw new Error(error.message);
}


export async function getUserPokes(userId: string) {
  const { data: sent, error: sentError } = await supabase
    .from('pokes')
    .select(`
      *,
      receiver:users!fk_poked (
        username,
        pfp_path,
        region,
        university
      ),
      sender:users!fk_poker (
        username,
        pfp_path,
        region,
        university
      )
    `)
    .eq('poker_id', userId)
    .order('created_at', { ascending: false });

  if (sentError) throw new Error(sentError.message);

  const { data: received, error: receivedError } = await supabase
    .from('pokes')
    .select(`
      *,
      sender:users!fk_poker (
        username,
        pfp_path,
        region,
        university
      ),
      receiver:users!fk_poked (
        username,
        pfp_path,
        region,
        university
      )
    `)
    .eq('poked_id', userId)
    .neq('is_rejected', true)
    .order('created_at', { ascending: false });

  if (receivedError) throw new Error(receivedError.message);

  if (sent && sent.length > 0) {
    const { error } = await supabase
      .from('pokes')
      .update({ seen: true })
      .eq('poker_id', userId);

    if (error) throw new Error(error.message);
  }

  if (received && received.length > 0) {
    const { error } = await supabase
      .from('pokes')
      .update({ seen: true })
      .eq('poked_id', userId)
      .neq('is_rejected', true);

    if (error) throw new Error(error.message);
  }

  return {
    sent: sent || [],       
    received: received || []
  };
}



export async function deletePoke(userId: string, pokeId: string) {
  const { data: poke, error: fetchError } = await supabase
    .from("pokes")
    .select("*")
    .eq("id", pokeId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!poke) throw new Error("Poke not found");

  // Only sender OR receiver can delete
  if (poke.poker_id !== userId && poke.poked_id !== userId) {
    throw new Error("Not authorized to delete this poke");
  }

  const { error } = await supabase
    .from("pokes")
    .delete()
    .eq("id", pokeId);

  if (error) throw new Error(error.message);
}

export async function getPokeStatus(
  currentUserId: string,
  profileUserId: string
) {
  if (currentUserId === profileUserId) {
    return { status: "self" };
  }

  const { data, error } = await supabase
    .from("pokes")
    .select("*")
    .or(
      `and(poker_id.eq.${currentUserId},poked_id.eq.${profileUserId}),
       and(poker_id.eq.${profileUserId},poked_id.eq.${currentUserId})`
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    return { status: "none" };
  }

  if (data.accepted) {
    return {
      status: "accepted",
      pokeId: data.id,
    };
  }

  if (data.poker_id === currentUserId) {
    return {
      status: "sent",
      pokeId: data.id,
    };
  }

  return {
    status: "received",
    pokeId: data.id,
  };
}


/**
 * Reject a poke (receiver only)
 */
export async function rejectPoke(userId: string, pokeId: string) {
  const { data: poke, error: fetchError } = await supabase
    .from("pokes")
    .select("*")
    .eq("id", pokeId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!poke) throw new Error("Poke not found");

  // Only receiver can reject
  if (poke.poked_id !== userId) {
    throw new Error("Not authorized to reject this poke");
  }

  const { error } = await supabase
    .from("pokes")
    .update({is_rejected:true})
    .eq("id", pokeId);

  if (error) throw new Error(error.message);
}