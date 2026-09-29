import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VendorDirectory } from "@/components/vendors/vendor-directory";

export const metadata = {
  title: "Vendors Marketplace | CampusHub",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function VendorsPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <VendorDirectory userId={user.id} searchParams={await searchParams} />;
}
