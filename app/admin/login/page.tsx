import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import LoginForm from "./login-form";

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/admin");
  return <main className="admin-shell"><section className="admin-panel"><a className="admin-brand" href="/">Mimi <span>SHOPPING</span></a><span className="eyebrow">PRIVATE ADMIN AREA</span><h1>تسجيل دخول الإدارة</h1><p>هذه المساحة مخصصة لفريق Mimi Shopping المصرّح له فقط.</p><LoginForm /></section></main>;
}
