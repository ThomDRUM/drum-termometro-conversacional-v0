import LoginForm from "./login-form";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <LoginForm />
    </main>
  );
}
