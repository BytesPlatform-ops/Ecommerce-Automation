import { ContactPage } from "@/components/landing/contact";
import { Navbar } from "@/components/bytescart/navbar";
import { Footer } from "@/components/bytescart/footer";

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
