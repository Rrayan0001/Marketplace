import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Margros — Hyperlocal Restaurant Workforce & Vendor Marketplace",
  description:
    "Connect with verified restaurants, skilled workers, and trusted vendors in your local zone. Margros is the admin-governed hyperlocal marketplace for the food industry.",
  keywords: "restaurant hiring, food industry jobs, vendor marketplace, hyperlocal, workforce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
