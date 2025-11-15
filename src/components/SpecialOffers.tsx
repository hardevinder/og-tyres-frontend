"use client";
import { Package, Heart, Flower2 } from "lucide-react";

const bundles = [
  {
    icon: <Package size={32} />,
    title: "Diabetes Care Kit",
    desc: "A powerful herbal combo with Karela, Jamun, and Fenugreek to support healthy sugar levels.",
    price: "₹899",
    image: "/bundle-diabetes.jpg", // 👉 save in /public
  },
  {
    icon: <Heart size={32} />,
    title: "Immunity Booster Pack",
    desc: "Includes Chyawanprash, Giloy, and Tulsi extracts for stronger immunity.",
    price: "₹749",
    image: "/bundle-immunity.jpg",
  },
  {
    icon: <Flower2 size={32} />,
    title: "Skin Care Bundle",
    desc: "Neem Face Wash, Aloe Vera Gel & Herbal Creams for naturally glowing skin.",
    price: "₹599",
    image: "/bundle-skin.jpg",
  },
];

export default function SpecialOffers() {
  return (
    <section className="w-full bg-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#506600]">
          Special Offers
        </h2>
        <p className="text-gray-600 mt-4 text-lg">
          Save more with our featured Ayurvedic bundles, crafted for your
          wellness journey.
        </p>
      </div>

      {/* Bundles Grid */}
      <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((item, i) => (
          <div
            key={i}
            className="bg-[#f9faf6] rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
          >
            {/* Image */}
            <div className="h-64 w-full flex items-center justify-center bg-white">
              <img
                src={item.image}
                alt={item.title}
                className="max-h-full object-contain p-6 transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1 text-center">
              <div className="flex justify-center text-[#506600] mb-3">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#506600]">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm mt-2 flex-1">{item.desc}</p>
              <div className="text-[#506600] font-bold text-lg mt-4">
                {item.price}
              </div>
              <button className="btn-primary mt-6">Shop Now</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
