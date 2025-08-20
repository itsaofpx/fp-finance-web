import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const products = [
    "ระบบวางแผนชีวิต",
    "รายชื่อหุ้น",
    "เครื่องมือลงทุน",
    "บทความหุ้น",
  ];
  const legal = ["ข้อกำหนดการใช้งาน", "นโยบายความเป็นส่วนตัว", "ติดต่อเรา"];
  const socialLinks = [
    { Icon: Github, href: "#" },
    { Icon: Twitter, href: "#" },
    { Icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-white mb-6">
              Finance Pro
            </div>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              พาร์ทเนอร์ที่เชื่อถือได้ในการเติบโตทางการเงินและการบริหารความมั่งคั่งของคุณ
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">ผลิตภัณฑ์</h3>
            <div className="space-y-3">
              {products.map((item, index) => (
                <Link
                  key={index}
                  href="#"
                  className="block text-gray-400 hover:text-white transition hover:translate-x-2"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">
              ข้อมูลทางกฎหมาย
            </h3>
            <div className="space-y-3">
              {legal.map((item, index) => (
                <Link
                  key={index}
                  href="#"
                  className="block text-gray-400 hover:text-white transition hover:translate-x-2"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Finance Pro. สงวนลิขสิทธิ์.
          </div>

          <div className="flex space-x-6">
            {socialLinks.map(({ Icon, href }, index) => (
              <Link
                key={index}
                href={href}
                className="text-gray-400 hover:text-white transition hover:scale-125"
              >
                <Icon className="w-6 h-6" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
