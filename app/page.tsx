'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg,#FFF5FA 0%,#FFFFFF 100%)',
        color: '#1E1B4B',
      }}
    >
      <header
        style={{
          width: '100%',
          padding: '24px 80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
          borderBottom: '1px solid #F3E8FF',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src="/logo.png"
            alt="Precy+"
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
            }}
          />

          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#1E1B4B',
            }}
          >
            Precy+
          </h1>
        </div>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <a href="#beneficios">
            Benefícios
          </a>

          <a href="#planos">
            Planos
          </a>

          <Link href="/login">
            <button
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: 0,
                background:
                  'linear-gradient(135deg,#FF6BAD,#FF8DC7)',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Entrar
            </button>
          </Link>
        </nav>
      </header>

      <section
        style={{
          width: '100%',
          maxWidth: 1300,
          margin: '0 auto',
          padding:
            '120px 80px 100px',
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          alignItems: 'center',
          gap: 60,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-block',
              background: '#FFE4F1',
              color: '#FF4FA3',
              padding:
                '10px 18px',
              borderRadius: 999,
              fontWeight: 700,
              marginBottom: 28,
            }}
          >
            Sistema inteligente para gráficas
          </div>

          <h1
            style={{
              fontSize: 68,
              lineHeight: 1.05,
              fontWeight: 900,
              marginBottom: 28,
            }}
          >
            Precifique seus produtos com confiança.
          </h1>

          <p
            style={{
              fontSize: 22,
              lineHeight: 1.7,
              color: '#64748B',
              marginBottom: 40,
            }}
          >
            Controle estoque, clientes,
            materiais, custos e lucro em um único lugar.
            O Precy+ foi criado especialmente
            para gráficas rápidas e personalizados.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            <Link href="/cadastro">
              <button
                style={{
                  padding:
                    '18px 34px',
                  borderRadius: 16,
                  border: 0,
                  background:
                    'linear-gradient(135deg,#FF6BAD,#FF8DC7)',
                  color: 'white',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow:
                    '0 20px 40px rgba(255,107,173,0.35)',
                }}
              >
                Começar agora
              </button>
            </Link>

            <Link href="/login">
              <button
                style={{
                  padding:
                    '18px 34px',
                  borderRadius: 16,
                  border:
                    '2px solid #FF8DC7',
                  background:
                    'transparent',
                  color: '#FF4FA3',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Já tenho conta
              </button>
            </Link>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 30,
            padding: 30,
            boxShadow:
              '0 30px 80px rgba(15,23,42,0.12)',
            border:
              '1px solid #F3E8FF',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: '#FF6BAD',
              }}
            />

            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: '#FDBA74',
              }}
            />

            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: '#86EFAC',
              }}
            />
          </div>

          <div
            style={{
              background:
                'linear-gradient(135deg,#FFF0F7,#FFFFFF)',
              borderRadius: 24,
              padding: 28,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 18,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  background:
                    'white',
                  borderRadius: 20,
                  padding: 22,
                }}
              >
                <p
                  style={{
                    color: '#94A3B8',
                    marginBottom: 10,
                  }}
                >
                  Lucro mensal
                </p>

                <h2
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                  }}
                >
                  R$ 12.480
                </h2>
              </div>

              <div
                style={{
                  background:
                    'white',
                  borderRadius: 20,
                  padding: 22,
                }}
              >
                <p
                  style={{
                    color: '#94A3B8',
                    marginBottom: 10,
                  }}
                >
                  Pedidos
                </p>

                <h2
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                  }}
                >
                  148
                </h2>
              </div>
            </div>

            <div
              style={{
                background:
                  'white',
                borderRadius: 20,
                padding: 24,
              }}
            >
              <div
                style={{
                  height: 220,
                  borderRadius: 18,
                  background:
                    'linear-gradient(180deg,#FFE4F1,#FFFFFF)',
                  display: 'flex',
                  alignItems: 'end',
                  gap: 16,
                  padding: 20,
                }}
              >
                {[40, 90, 70, 130, 100, 160].map(
                  (height, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        height,
                        borderRadius: 14,
                        background:
                          'linear-gradient(180deg,#FF6BAD,#FFB7D7)',
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}