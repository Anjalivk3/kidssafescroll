import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import Navbar from "../components/Navbar";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}