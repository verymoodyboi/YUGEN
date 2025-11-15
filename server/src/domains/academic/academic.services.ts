import supabase from '../../lib/supabase.js';
import type { AcademicApplication } from './academic.types.js';
import fs from 'fs';

export async function createApplication(
  username: string,
  email: string,
  role: string,
  university: string,
  uniID: string,
  file?: Express.Multer.File
) {
  let filePath: string | null = null;

  if (file) {
    filePath = `academic_verifications/${username}-${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from('academic_verifications')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);
  }

  const { error: userError } = await supabase
    .from('users')
    .update({ academic_status: 'pending', academic_email: email })
    .eq('username', username);

  if (userError) throw new Error(userError.message);

  const { data, error } = await supabase
    .from('academic_applications')
    .insert([
      {
        username,
        academic_email: email,
        role,
        university,
        verification_file_path: filePath,
        university_id: uniID,
        status: 'pending',
      } as AcademicApplication,
    ])
    .select();

  if (error) throw new Error(error.message);

  return data?.[0];
}

export async function getApplication(username: string) {
  const { data, error } = await supabase
    .from('academic_applications')
    .select('*')
    .eq('username', username)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);

  return data || null;
}

export async function deleteApplication(username: string, auth_id?: string) {
  const { error } = await supabase
    .from('academic_applications')
    .delete()
    .eq('username', username);

  if (error) throw new Error(error.message);

  const { error: userError } = await supabase
    .from('users')
    .update({ academic_status: null, academic_email: null })
    .eq('auth_id', auth_id);

  if (userError) throw new Error(userError.message);

  return true;
}
