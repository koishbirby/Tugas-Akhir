// src/components/splash/LogoContainer.jsx
import logoUrl from '../../assets/LOGORN.png';

export default function LogoContainer() {
  return (
    <div className="mb-10 sm:mb-16 relative group">
      <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-orange/20 backdrop-blur-xl border border-white/30 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl sm:shadow-2xl shadow-blue-500/10 transform transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
        <img 
          src={logoUrl} 
          alt="Logo"
          className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain filter drop-shadow-lg transform transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Decorative Particles */}
      <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-400 rounded-full animate-ping opacity-75" />
      <div className="absolute -bottom-0.5 sm:-bottom-1 -left-0.5 sm:-left-1 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-300 rounded-full animate-ping opacity-75" style={{ animationDelay: '300ms' }} />
      <div className="absolute top-1/4 -right-2 sm:-right-3 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-indigo-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 -left-2 sm:-left-3 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-blue-500 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}