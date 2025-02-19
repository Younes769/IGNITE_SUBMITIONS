import Image from "next/image";

const LogoSection = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side logos with X separator */}
          <div className="flex items-center space-x-4">
            <div className="relative w-32 h-16">
              <Image
                src="/white_logo.png"
                alt="Club Logo"
                fill
                className="object-contain hover:scale-105 transition-transform"
                priority
              />
            </div>

            <span className="text-white text-2xl font-bold transform -skew-x-12">
              ×
            </span>

            <div className="relative w-32 h-16">
              <Image
                src="/logo_nit_.png"
                alt="University Logo"
                fill
                className="object-contain hover:scale-105 transition-transform"
                priority
              />
            </div>
          </div>

          {/* Event logo on the right */}
          <div className="relative w-40 h-20">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg -z-10 blur-lg" />
            <Image
              src="/IGNITE_LOGO.svg"
              alt="Event Logo"
              fill
              className="object-contain hover:scale-110 transition-transform"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSection;
