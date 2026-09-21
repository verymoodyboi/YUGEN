import supabase from '../../lib/supabase.js';
import type { UpdateSocialsDTO, EditProfileDTO } from './profile.types.js';
import { generateR2SignedPutUrl } from '../register/register.services.js';
import logger from '../../lib/logger.js';

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
    contactEmail:string;
    contactNumber:string;
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
  //  if (body.pfpContentType) {
  //   const { error: jobError } = await supabase
  //     .from("jobs_pfp_compression")
  //     .insert({
  //       type: "pfp_compression",
  //       payload: { auth_id:authId },
  //     });
 
  //   if (jobError) {
  //     logger.error("Failed to enqueue pfp compression job", { authId, error: jobError });
  //   } else {
  //     logger.info("Enqueued pfp compression job", { authId });
  //   }
  // }

  const { error } = await supabase
    .from("users")
    .update({
      username: body.UserName,
      f_name: body.FName,
      l_name: body.LName,
      bio: body.Bio,
      gender: body.Gender,
      region: body.Region,
      contact_email:body.contactEmail,
      contact_number:body.contactNumber,
      ...(pfpPath ? { pfp_path: pfpPath } : {}),
    })
    .eq("auth_id", authId);

  if (error) throw new Error(error.message);

  return {
    success: true,
    uploadUrl,
  };
}
export async function compressPfp(authId:string)
{
  
    const { error: jobError } = await supabase
      .from("jobs_pfp_compression")
      .insert({
        type: "pfp_compression",
        payload: { auth_id:authId },
      });
 
    if (jobError) {
      logger.error("Failed to enqueue pfp compression job", { authId, error: jobError });
    } else {
      logger.info("Enqueued pfp compression job", { authId });
    }
  
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



export async function addSchool(authId: string, school: string) {
  const { error } = await supabase
    .from("users")
    .update({ university:school })
    .eq("auth_id", authId);

  if (error) throw new Error(error.message);

  return true;
}



export async function getContactInfo(authId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("contact_email, contact_number")
    .eq("auth_id", authId)
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateContactInfo(
  authId: string,
  body: {
    contactEmail?: string;
    contactNumber?: string;
  }
) {
  const updateData: any = {};

  if (body.contactEmail !== undefined) {
    updateData.contact_email = body.contactEmail;
  }

  if (body.contactNumber !== undefined) {
    updateData.contact_number = body.contactNumber;
  }

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("auth_id", authId);

  if (error) throw new Error(error.message);

  return true;
}