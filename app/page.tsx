'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        background:
          'linear-gradient(180deg,#FFF5FA 0%,#FFFFFF 100%)',
        color: '#111827',
        overflow: 'hidden',
      }}
    >
      {/* NAVBAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(14px)',
          background: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid #FCE7F3',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '20px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
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

            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  marginBottom: 2,
                }}
              >
                Precy+
              </h1>

              <p
                style={{
                  fontSize: 13,
                  color: '#6B7280',
                }}
              >
                Sistema para gráficas
              </p>
            </div>
          </div>

          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
            }}
          >
            <a href="#beneficios">Benefícios</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
            <a href="#faq">FAQ</a>

            <Link href="/login">
              <button
                style={{
                  padding: '14px 26px',
                  borderRadius: 14,
                  border: 0,
                  cursor: 'pointer',
                  background:
                    'linear-gradient(135deg,#FF4FA3,#FF85C2)',
                  color: 'white',
                  fontWeight: 800,
                  boxShadow:
                    '0 10px 30px rgba(255,79,163,0.35)',
                }}
              >
                Entrar
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding:
            '120px 40px 100px',
          display: 'grid',
          gridTemplateColumns:
            '1.1fr 1fr',
          gap: 70,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#FFE4F1',
              color: '#FF4FA3',
              padding:
                '12px 18px',
              borderRadius: 999,
              fontWeight: 700,
              marginBottom: 28,
            }}
          >
            🚀 Sistema inteligente para gráficas
          </div>

          <h1
            style={{
              fontSize: 78,
              lineHeight: 1,
              fontWeight: 900,
              marginBottom: 30,
            }}
          >
            Pare de perder dinheiro na sua gráfica.
          </h1>

          <p
            style={{
              fontSize: 24,
              lineHeight: 1.7,
              color: '#6B7280',
              marginBottom: 42,
              maxWidth: 700,
            }}
          >
            O Precy+ calcula automaticamente custos,
            lucro, materiais e precificação para
            você vender com segurança e crescer sua
            empresa.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 20,
              flexWrap: 'wrap',
              marginBottom: 40,
            }}
          >
            <Link href="/cadastro">
              <button
                style={{
                  padding:
                    '20px 38px',
                  borderRadius: 18,
                  border: 0,
                  background:
                    'linear-gradient(135deg,#FF4FA3,#FF85C2)',
                  color: 'white',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow:
                    '0 20px 40px rgba(255,79,163,0.35)',
                }}
              >
                Começar agora
              </button>
            </Link>

            <Link href="/planos">
              <button
                style={{
                  padding:
                    '20px 38px',
                  borderRadius: 18,
                  border:
                    '2px solid #FF85C2',
                  background:
                    'transparent',
                  color: '#FF4FA3',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Ver planos
              </button>
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
            }}
          >
            {[
              ['+4.200', 'Pedidos calculados'],
              ['98%', 'Precisão nos custos'],
              ['+R$120k', 'Lucro gerado'],
            ].map(([n, t]) => (
              <div key={n}>
                <h2
                  style={{
                    fontSize: 38,
                    fontWeight: 900,
                    color: '#FF4FA3',
                  }}
                >
                  {n}
                </h2>

                <p
                  style={{
                    color: '#6B7280',
                  }}
                >
                  {t}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DASHBOARD */}
        <div
          style={{
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 300,
              height: 300,
              background: '#FFB7D7',
              filter: 'blur(120px)',
              opacity: 0.5,
              top: -60,
              right: -60,
            }}
          />

          <div
            style={{
              position: 'relative',
              background: 'white',
              borderRadius: 34,
              padding: 28,
              border:
                '1px solid #FCE7F3',
              boxShadow:
                '0 40px 100px rgba(15,23,42,0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 24,
              }}
            >
              {['#FF5F57', '#FEBC2E', '#28C840'].map(
                (c) => (
                  <div
                    key={c}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      background: c,
                    }}
                  />
                )
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 18,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background:
                    '#FFF5FA',
                  borderRadius: 22,
                  padding: 24,
                }}
              >
                <p
                  style={{
                    color: '#6B7280',
                    marginBottom: 8,
                  }}
                >
                  Lucro mensal
                </p>

                <h2
                  style={{
                    fontSize: 38,
                    fontWeight: 900,
                  }}
                >
                  R$12.480
                </h2>
              </div>

              <div
                style={{
                  background:
                    '#FFF5FA',
                  borderRadius: 22,
                  padding: 24,
                }}
              >
                <p
                  style={{
                    color: '#6B7280',
                    marginBottom: 8,
                  }}
                >
                  Pedidos
                </p>

                <h2
                  style={{
                    fontSize: 38,
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
                  '#FFF5FA',
                borderRadius: 24,
                padding: 24,
              }}
            >
              <div
                style={{
                  height: 240,
                  display: 'flex',
                  alignItems: 'end',
                  gap: 16,
                }}
              >
                {[50, 120, 90, 180, 130, 220].map(
                  (h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: h,
                        borderRadius: 18,
                        background:
                          'linear-gradient(180deg,#FF4FA3,#FFB7D7)',
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section
        id="beneficios"
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding:
            '80px 40px 140px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 70,
          }}
        >
          <h2
            style={{
              fontSize: 60,
              fontWeight: 900,
              marginBottom: 20,
            }}
          >
            Tudo em um único sistema
          </h2>

          <p
            style={{
              fontSize: 22,
              color: '#6B7280',
            }}
          >
            Automatize sua gráfica e aumente seu lucro.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(300px,1fr))',
            gap: 30,
          }}
        >
          {[
            'Precificação automática',
            'Controle financeiro',
            'Dashboard inteligente',
            'Gestão de materiais',
            'Controle de lucro',
            'Cadastro de clientes',
          ].map((item) => (
            <div
              key={item}
              style={{
                background: 'white',
                borderRadius: 28,
                padding: 34,
                border:
                  '1px solid #FCE7F3',
                boxShadow:
                  '0 20px 40px rgba(15,23,42,0.05)',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  background:
                    'linear-gradient(135deg,#FF4FA3,#FFB7D7)',
                  marginBottom: 24,
                }}
              />

              <h3
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 18,
                }}
              >
                {item}
              </h3>

              <p
                style={{
                  color: '#6B7280',
                  lineHeight: 1.8,
                }}
              >
                Ganhe velocidade, organização e segurança
                em cada orçamento da sua empresa.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section
        style={{
          padding:
            '120px 40px',
          background:
            'linear-gradient(180deg,#FFF5FA,#FFFFFF)',
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 58,
              textAlign: 'center',
              fontWeight: 900,
              marginBottom: 70,
            }}
          >
            Quem usa, recomenda
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(320px,1fr))',
              gap: 30,
            }}
          >
            {[
              'Consegui finalmente parar de cobrar errado.',
              'Meu lucro aumentou muito depois do Precy+.',
              'Hoje consigo controlar toda minha gráfica.',
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  background: 'white',
                  borderRadius: 28,
                  padding: 36,
                  border:
                    '1px solid #FCE7F3',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    marginBottom: 20,
                  }}
                >
                  {'★★★★★'}
                </div>

                <p
                  style={{
                    fontSize: 20,
                    lineHeight: 1.8,
                    marginBottom: 26,
                  }}
                >
                  "{text}"
                </p>

                <strong>
                  Cliente Precy+
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding:
            '120px 40px',
        }}
      >
        <h2
          style={{
            fontSize: 58,
            textAlign: 'center',
            fontWeight: 900,
            marginBottom: 70,
          }}
        >
          Perguntas frequentes
        </h2>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {[
            [
              'Preciso instalar algo?',
              'Não. O sistema funciona totalmente online.',
            ],
            [
              'Funciona para gráfica rápida?',
              'Sim. O sistema foi criado especialmente para gráficas.',
            ],
            [
              'Posso cancelar quando quiser?',
              'Sim. Sem fidelidade.',
            ],
          ].map(([q, a]) => (
            <div
              key={q}
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 30,
                border:
                  '1px solid #FCE7F3',
              }}
            >
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 14,
                }}
              >
                {q}
              </h3>

              <p
                style={{
                  color: '#6B7280',
                  lineHeight: 1.7,
                }}
              >
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding:
            '120px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            background:
              'linear-gradient(135deg,#FF4FA3,#FF85C2)',
            borderRadius: 40,
            padding:
              '80px 50px',
            textAlign: 'center',
            color: 'white',
            boxShadow:
              '0 40px 100px rgba(255,79,163,0.35)',
          }}
        >
          <h2
            style={{
              fontSize: 62,
              fontWeight: 900,
              marginBottom: 24,
            }}
          >
            Comece hoje mesmo.
          </h2>

          <p
            style={{
              fontSize: 24,
              lineHeight: 1.7,
              opacity: 0.95,
              marginBottom: 40,
            }}
          >
            Transforme sua gráfica em uma empresa mais organizada e lucrativa.
          </p>

          <Link href="/cadastro">
            <button
              style={{
                padding:
                  '22px 42px',
                borderRadius: 18,
                border: 0,
                background: 'white',
                color: '#FF4FA3',
                fontSize: 20,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Criar conta agora
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}