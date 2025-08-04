import Footer from "@/components/footer";
import Header from "@/components/header";
import DevLogin from "@/components/login/dev_login";
import ProductionLogin from "@/components/login/prod_login";

const IS_DEVELOPMENT = process.env.NEXTAUTH_ENV !== "production";

export default function LoginPage() {
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
