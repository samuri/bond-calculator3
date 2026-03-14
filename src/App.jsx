import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info, TrendingUp, Calendar, Wallet, Calculator, ArrowRightLeft, Percent, Repeat, Layers, Coins, CheckCircle2 } from 'lucide-react';

const App = () => {
  const [principal, setPrincipal] = useState(1000000);
  const [yieldSingle, setYieldSingle] = useState(12.0); 
  const [yieldMonthly, setYieldMonthly] = useState(12.0); 
  const [bondPrice, setBondPrice] = useState(1000);
  const [years, setYears] = useState(10);
  const [taxRate, setTaxRate] = useState(13);
  const [reinvest, setReinvest] = useState(true);
  const [useLotSize, setUseLotSize] = useState(true);

  const results = useMemo(() => {
    const data = [];
    
    // Один выпуск
    let currentSinglePrincipal = principal;
    let singleCash = 0;

    // Лестница
    let currentMonthlyPrincipal = principal;
    let monthlyCash = 0;

    const netRateSingle = (yieldSingle / 100) * (1 - taxRate / 100);
    const netRateMonthly = (yieldMonthly / 100) * (1 - taxRate / 100);

    data.push({
      month: 0,
      single: Math.round(currentSinglePrincipal + singleCash),
      monthly: Math.round(currentMonthlyPrincipal + monthlyCash),
    });

    for (let m = 1; m <= years * 12; m++) {
      if (reinvest) {
        // Логика: Один выпуск (раз в 6 месяцев)
        if (m % 6 === 0) {
          const coupon = currentSinglePrincipal * (netRateSingle / 2);
          const available = coupon + singleCash;
          if (useLotSize) {
            const bondsToBuy = Math.floor(available / bondPrice);
            currentSinglePrincipal += bondsToBuy * bondPrice;
            singleCash = available - (bondsToBuy * bondPrice);
          } else {
            currentSinglePrincipal += available;
            singleCash = 0;
          }
        }

        // Логика: Лестница (каждый месяц)
        const monthlyCoupon = currentMonthlyPrincipal * (netRateMonthly / 12);
        const availableMonthly = monthlyCoupon + monthlyCash;
        if (useLotSize) {
          const bondsToBuy = Math.floor(availableMonthly / bondPrice);
          currentMonthlyPrincipal += bondsToBuy * bondPrice;
          monthlyCash = availableMonthly - (bondsToBuy * bondPrice);
        } else {
          currentMonthlyPrincipal += availableMonthly;
          monthlyCash = 0;
        }
      }

      if (m % 6 === 0 || m === years * 12) {
        data.push({
          month: m,
          year: (m / 12).toFixed(1),
          single: Math.round(currentSinglePrincipal + singleCash),
          monthly: Math.round(currentMonthlyPrincipal + monthlyCash),
          singleCash: Math.round(singleCash),
          monthlyCash: Math.round(monthlyCash)
        });
      }
    }

    const finalSingle = currentSinglePrincipal + singleCash;
    const finalMonthly = currentMonthlyPrincipal + monthlyCash;
    const diffFinal = finalMonthly - finalSingle;

    return { 
      data, 
      finalSingle, 
      finalMonthly, 
      singleCash,
      monthlyCash,
      diffFinal,
      effectiveSingle: (Math.pow(finalSingle / principal, 1 / years) - 1) * 100,
      effectiveMonthly: (Math.pow(finalMonthly / principal, 1 / years) - 1) * 100
    };
  }, [principal, yieldSingle, yieldMonthly, bondPrice, years, taxRate, reinvest, useLotSize]);

  const formatCurrency = (val) => new Intl.NumberFormat('ru-RU').format(Math.round(val)) + ' ₽';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-1 flex items-center gap-3">
            <Layers className="text-blue-600" /> Сравнение стратегий инвестирования в облигации
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Интерактивный анализ влияния структуры выплат на доходность</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Панель управления */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-700">Настройки</h2>
                <Calculator size={18} className="text-slate-400" />
            </div>
            
            <div className="space-y-5">
              {/* Основной капитал */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Стартовый капитал</label>
                <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full bg-transparent text-xl font-bold outline-none text-slate-800" />
              </div>

              {/* Цена лота */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Цена одной облигации</label>
                <div className="relative">
                    <input type="number" value={bondPrice} onChange={(e) => setBondPrice(Number(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pl-10 font-bold text-slate-700" />
                    <Coins className="absolute left-3 top-3 text-amber-500" size={18} />
                </div>
              </div>

              {/* Блок настройки ставок */}
              <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 space-y-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Процентные ставки стратегий</label>
                    <span className="text-[10px] text-slate-400 leading-tight italic">Укажите доходность (% годовых) для каждого варианта</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs font-bold text-indigo-700 mb-1.5">
                            <span>Один выпуск (2 вып./год)</span>
                            <span className="bg-indigo-100 px-2 py-0.5 rounded-full">{yieldSingle}%</span>
                        </div>
                        <input type="range" min="1" max="25" step="0.1" value={yieldSingle} onChange={(e) => setYieldSingle(Number(e.target.value))} className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    </div>
                    
                    <div>
                        <div className="flex justify-between text-xs font-bold text-emerald-700 mb-1.5">
                            <span>Лестница (12 вып./год)</span>
                            <span className="bg-emerald-100 px-2 py-0.5 rounded-full">{yieldMonthly}%</span>
                        </div>
                        <input type="range" min="1" max="25" step="0.1" value={yieldMonthly} onChange={(e) => setYieldMonthly(Number(e.target.value))} className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                    </div>
                </div>
              </div>

              {/* Параметры режима */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/30 cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setUseLotSize(!useLotSize)}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${useLotSize ? 'bg-blue-600 text-white border-transparent' : 'bg-white border border-slate-300'}`}>
                        {useLotSize && <CheckCircle2 size={14} />}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Учет цены облигации</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 cursor-pointer hover:bg-indigo-50 transition-colors" onClick={() => setReinvest(!reinvest)}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${reinvest ? 'bg-indigo-600 text-white border-transparent' : 'bg-white border border-slate-300'}`}>
                        {reinvest && <CheckCircle2 size={14} />}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Реинвестирование</span>
                </div>
              </div>

              {/* Срок */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-tighter">
                    <span>Срок инвестирования</span>
                    <span className="text-slate-800">{years} лет</span>
                </div>
                <input type="range" min="1" max="25" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Итоговые показатели */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <Calendar className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                <div className="relative z-10">
                    <div className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">Стратегия: Один выпуск</div>
                    <div className="text-3xl font-black mb-2 leading-none">{formatCurrency(results.finalSingle)}</div>
                    <div className="flex items-center gap-2 text-indigo-100 text-sm font-bold">
                        <TrendingUp size={16} /> Эффективная: {results.effectiveSingle.toFixed(2)}%
                    </div>
                </div>
              </div>
              <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                <Repeat className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                <div className="relative z-10">
                    <div className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Стратегия: Лестница ОФЗ</div>
                    <div className="text-3xl font-black mb-2 leading-none">{formatCurrency(results.finalMonthly)}</div>
                    <div className="flex items-center gap-2 text-emerald-100 text-sm font-bold">
                        <TrendingUp size={16} /> Эффективная: {results.effectiveMonthly.toFixed(2)}%
                    </div>
                </div>
              </div>
            </div>

            {/* Объяснение неделимости активов */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                <Info size={20} className="text-blue-500" />
                Особенности реального рынка
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
                <div className="space-y-3">
                  <p>
                    При цене облигации в **{formatCurrency(bondPrice)}**, купонная лестница (12 раз в год) позволяет быстрее аккумулировать средства для покупки следующего целого лота.
                  </p>
                  <p className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-900 font-medium italic">
                    «Лестница» превращает ваш портфель в активный поток. В обычном выпуске вы ждете 6 месяцев выплату, которая просто лежит на брокерском счете без дела, пока вы не получите ее целиком.
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Простой капитала (Cash):</div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">Вариант 2/год:</span>
                    <span className="font-black text-indigo-600">{formatCurrency(results.singleCash)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">Вариант 12/год:</span>
                    <span className="font-black text-emerald-600">{formatCurrency(results.monthlyCash)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    * Это остатки средств, которых не хватило для покупки целой облигации в последний расчетный период.
                  </p>
                </div>
              </div>
            </div>

            {/* График */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Прогноз роста портфеля</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10}}
                      tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'} 
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                    />
                    <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                    <Line name="Один выпуск (2/год)" type="monotone" dataKey="single" stroke="#6366f1" strokeWidth={4} dot={false} activeDot={{ r: 6 }} />
                    <Line name="Лестница ОФЗ (12/год)" type="monotone" dataKey="monthly" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Резюме по стратегии */}
            <div className={`p-6 rounded-3xl border-2 transition-all ${results.diffFinal > 0 ? 'bg-emerald-50 border-emerald-100 shadow-lg shadow-emerald-50' : 'bg-slate-100 border-slate-200'}`}>
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 ${results.diffFinal > 0 ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-500'}`}>
                    <ArrowRightLeft size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase text-slate-400 mb-1 tracking-wider text-left">Итоговый вывод</h4>
                    <p className="text-sm font-bold text-slate-700 leading-snug">
                      {results.diffFinal > 0 ? (
                        <>Благодаря более быстрому обороту купонов (цена облигации {formatCurrency(bondPrice)}), лестница приносит на <span className="text-emerald-600 underline decoration-2">{formatCurrency(results.diffFinal)}</span> больше дохода.</>
                      ) : (
                        <>В данных условиях единовременное вложение выгоднее на {formatCurrency(Math.abs(results.diffFinal))}. Преимущество частоты выплат не смогло компенсировать разрыв в доходности или задержки накопления.</>
                      )}
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;