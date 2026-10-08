import React from 'react';
import { Lightbulb, Percent, Shield, Shuffle, CalendarClock } from 'lucide-react';

export default function SavingsHacksBanner() {
  const hacks = [
    {
      icon: CalendarClock,
      title: "Flexibilidad de Fechas (±3 días)",
      desc: "Desplazar tu viaje 24-48 horas a días valle (martes/miércoles) reduce el billete hasta un 45% frente a fines de semana."
    },
    {
      icon: Shield,
      title: "Cero Comisiones de OTA",
      desc: "Conexión directa a inventarios reales sin intermediarios ni recargos de 15€-40€ que aplican agencias online."
    },
    {
      icon: Shuffle,
      title: "Split-Ticketing & Low-Cost",
      desc: "Algoritmo que contempla combinar trayectos de aerolíneas independientes para romper el monopolio de alianzas."
    },
    {
      icon: Percent,
      title: "Sin Subida de Precios por Rastreo",
      desc: "Scraping limpio de servidor que evita que las aerolíneas detecten tu IP o cookies de intención de compra."
    }
  ];

  return (
    <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2.5 mb-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
        <Lightbulb className="w-4 h-4" />
        Estrategias de Optimización
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
        ¿Por qué esta app encuentra los vuelos más baratos?
      </h2>
      <p className="text-sm text-slate-500 max-w-2xl mb-8 font-medium">
        Diseñado para exprimir cada euro de ahorro combinando scraping en tiempo real con tácticas avanzadas de compra de billetes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {hacks.map((h, i) => {
          const Icon = h.icon;
          return (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100/70 border border-blue-200 flex items-center justify-center text-blue-600">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{h.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{h.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
