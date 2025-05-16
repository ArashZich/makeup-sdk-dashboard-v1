import localFont from "next/font/local";
import { Montserrat } from "next/font/google";

// فونت ایران‌سنس برای زبان فارسی
export const iranSans = localFont({
  src: [
    {
      path: "../../public/fonts/IRANSansX-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANSansX-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-iran-sans",
});

// فونت مونتسرات برای زبان انگلیسی
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});
