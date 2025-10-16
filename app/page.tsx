import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  // Redirect to dashboard (middleware will handle auth)
  redirect(ROUTES.DASHBOARD);
}
