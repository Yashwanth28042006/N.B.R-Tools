import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const PAGES: Record<
  string,
  { title: string; intro: string; sections: { heading: string; body: string }[] }
> = {
  "about-n.b.r-tools": {
    title: "About N.B.R Tools",
    intro: "N.B.R Tools has served builders, contractors and homeowners in Coimbatore since 2020.",
    sections: [
      {
        heading: "Our promise",
        body: "Well-maintained equipment, transparent day rates and practical support for every site.",
      },
      {
        heading: "Our base",
        body: "Appanaikenpalayam, Kanuvai Road, Thudiyalur, Coimbatore. Call 9047711602 or 9940747703, or email yashwanthbuddhi@gmail.com.",
      },
    ],
  },
  "contact-and-location": {
    title: "Contact and location",
    intro: "Visit or contact our Coimbatore equipment desk.",
    sections: [
      {
        heading: "Address",
        body: "Appanaikenpalayam, Kanuvai Road, Thudiyalur, Coimbatore, Tamil Nadu.",
      },
      {
        heading: "Call or email",
        body: "9047711602 · 9940747703 · yashwanthbuddhi@gmail.com. Please call before visiting for stock confirmation.",
      },
    ],
  },
  "delivery-and-pickup": {
    title: "Delivery and pickup",
    intro:
      "We arrange delivery and collection in Coimbatore based on equipment size and site access.",
    sections: [
      {
        heading: "Before delivery",
        body: "Confirm the site address, access route, contact person and required rental duration. Delivery charges are confirmed at checkout.",
      },
      {
        heading: "Pickup",
        body: "Keep equipment accessible and ready for inspection at the agreed collection time.",
      },
    ],
  },
  "rental-agreement": {
    title: "Rental agreement",
    intro: "Every rental is issued with an itemised agreement and refundable security deposit.",
    sections: [
      {
        heading: "Customer responsibility",
        body: "Use equipment only for its intended purpose, follow safety instructions and report faults immediately.",
      },
      {
        heading: "Returns",
        body: "Return equipment on the agreed date. Late charges and repair costs, where applicable, are documented before any deposit adjustment.",
      },
    ],
  },
  returns: {
    title: "Returns",
    intro: "Unused purchased items may be returnable subject to condition and supplier policy.",
    sections: [
      {
        heading: "Eligibility",
        body: "Contact us within 24 hours of delivery. Items must be unused, complete and in original condition.",
      },
      {
        heading: "Rental returns",
        body: "Rental equipment is collected or returned at the end of the booked period and checked with you.",
      },
    ],
  },
  "damage-policy": {
    title: "Damage policy",
    intro: "Normal wear is covered; avoidable damage is assessed fairly and documented.",
    sections: [
      {
        heading: "Report promptly",
        body: "Stop using damaged equipment and call us immediately. We will advise, repair or arrange a replacement where available.",
      },
      {
        heading: "Deposit",
        body: "The deposit is refunded after inspection, less any agreed repair, missing-part or late-return charge.",
      },
    ],
  },
  "terms-of-service": {
    title: "Terms of service",
    intro:
      "By placing an order, you agree to provide accurate contact and site details and use equipment safely.",
    sections: [
      {
        heading: "Pricing",
        body: "Displayed daily rental and purchase prices are subject to stock confirmation. GST and delivery are shown before checkout.",
      },
      {
        heading: "Availability",
        body: "A cart does not reserve an item until N.B.R Tools confirms the booking.",
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy policy",
    intro:
      "We use account, contact and order information only to provide equipment rental and sales services.",
    sections: [
      {
        heading: "Your data",
        body: "Account data and saved carts are stored in your authenticated account. We do not sell personal information.",
      },
      {
        heading: "Contact",
        body: "Email yashwanthbuddhi@gmail.com to request account-data assistance.",
      },
    ],
  },
  "gst-info": {
    title: "GST information",
    intro:
      "Applicable GST is calculated separately in the cart and an invoice is provided for confirmed orders.",
    sections: [
      {
        heading: "Invoice details",
        body: "Provide your billing name, address and GSTIN, if applicable, before order confirmation.",
      },
    ],
  },
};

export const Route = createFileRoute("/info/$page")({ component: InfoPage });

function InfoPage() {
  const { page } = Route.useParams();
  const content = PAGES[page] ?? {
    title: "Information",
    intro: "N.B.R Tools is here to help with your equipment needs.",
    sections: [],
  };
  return (
    <>
      <Header />
      <main className="container-page min-h-[65vh] py-12">
        <article className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-widest text-amber">
            N.B.R Tools · Established 2020
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold">{content.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{content.intro}</p>
          <div className="mt-10 space-y-8">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
