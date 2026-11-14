"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      router.replace("/admin"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تسجيل الدخول. حاول مجدداً."); }
    finally { setBusy(false); }
  }
  return <form className="admin-form" onSubmit={submit}>
    <label htmlFor="admin-email">البريد الإلكتروني</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} />
    <label htmlFor="admin-password">كلمة المرور</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} />
    {error ? <p className="admin-error" role="alert">{error}</p> : null}
    <button disabled={busy}>{busy ? "جارٍ التحقق..." : "دخول آمن"}</button>
  </form>;
}
