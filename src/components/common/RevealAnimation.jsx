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
    <div className={`fixed inset-0 z-[9999] transition-opacity duration-500 ${hide ? "opacity-0 pointer-events-none" : "opacity-100"}`} >
        <div className="w-full h-full bg-white animate-slide-down"></div>
    </div>
  );
}
