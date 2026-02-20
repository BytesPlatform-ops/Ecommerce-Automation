import { ContactPage } from "@/components/landing/contact";
import { Navbar, Footer } from "@/components/landing";

export const metadata = {
  title: "Contact Us - Bytescart",
  description: "Get in touch with our team for support, questions, or partnership opportunities.",
};

export default function Contact() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ContactPage />
      <Footer />
    </main>
  );
}
