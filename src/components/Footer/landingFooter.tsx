import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const platform = [
    { label: "Investment Glossary", href: "/glossary" },
    { label: "Market Overview", href: "/pricing" },
    { label: "Planing Hub", href: "/plan" },
    { label: "News", href: "/news" },
    { label: "Tools & Calculators", href: "/tool" },
  ];

  const company = [
    { label: "เกี่ยวกับแพลตฟอร์ม", href: "#" },
    { label: "วิธีการใช้งาน", href: "#" },
    { label: "ติดต่อทีมงาน", href: "#" },
  ];

  const legal = [
    { label: "ข้อตกลงการใช้งาน", href: "#" },
    { label: "นโยบายความเป็นส่วนตัว", href: "#" },
    { label: "คำชี้แจงความเสี่ยง", href: "#" },
  ];

  const socialLinks = [
    { Icon: Github, href: "https://github.com/itsaofpx" },
    { Icon: Linkedin, href: "https://www.linkedin.com/in/podjanin-wachirawittayakul-293820359/" },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-xl font-bold text-white mb-4">Finance Pro</div>
            <p className="text-gray-400 max-w-md leading-relaxed text-sm">
              แพลตฟอร์มให้ความรู้และเครื่องมือด้านการลงทุน
              เพื่อช่วยให้คุณเข้าใจข้อมูลทางการเงินได้อย่างมีเหตุผล
              ไม่ใช่คำแนะนำในการลงทุน
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-gray-200 font-semibold mb-4 text-sm uppercase tracking-wider">
              Platform
            </h3>
            <ul className="space-y-3">
              {platform.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-gray-400 text-sm hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company / Legal */}
          <div>
            <h3 className="text-gray-200 font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal & Info
            </h3>
            <ul className="space-y-3">
              {[...company, ...legal].map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-gray-400 text-sm hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left max-w-xl">
            © {new Date().getFullYear()} Finance Pro.
            ข้อมูลทั้งหมดจัดทำขึ้นเพื่อการศึกษาเท่านั้น
            ผู้ใช้งานควรศึกษาข้อมูลเพิ่มเติมก่อนตัดสินใจลงทุน
          </p>

          <div className="flex items-center gap-5">
            {socialLinks.map(({ Icon, href }, index) => (
              <Link
                key={index}
                href={href}
                target="_blank"
                className="text-gray-400 hover:text-white transition"
              >
                <Icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
