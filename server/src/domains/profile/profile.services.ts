import supabase from '../../lib/supabase.js';
import type { UpdateSocialsDTO, EditProfileDTO } from './profile.types.js';
import { preRegisterSocialsSchema } from './profile.validations.js';

export async function updateSocials(authId: string, socials: UpdateSocialsDTO) {
  const { error } = await supabase
    .from('users')
    .update({
      youtube: socials.YT,
      instagram: socials.Insta,
      linkedin: socials.LI,
    })
    .eq('auth_id', authId);

  if (error) throw new Error(error.message);

  return true;
}

export async function editProfile(authId: string, dto: EditProfileDTO, file?: Express.Multer.File) {
  // Handle new PFP upload only if a file was provided
  if (file) {
    // remove old picture
    await supabase.storage.from('pfps').remove([`${authId}.jpg`]);

    const { error: uploadError } = await supabase.storage
      .from('pfps')
      .upload(`${authId}.jpg`, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);
  }

  // Update text fields (and only include pfp_path if new file uploaded)
  const { error: updateError } = await supabase
    .from('users')
    .update({
      username: dto.UserName,
      f_name: dto.FName,
      l_name: dto.LName,
      bio: dto.Bio,
      gender: dto.Gender,
      region: dto.Region,
      ...(file ? { pfp_path: `${authId}.jpg` } : {}), 
    })
    .eq('auth_id', authId);

  if (updateError) throw new Error(updateError.message);

  return true;
}


export async function preRegisterSocials(body: { Username: string; Insta?: string; YT?: string; LI?: string }) {
  const { Username, Insta, YT, LI } = body;

  const { data, error } = await supabase
    .from('users')
    .update({
      youtube: YT || null,
      instagram: Insta || null,
      linkedin: LI || null,
    })
    .eq('username', Username)
    .select();

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error(`No user found with username ${Username}`);

  return { message: 'Pre-register socials saved successfully!' };
}



export async function addUserType(userType:string,authId:string) {
  const { error } = await supabase
    .from('users')
    .update({
   user_type:userType
    })
    .eq('auth_id', authId);

  if (error) throw new Error(error.message);

  return true;
}
