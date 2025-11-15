export default function TopBar() {
  return (
    <div className="w-full bg-[#506600] text-white text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-1">
        {/* Left Side - Tagline */}
        <p className="italic">🌿 Natural harmony for mind</p>

        {/* Right Side - Office Hours */}
        <p className="mt-1 md:mt-0">🕒 Office Hours: 9:00 AM – 6:00 PM</p>
      </div>
    </div>
  );
}
