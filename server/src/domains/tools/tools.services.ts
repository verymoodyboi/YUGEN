import supabase from "../../lib/supabase.js";

export async function checkEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("email", email);

  if (error) throw new Error(error.message);

  if (data && data.length > 0) {
    return { available: false };
  }

  return { available: true };
}

export async function checkUsername(username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("username", username);

  if (error) throw new Error(error.message);

  if (data && data.length > 0) {
    return { available: false, username: data[0].username.trim() };
  }

  return { available: true };
}
export async function getUserInfo(userID: string) {
  const { data, error } = await supabase
    .from("users")
    .select("username, pfp_path")
    .eq("auth_id", userID)
    .single();

  if (error) return null;

  return {
    username: data.username,
    pfp_path: data.pfp_path,
  };
}

export async function checkFirstTimer(authId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("first_timer")
    .eq("auth_id", authId)
    .single();

  if (error) throw new Error(error.message);

  return { first_timer: data.first_timer === true };
}

export async function completeFirstLogin(authId: string) {
  const { error } = await supabase
    .from("users")
    .update({ first_timer: false })
    .eq("auth_id", authId);

  if (error) {
    console.error("Error updating first_timer:", error.message);
    throw new Error(error.message);
  }

  return { success: true, message: "First login completed" };
}