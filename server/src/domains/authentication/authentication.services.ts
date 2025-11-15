import supabase from '../../lib/supabase.js';
import logger from '../../lib/logger.js';

export async function getAuthStatus(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Database error checking user row', { error });
    throw new Error('Database error');
  }

  if (!data) {
    return { status: 'signupGoogle' };
  }

  return { status: 'authenticated', user: data };
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
