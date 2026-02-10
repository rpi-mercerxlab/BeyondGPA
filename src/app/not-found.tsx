"use client";


import BeyondButtonLink from "@/components/common/BeyondComponents/BeyondButtonLink";
import Footer from "@/components/common/footer";
import Header from "@/components/common/header/header";

export default function NotFound() {
    return <div className="w-full h-full flex flex-col min-h-screen bg-auto">
        <Header />
        <main className="bg-center m-auto flex flex-col items-center justify-center p-8 space-y-6">
                <h1 className="text-4xl font-bold mb-4 text-center align-middle text-primary">404 - Page Not Found</h1>
                <BeyondButtonLink href="/">Go to Home Page</BeyondButtonLink>
        </main>
        <Footer />
      </div>
}