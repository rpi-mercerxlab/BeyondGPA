import Body from "@/components/body";
import Footer from "@/components/footer";
import Header from "@/components/header/header";

export default function Home() {
  return (
    <div className="flex flex-col items-start justify-start min-h-screen">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}
