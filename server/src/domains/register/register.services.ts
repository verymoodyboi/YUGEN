

import supabase from '../../lib/supabase.js';
import supabaseA from '../../lib/anonSupabase.js';
import  logger from '../../lib/logger.js';



import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from '../../lib/r2.js';

export async function generateR2SignedPutUrl({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: 'pfps',
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(r2, command, {
    expiresIn: 60 * 5, 
  });

  return signedUrl;
}





export async function registerUser(body: any) {
  const {

    Email,
    Password,

  } = body;



  const { data, error } = await supabaseA.auth.signUp({
    email: Email,
    password: Password,
      options: {
    emailRedirectTo: `https://try-yugen.com/googleSignUp`,
  },

  });

  if (error) {
    logger.error("Supabase signUp error", { error });
    throw new Error(error.message);
  }

  if (!data.user?.id) {
    throw new Error("User creation failed");
  }



  return {
    success: true,
  };
}


export async function registerGoogleUser(body: any) {
  const {
    FName,
    LName,
    UserName,
    Bio,
    Email,
    BirthDate,
    Gender,
    Region,
    auth_id,
    pfpContentType,
  } = body;

  if (!auth_id) {
    throw new Error("Missing auth_id");
  }

  const joinDate = new Date().toISOString().split("T")[0];
  const pfpKey = `pfps/${Email}-pfp.jpg`;

  const { error } = await supabase.from("users").insert([
    {
      auth_id,
      username: UserName,
      f_name: FName,
      l_name: LName,
      bio: Bio,
      email: Email,
      age: BirthDate,
      gender: Gender,
      region: Region,
      pfp_path: pfpKey,
      join_date: joinDate,
    },
  ]);

  if (error) {
    logger.error("Insert user error", { error });
    throw new Error("Failed to create user");
  }

  const uploadUrl = pfpContentType
    ? await generateR2SignedPutUrl({
        key: pfpKey,
        contentType: pfpContentType,
      })
    : null;

  return {
    success: true,
    uploadUrl,
    pfpKey,
  };
}
