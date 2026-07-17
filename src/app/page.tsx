import { redirect } from "next/navigation";

// Root → the load-bearing assessment landing (spec §6).
export default function Home() {
  redirect("/assessment");
}
