import { createServerFn } from "@tanstack/react-start";

export const AUTH_EMAIL_DOMAIN = "nbrtools.local";

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

export const signUpWithUsername = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = usernameToEmail(data.username);

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { username: data.username.trim() },
    });

    if (error) {
      if (/already.*registered|already.*exists/i.test(error.message)) {
        return { error: "That username is already taken." };
      }
      return { error: error.message };
    }
    return { error: null };
  });
