import { Building2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="relative w-full max-w-2xl mx-auto">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-amber-400/30 rounded-full" />
            <div className="absolute top-20 left-20 w-48 h-48 border border-amber-400/20 rounded-full" />
            <div className="absolute bottom-10 right-10 w-40 h-40 border border-amber-400/30 rounded-full" />
            <div className="absolute bottom-20 right-20 w-56 h-56 border border-amber-400/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-amber-400/10 rounded-full" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-transparent via-amber-400/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 mb-8">
            <Building2 className="w-10 h-10 text-slate-900" />
          </div>

          <div className="flex items-end justify-center gap-1 mb-8 opacity-30">
            <div className="w-4 h-12 bg-amber-400/50 rounded-t" />
            <div className="w-6 h-20 bg-amber-400/40 rounded-t" />
            <div className="w-4 h-16 bg-amber-400/50 rounded-t" />
            <div className="w-8 h-28 bg-amber-400/30 rounded-t" />
            <div className="w-5 h-14 bg-amber-400/50 rounded-t" />
            <div className="w-6 h-24 bg-amber-400/40 rounded-t" />
            <div className="w-4 h-10 bg-amber-400/50 rounded-t" />
          </div>

          <h1 className="text-4xl md:text-5xl font-light text-white tracking-wide mb-3">
            Tércia Borges
          </h1>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-400/50" />
            <div className="w-2 h-2 rounded-full bg-amber-400/70" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-400/50" />
          </div>

          <p className="text-amber-400/80 text-lg tracking-widest uppercase font-light">
            Gestão de Patrimônio
          </p>

          <div className="mt-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <div className="w-8 h-px bg-slate-700" />
            <span className="tracking-wider">IMÓVEIS</span>
            <div className="w-8 h-px bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
