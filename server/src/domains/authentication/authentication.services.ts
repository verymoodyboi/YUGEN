import supabase from '../../lib/supabase.js';
import logger from '../../lib/logger.js';

export async function getAuthStatus(authUser: {
  id: string;
  email_confirmed_at: string | null;
}) {
  const { data: userRow, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  if (error) {
    logger.error('Database error checking user row', { error });
    throw new Error('Database error');
  }

  if (!userRow) {
    return { status: 'pendingGoogleSignup' };
  }

  if (!authUser.email_confirmed_at) {
    return { status: 'pendingConfirmation' };
  }
  if (userRow.first_timer === true) {
    return { status: 'firstTimer' };
  }

  return {
    status: 'authenticated',
    user: userRow,
  };
}


export async function getMe(userId: string, email?: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', userId)
    .maybeSingle();

  if (error) {
    logger.error('Error fetching user info', { error });
    throw new Error('Failed to fetch user info');
  }

  return {
    user: { id: userId, email },
    userInfo: data,
  };
}
