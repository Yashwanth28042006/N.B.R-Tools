import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function Footer() {
  const cols = [
    {
      title: "Rentals",
      links: ["Power Tools", "Generators", "Ladders", "Welding", "Concrete", "Cleaning and Drying"],
    },
    { title: "Company", links: ["About N.B.R Tools", "Contact and Location"] },
    {
      title: "Support",
      links: ["Delivery and Pickup", "Rental Agreement", "Returns", "Damage Policy"],
    },
    { title: "Legal", links: ["Terms of Service", "Privacy Policy", "GST Info"] },
  ];
  return (
    <footer className="mt-24 border-t border-border bg-ink text-ink-foreground">
      <div className="container-page py-14 grid gap-10 md:grid-cols-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Buddhi's N.B.R. Tools" className="h-16 w-16 object-contain" />
          </div>
          <p className="mt-4 text-sm text-ink-foreground/70 max-w-sm">
            Construction equipment rentals and sales in Coimbatore since 2020. Delivered on time,
            backed by a real crew.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-sm font-semibold tracking-wide">{c.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
              {c.links.map((l) => (
                <li key={l}>
                  <Link
                    to="/info/$page"
                    params={{ page: l.toLowerCase().replaceAll(" ", "-") }}
                    className="hover:text-amber transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-ink-foreground/60">
          <p>© {new Date().getFullYear()} N.B.R Tools. All rights reserved.</p>
          <p>Appanaikenpalayam, Kanuvai Road, Thudiyalur, Coimbatore · ₹ INR</p>
        </div>
      </div>
    </footer>
  );
}
