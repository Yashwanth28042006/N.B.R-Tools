import { createServerFn } from "@tanstack/react-start";

export const AUTH_EMAIL_DOMAIN = "nbrtools.local";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

export const signUpWithUsername = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const username = data.username.trim();
    if (!USERNAME_PATTERN.test(username)) {
      return {
        error:
          "Username must be 3-32 characters: letters, numbers, underscore, dot or hyphen only.",
      };
    }
    if (data.password.length < MIN_PASSWORD_LENGTH) {
      return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }
    if (data.password.length > MAX_PASSWORD_LENGTH) {
      return { error: "Password is too long." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = usernameToEmail(username);

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (error) {
      if (/already.*registered|already.*exists/i.test(error.message)) {
        return { error: "That username is already taken." };
      }
      return { error: error.message };
    }
    return { error: null };
  });
