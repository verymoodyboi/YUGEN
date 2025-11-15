// src/utils/availability-validation/services.ts
import { api } from "../../lib/api";

/**
 * Checks if a username is available by hitting /tools/usernameCheck
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (!username) return false;
  try {
    await api.get("/tools/usernameCheck", { params: { username } });
    return true; // available
  } catch (err: any) {
    if (err.response?.status === 409) return false;
    console.error("Username check error:", err);
    return false;
  }
}

/**
 * Checks if an email is available by hitting /tools/emailCheck
 */
export async function checkEmailAvailable(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    await api.get("/tools/emailCheck", { params: { email } });
    return true; // available
  } catch (err: any) {
    if (err.response?.status === 409) return false;
    console.error("Email check error:", err);
    return false;
  }
}
