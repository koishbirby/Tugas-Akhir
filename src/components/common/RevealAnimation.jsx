import { useState, useEffect } from "react";

export default function RevealAnimation() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
    }, 1200); // matches animation time

    return () => clearTimeout(timer);
  }, []);

  return (
//     <div
//   className={`fixed inset-0 z-[9999] transition-opacity duration-500
//     ${hide ? "opacity-0 pointer-events-none" : "opacity-100"}`}
// >
//   <div className="w-full h-full bg-white animate-slide-down"></div>
// </div>

    <div
      className={`
        fixed inset-0 z-[9999] flex
        transition-opacity duration-500
        ${hide ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
    >
      {/* Left Panel */}
      <div className="w-1/2 h-full bg-white animate-reveal-left"></div>

      {/* Right Panel */}
      <div className="w-1/2 h-full bg-white animate-reveal-right"></div>
    </div>
  );
}
