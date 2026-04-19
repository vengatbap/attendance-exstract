"use server";

import { createSession, isValidCredentials } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isValidCredentials(username, password)) {
    redirect("/login?error=1");
  }

  await createSession(username);
  redirect("/dashboard");
}
