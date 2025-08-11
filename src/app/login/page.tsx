import Footer from "@/components/common/footer";
import Header from "@/components/header/header";
import DevLogin from "@/components/login/dev_login";
import ProductionLogin from "@/components/login/prod_login";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authentication/auth";

const IS_DEVELOPMENT = process.env.NEXTAUTH_ENV !== "production";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-start justify-start min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center w-full grow shrink basis-auto">
        {IS_DEVELOPMENT ? <DevLogin /> : <ProductionLogin />}
      </main>
      <Footer />
    </div>
  );
}
