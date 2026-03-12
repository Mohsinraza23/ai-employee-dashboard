import { redirect } from "next/navigation";

// Root → always redirect to dashboard (middleware handles auth gating)
export default function RootPage() {
  redirect("/dashboard/overview");
}
