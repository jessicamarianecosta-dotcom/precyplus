import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Nunito, sans-serif' }}>
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #1A1F5E 0%, #2D3480 60%, #FF6BAD 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: '#FFB3D1' }} />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: '#B3D4FF' }} />
        </div>
        <div className="relative z-10 text-center">
          <div className="animate-float mb-8">
            <Image src="/logo.png" alt="Precy+" width={120} height={120} className="mx-auto rounded-full shadow-2xl" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Precifique com confiança.
          </h2>
          <p className="text-pink-200 text-lg max-w-xs mx-auto leading-relaxed">
            A ferramenta que vai transformar como você cobra pelos seus produtos.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { v: '500+', l: 'Usuárias' },
              { v: '40%', l: 'Mais lucro' },
              { v: '4.9★', l: 'Avaliação' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-black text-white">{v}</p>
                <p className="text-xs text-pink-200 font-semibold">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white">
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Precy+" width={48} height={48} className="rounded-full" />
            <span className="font-black text-2xl" style={{ color: '#1A1F5E' }}>Precy<span style={{ color: '#FF6BAD' }}>+</span></span>
          </Link>
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
