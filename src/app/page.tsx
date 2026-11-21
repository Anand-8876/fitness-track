import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  if (!(await getCurrentUser())) redirect("/welcome");
  return <AppShell />;
}
