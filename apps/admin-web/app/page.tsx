import { Dashboard } from "@/components/dashboard/dashboard";

// Signed-out visitors are redirected to /login by proxy.ts.
export default function Home() {
  return <Dashboard />;
}
