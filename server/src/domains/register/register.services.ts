
import supabase from '../../lib/supabase.js';
import  logger from '../../lib/logger.js';

export async function registerUser(
  body: any,
  file?: Express.Multer.File
) {
  const { FName, LName, UserName, Bio, Email, Password, BirthDate, Gender, Region } = body;
  const date = new Date().toISOString().split('T')[0];

  // Create Supabase Auth user
  const { data: dataSupa, error: errorSupa } = await supabase.auth.signUp({
    email: Email,
    password: Password,
    options: {
      data: {
        username: UserName,
        f_name: FName,
        l_name: LName,
        bio: Bio,
        gender: Gender,
        region: Region,
        birthdate: BirthDate,
        is_artist: false,
        is_admin: false,
        pfp_path: `${Email}-pfp.jpg`,
        join_date: date,
      },
    },
  });

  if (errorSupa) {
    logger.error('Supabase signUp error', { errorSupa });
    throw new Error('Sign up failed: ' + errorSupa.message);
  }

  const userId = dataSupa.user?.id;
  if (!userId) throw new Error('User creation failed, no ID returned');

  // Upload profile picture if provided
  if (file) {
    const { error: uploadError } = await supabase.storage
      .from('pfps')
      .upload(`${Email}-pfp.jpg`, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      logger.error('Upload error', { uploadError });
      throw new Error('Failed to upload profile picture');
    }
  } else {
    logger.warn('No PFP file uploaded with registration');
  }

  return { success: true, message: 'Registration successful!' };
}

export async function registerGoogleUser(
  body: any,
  file?: Express.Multer.File
) {
  const { FName, LName, UserName, Bio, Email, BirthDate, Gender, Region, auth_id } = body;
  const date = new Date().toISOString().split('T')[0];

  if (!auth_id) {
    throw new Error('Missing auth_id from Google sign-in');
  }

  // Upload PFP if provided
  if (file) {
    const { error: uploadError } = await supabase.storage
      .from('pfps')
      .upload(`${Email}-pfp.jpg`, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      logger.error('Upload error', { uploadError });
      throw new Error('Failed to upload profile picture');
    }
  } else {
    logger.warn('No PFP file uploaded for Google signup');
  }

  // Insert into users table
  const { error: dbError } = await supabase.from('users').insert([
    {
      auth_id,
      username: UserName,
      f_name: FName,
      l_name: LName,
      age: BirthDate,
      is_artist: false,
      is_admin: false,
      bio: Bio,
      email: Email,
      pfp_path: `${Email}-pfp.jpg`,
      join_date: date,
      gender: Gender,
      region: Region,
    },
  ]);

  if (dbError) {
    logger.error('Error inserting user', { dbError });
    throw new Error('Database error while creating user');
  }

  return { success: true, message: 'Registration successful!' };
}
