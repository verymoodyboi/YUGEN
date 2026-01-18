import supabase from '../../lib/supabase.js';
import type { UpdateSocialsDTO, EditProfileDTO } from './profile.types.js';
import { preRegisterSocialsSchema } from './profile.validations.js';
import { r2 } from '../../lib/r2.js';
import { PutObjectCommand,DeleteObjectCommand  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateR2SignedPutUrl } from '../register/register.services.js';

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

export async function editProfile(
  authId: string,
  body: {
    FName: string;
    LName: string;
    UserName: string;
    Bio: string;
    Gender: string;
    Region: string;
    pfpContentType?: string;
  }
) {
  let uploadUrl: string | null = null;
  let pfpPath: string | null = null;

  if (body.pfpContentType) {
    pfpPath = `pfps/${authId}.jpg`;

    uploadUrl = await generateR2SignedPutUrl({
      key: pfpPath,
      contentType: body.pfpContentType,
    });
  }

  const { error } = await supabase
    .from("users")
    .update({
      username: body.UserName,
      f_name: body.FName,
      l_name: body.LName,
      bio: body.Bio,
      gender: body.Gender,
      region: body.Region,
      ...(pfpPath ? { pfp_path: pfpPath } : {}),
    })
    .eq("auth_id", authId);

  if (error) throw new Error(error.message);

  return {
    success: true,
    uploadUrl,
  };
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
