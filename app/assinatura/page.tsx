'use client';

export default function AssinaturaPage() {
  async function handleCheckout(
    plan: 'basic' | 'pro'
  ) {
    try {
      const response = await fetch(
        '/api/stripe/checkout',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            plan,
          }),
        }
      );

      const data =
        await response.json();

      if (data.url) {
        window.location.href =
          data.url;
      } else {
        alert(
          'Erro ao abrir checkout'
        );
      }
    } catch (error) {
      console.log(error);

      alert(
        'Erro ao abrir checkout'
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8FB] p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full">
        <h1 className="text-5xl font-black text-center text-[#1A1F5E] mb-4">
          Escolha seu plano 💗
        </h1>

        <p className="text-center text-gray-500 text-xl mb-14">
          Tenha acesso aos recursos premium
          do Precy+
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* BASIC */}
          <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm">
            <h2 className="text-3xl font-black text-[#1A1F5E] mb-2">
              Basic
            </h2>

            <p className="text-5xl font-black text-pink-500 mb-6">
              R$ 17
              <span className="text-lg text-gray-400">
                /mês
              </span>
            </p>

            <ul className="space-y-3 text-gray-600 mb-10">
              <li>
                ✅ Precificação ilimitada
              </li>
              <li>
                ✅ Controle de materiais
              </li>
              <li>
                ✅ Orçamentos
              </li>
              <li>
                ✅ Dashboard
              </li>
            </ul>

            <button
              onClick={() =>
                handleCheckout(
                  'basic'
                )
              }
              className="w-full bg-pink-500 hover:bg-pink-600 transition text-white font-bold py-4 rounded-2xl"
            >
              Assinar Basic
            </button>
          </div>

          {/* PRO */}
          <div className="bg-[#1A1F5E] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-pink-500 text-xs px-3 py-1 rounded-full font-bold">
              MAIS POPULAR
            </div>

            <h2 className="text-3xl font-black mb-2">
              Pro
            </h2>

            <p className="text-5xl font-black text-pink-300 mb-6">
              R$ 37
              <span className="text-lg text-pink-100">
                /mês
              </span>
            </p>

            <ul className="space-y-3 mb-10 text-pink-50">
              <li>
                ✅ Tudo do Basic
              </li>
              <li>
                ✅ IA para precificação
              </li>
              <li>
                ✅ Relatórios avançados
              </li>
              <li>
                ✅ Recursos ilimitados
              </li>
              <li>
                ✅ Prioridade suporte
              </li>
            </ul>

            <button
              onClick={() =>
                handleCheckout(
                  'pro'
                )
              }
              className="w-full bg-pink-500 hover:bg-pink-600 transition text-white font-bold py-4 rounded-2xl"
            >
              Assinar Pro
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}