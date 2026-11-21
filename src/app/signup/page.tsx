import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SignupWizard from "./SignupWizard";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");
  return <SignupWizard />;
}
