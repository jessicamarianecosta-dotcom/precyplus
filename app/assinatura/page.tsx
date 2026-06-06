'use client';

export default function AssinaturaPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6">

      <div className="w-full max-w-5xl">

        {/* TEXTO TOPO */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#1A1F5E]">
            Escolha seu plano 💗
          </h1>

          <p className="text-gray-500 mt-2">
            Tenha acesso aos recursos premium do Precy+ e organize seu negócio de forma simples, rápida e profissional.
          </p>
        </div>

        {/* PLANOS */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* BASIC */}
          <div className="bg-white border border-pink-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-[#1A1F5E]">
              Basic
            </h2>

            <p className="text-gray-500 mt-2">
              Ideal para organizar sua precificação e controlar seus custos.
            </p>

            <div className="text-4xl font-black text-pink-500 mt-4">
              R$ 17<span className="text-base text-gray-400">/mês</span>
            </div>

            <ul className="mt-6 space-y-2 text-gray-700 font-medium">
              <li>✔ Precificação inteligente</li>
              <li>✔ Controle de materiais</li>
              <li>✔ Custos fixos</li>
              <li>✔ Dashboard básico</li>
            </ul>

            <button className="w-full mt-8 bg-pink-500 text-white font-bold py-3 rounded-xl">
              Assinar Basic
            </button>
          </div>

          {/* PRO */}
          <div className="bg-[#1A1F5E] text-white rounded-2xl p-8 shadow-lg relative">

            <span className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Mais Popular
            </span>

            <h2 className="text-2xl font-black">
              Pro
            </h2>

            <p className="text-gray-300 mt-2">
              Para quem quer controle completo do negócio e mais lucro.
            </p>

            <div className="text-4xl font-black text-pink-400 mt-4">
              R$ 37<span className="text-base text-gray-300">/mês</span>
            </div>

            <ul className="mt-6 space-y-2 text-gray-200 font-medium">
              <li>✔ Tudo do Basic</li>
              <li>✔ Financeiro completo</li>
              <li>✔ Gestão de clientes</li>
              <li>✔ Orçamentos em PDF</li>
              <li>✔ Relatórios avançados</li>
              <li>✔ Suporte prioritário</li>
            </ul>

            <button className="w-full mt-8 bg-pink-500 text-white font-bold py-3 rounded-xl">
              Assinar Pro
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}