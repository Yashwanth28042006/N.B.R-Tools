import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { signUpWithUsername, usernameToEmail } from "@/lib/auth.functions";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user.user_metadata as { username?: string } | undefined;
      setDisplayName(meta?.username ?? data.session?.user.email?.split("@")[0]);
    });
  }, []);

  async function submit(mode: "sign-in" | "sign-up") {
    setLoading(true);
    try {
      const email = usernameToEmail(username);

      if (mode === "sign-up") {
        const result = await signUpWithUsername({ data: { username, password } });
        if (result.error) return toast.error(result.error);
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return toast.error(mode === "sign-up" ? error.message : "Incorrect username or password.");
      }

      toast.success(
        mode === "sign-up" ? "Account created and signed in." : "Signed in successfully.",
      );
      const meta = data.user.user_metadata as { username?: string } | undefined;
      setDisplayName(meta?.username ?? username);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setDisplayName(undefined);
    toast.success("Signed out.");
  }

  return (
    <>
      <Header />
      <main className="container-page min-h-[70vh] py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <p className="text-xs font-medium uppercase tracking-widest text-amber">
            N.B.R Tools account
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {displayName ? "Your account" : "Sign in or create an account"}
          </h1>
          {displayName ? (
            <div className="mt-6 space-y-4">
              <p className="text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{displayName}</span>.
                Your cart is saved separately to this account.
              </p>
              <Button asChild className="w-full bg-amber text-amber-foreground hover:bg-amber/90">
                <Link to="/cart">View saved cart</Link>
              </Button>
              <Button variant="outline" onClick={signOut} className="w-full">
                Sign out
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                autoComplete="username"
                required
              />
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password (minimum 8 characters)"
                type="password"
                autoComplete="current-password"
                required
              />
              <Button
                disabled={loading || !username || password.length < 8}
                onClick={() => submit("sign-in")}
                className="w-full bg-amber text-amber-foreground hover:bg-amber/90"
              >
                Sign in
              </Button>
              <Button
                disabled={
                  loading || !/^[a-zA-Z0-9_.-]{3,32}$/.test(username) || password.length < 8
                }
                onClick={() => submit("sign-up")}
                variant="outline"
                className="w-full"
              >
                Create account
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
