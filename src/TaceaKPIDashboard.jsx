import React, { useMemo, useState, useEffect } from "react";
import { Download, TrendingUp, TrendingDown, AlertCircle, RefreshCcw, Save, Zap, Eraser } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LabelList,
  AreaChart,
  Area,
  YAxis,
  CartesianGrid
} from "recharts";

/**
 * Tacea Music – KPI Dashboard Interactivo
 *
 * - Mantiene los cálculos/estados del snippet original
 * - Añade: gráficos (Embudo + Serie temporal), presets, persistencia local, reset
 * - UI limpia con Tailwind; sin dependencias de shadcn para fácil ejecución
 * - Descarga CSV incluida
 */

const presets = {
  "Ejemplo Conservador": {
    inversión: 12000,
    impresiones: 450000,
    clics: 7200,
    mensajesIniciados: 980,
    conversacionesActivas: 620,
    cotizacionesEnviadas: 260,
    ventasCerradas: 78,
    ingresosTotales: 265000
  },
  "Ejemplo Acelerado": {
    inversión: 35000,
    impresiones: 1200000,
    clics: 21000,
    mensajesIniciados: 3800,
    conversacionesActivas: 2400,
    cotizacionesEnviadas: 1200,
    ventasCerradas: 310,
    ingresosTotales: 980000
  }
};

const numberToFixed = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "0.00");

const formatCurrency = (num) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2
  }).format(Number(num) || 0);

const formatInt = (num) => new Intl.NumberFormat("es-MX").format(Math.round(Number(num) || 0));

const Indicator = ({ value, threshold, inverse = false }) => {
  if (!Number.isFinite(value) || value === 0) return null;
  const isGood = inverse ? value < threshold : value > threshold;
  const Icon = isGood ? TrendingUp : TrendingDown;
  return <Icon className={`inline w-4 h-4 ${isGood ? "text-green-600" : "text-red-600"} ml-2`} />;
};

export default function TaceaKPIDashboardInteractivo() {
  const [data, setData] = useState({
    inversión: "",
    impresiones: "",
    clics: "",
    mensajesIniciados: "",
    conversacionesActivas: "",
    cotizacionesEnviadas: "",
    ventasCerradas: "",
    ingresosTotales: ""
  });

  // Persistencia en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tacea_kpi_dashboard");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tacea_kpi_dashboard", JSON.stringify(data));
  }, [data]);

  const setField = (key, val) => {
    const numeric = val === "" ? "" : String(val).replace(/[^0-9.\-]/g, "");
    setData((p) => ({ ...p, [key]: numeric }));
  };

  // Números crudos
  const inv = parseFloat(data.inversión) || 0;
  const imp = parseFloat(data.impresiones) || 0;
  const clics = parseFloat(data.clics) || 0;
  const msgs = parseFloat(data.mensajesIniciados) || 0;
  const convs = parseFloat(data.conversacionesActivas) || 0;
  const cots = parseFloat(data.cotizacionesEnviadas) || 0;
  const ventas = parseFloat(data.ventasCerradas) || 0;
  const ingresos = parseFloat(data.ingresosTotales) || 0;

  // Cálculos (idénticos al snippet original)
  const cpm = imp > 0 ? (inv / imp) * 1000 : 0;
  const ctr = imp > 0 ? (clics / imp) * 100 : 0;
  const cpc = clics > 0 ? inv / clics : 0;

  const tasaInicioConv = clics > 0 ? (msgs / clics) * 100 : 0;
  const costoPorMensaje = msgs > 0 ? inv / msgs : 0;
  const tasaRespuesta = msgs > 0 ? (convs / msgs) * 100 : 0;

  const tasaCotización = convs > 0 ? (cots / convs) * 100 : 0;
  const tasaConversión = cots > 0 ? (ventas / cots) * 100 : 0;
  const ticketPromedio = ventas > 0 ? ingresos / ventas : 0;
  const roi = inv > 0 ? ((ingresos - inv) / inv) * 100 : 0;
  const roas = inv > 0 ? ingresos / inv : 0;

  const cac = ventas > 0 ? inv / ventas : 0;
  const conversionTotal = imp > 0 ? (ventas / imp) * 100 : 0;

  const embudoData = useMemo(
    () => [
      { etapa: "Impresiones", valor: imp, porcentaje: 100 },
      { etapa: "Clics", valor: clics, porcentaje: imp > 0 ? (clics / imp) * 100 : 0 },
      { etapa: "Mensajes", valor: msgs, porcentaje: imp > 0 ? (msgs / imp) * 100 : 0 },
      { etapa: "Conversaciones", valor: convs, porcentaje: imp > 0 ? (convs / imp) * 100 : 0 },
      { etapa: "Cotizaciones", valor: cots, porcentaje: imp > 0 ? (cots / imp) * 100 : 0 },
      { etapa: "Ventas", valor: ventas, porcentaje: imp > 0 ? (ventas / imp) * 100 : 0 }
    ],
    [imp, clics, msgs, convs, cots, ventas]
  );

  const exportToCSV = () => {
    const csvContent = [
      ["DATOS DE ENTRADA"],
      ["Inversión Publicitaria", inv],
      ["Impresiones", imp],
      ["Clics", clics],
      ["Mensajes Iniciados", msgs],
      ["Conversaciones Activas", convs],
      ["Cotizaciones Enviadas", cots],
      ["Ventas Cerradas", ventas],
      ["Ingresos Totales", ingresos],
      [""],
      ["TOP FUNNEL - ADQUISICIÓN"],
      ["CPM (Costo por mil impresiones)", numberToFixed(cpm)],
      ["CTR (Click-through rate) %", numberToFixed(ctr)],
      ["CPC (Costo por clic)", numberToFixed(cpc)],
      [""],
      ["MIDDLE FUNNEL - CONVERSACIÓN"],
      ["Tasa de inicio de conversación %", numberToFixed(tasaInicioConv)],
      ["Costo por mensaje", numberToFixed(costoPorMensaje)],
      ["Tasa de respuesta %", numberToFixed(tasaRespuesta)],
      [""],
      ["BOTTOM FUNNEL - CONVERSIÓN"],
      ["Tasa de cotización %", numberToFixed(tasaCotización)],
      ["Tasa de conversión a venta %", numberToFixed(tasaConversión)],
      ["Ticket promedio", numberToFixed(ticketPromedio)],
      ["ROI %", numberToFixed(roi)],
      ["ROAS", numberToFixed(roas)],
      [""],
      ["EFICIENCIA"],
      ["CAC (Costo de Adquisición)", numberToFixed(cac)],
      ["Conversión Total %", (Number.isFinite(conversionTotal) ? conversionTotal.toFixed(4) : "0.0000")]
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tacea_kpis_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const applyPreset = (name) => setData(Object.fromEntries(Object.entries(presets[name]).map(([k, v]) => [k, String(v)])));
  const resetAll = () => setData({
    inversión: "",
    impresiones: "",
    clics: "",
    mensajesIniciados: "",
    conversacionesActivas: "",
    cotizacionesEnviadas: "",
    ventasCerradas: "",
    ingresosTotales: ""
  });

  // Serie temporal sintética para ejemplo (Derivada de ROAS/ROI para mostrar tendencia)
  const trendData = useMemo(() => {
    // Genera 8 puntos con una leve variación de los valores actuales para visualización
    const baseRoas = roas || 0;
    const baseRoi = roi || 0;
    return Array.from({ length: 8 }).map((_, i) => ({
      label: `S${i + 1}`,
      roas: Math.max(0, baseRoas * (0.85 + (i / 14))),
      roi: baseRoi * (0.8 + (i / 10))
    }));
  }, [roas, roi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Tacea Music</h1>
              <p className="text-slate-600 mt-1">Dashboard de KPIs y Embudo de Conversión</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(presets).map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className="inline-flex items-center gap-2 bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition"
                  title="Cargar preset"
                >
                  <Zap className="w-4 h-4" /> {p}
                </button>
              ))}
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                title="Exportar CSV"
              >
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-2 bg-slate-200 text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-300 transition"
                title="Limpiar todo"
              >
                <Eraser className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Datos de Entrada */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Datos de Entrada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: "inversión", label: "Inversión Publicitaria (MXN)", prefix: "$" },
              { key: "impresiones", label: "Impresiones", prefix: "" },
              { key: "clics", label: "Clics", prefix: "" },
              { key: "mensajesIniciados", label: "Mensajes Iniciados", prefix: "" },
              { key: "conversacionesActivas", label: "Conversaciones Activas", prefix: "" },
              { key: "cotizacionesEnviadas", label: "Cotizaciones Enviadas", prefix: "" },
              { key: "ventasCerradas", label: "Ventas Cerradas", prefix: "" },
              { key: "ingresosTotales", label: "Ingresos Totales (MXN)", prefix: "$" }
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-3 top-2.5 text-slate-500">{field.prefix}</span>
                  )}
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={data[field.key]}
                    onChange={(e) => setField(field.key, e.target.value)}
                    className={`w-full border border-slate-300 rounded-lg p-2 ${field.prefix ? "pl-7" : ""} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Funnel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">🎯 Top Funnel - Adquisición</h3>
            <div className="space-y-3">
              <div className="border-b pb-2">
                <div className="text-sm text-slate-600">CPM</div>
                <div className="text-xl font-bold text-slate-800">
                  {formatCurrency(cpm)}
                  <Indicator value={cpm} threshold={50} inverse />
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="text-sm text-slate-600">CTR</div>
                <div className="text-xl font-bold text-slate-800">
                  {numberToFixed(ctr)}%
                  <Indicator value={ctr} threshold={1} />
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">CPC</div>
                <div className="text-xl font-bold text-slate-800">
                  {formatCurrency(cpc)}
                  <Indicator value={cpc} threshold={10} inverse />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Funnel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">💬 Middle Funnel - Conversación</h3>
            <div className="space-y-3">
              <div className="border-b pb-2">
                <div className="text-sm text-slate-600">Tasa Inicio Conversación</div>
                <div className="text-xl font-bold text-slate-800">
                  {numberToFixed(tasaInicioConv)}%
                  <Indicator value={tasaInicioConv} threshold={10} />
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="text-sm text-slate-600">Costo por Mensaje</div>
                <div className="text-xl font-bold text-slate-800">
                  {formatCurrency(costoPorMensaje)}
                  <Indicator value={costoPorMensaje} threshold={50} inverse />
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Tasa de Respuesta</div>
                <div className="text-xl font-bold text-slate-800">
                  {numberToFixed(tasaRespuesta)}%
                  <Indicator value={tasaRespuesta} threshold={50} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Funnel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">💰 Bottom Funnel - Conversión</h3>
            <div className="space-y-3">
              <div className="border-b pb-2">
                <div className="text-sm text-slate-600">Tasa de Cotización</div>
                <div className="text-xl font-bold text-slate-800">
                  {numberToFixed(tasaCotización)}%
                  <Indicator value={tasaCotización} threshold={40} />
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="text-sm text-slate-600">Tasa Conversión Venta</div>
                <div className="text-xl font-bold text-slate-800">
                  {numberToFixed(tasaConversión)}%
                  <Indicator value={tasaConversión} threshold={25} />
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Ticket Promedio</div>
                <div className="text-xl font-bold text-slate-800">{formatCurrency(ticketPromedio)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROI / ROAS / CAC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-sm opacity-90">ROI (Return on Investment)</div>
            <div className="text-3xl font-bold mt-2">{numberToFixed(roi)}%</div>
            <div className="text-sm mt-1 opacity-90">{roi > 0 ? `Ganancia de ${formatCurrency(ingresos - inv)}` : "Sin ganancia"}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-sm opacity-90">ROAS (Return on Ad Spend)</div>
            <div className="text-3xl font-bold mt-2">{numberToFixed(roas)}x</div>
            <div className="text-sm mt-1 opacity-90">Por cada $1 invertido: {formatCurrency(roas)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-sm opacity-90">CAC (Costo Adquisición Cliente)</div>
            <div className="text-3xl font-bold mt-2">{formatCurrency(cac)}</div>
            <div className="text-sm mt-1 opacity-90">Por cada cliente nuevo</div>
          </div>
        </div>

        {/* Embudo Visual (Gráfico) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">🔄 Embudo de Conversión</h3>
            <span className="text-xs text-slate-500">% sobre Impresiones</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={embudoData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="etapa" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${v}%`} allowDecimals domain={[0, 100]} />
                <Tooltip formatter={(value, name) => [name === "porcentaje" ? `${numberToFixed(value)}%` : formatInt(value), name]} />
                <Bar dataKey="porcentaje" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="porcentaje" position="top" formatter={(v) => `${numberToFixed(v)}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Barra de progreso secundaria textual */}
          <div className="space-y-2 mt-6">
            {embudoData.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">{item.etapa}</span>
                  <span className="text-sm text-slate-600">{formatInt(item.valor)} ({numberToFixed(item.porcentaje)}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(item.porcentaje, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendencias (ROI/ROAS) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            📈 Tendencias simuladas (ROI vs ROAS)
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="roas" name="ROAS" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="roi" name="ROI %" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2">Nota: la serie temporal es ilustrativa; se calcula a partir del estado actual para visualizar tendencia.</p>
        </div>

        {/* Benchmarks y Recomendaciones */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Benchmarks y Recomendaciones
          </h3>
          <div className="space-y-2 text-sm text-amber-800">
            <p>• <strong>CTR óptimo:</strong> 1–3% (tuyo: {numberToFixed(ctr)}%)</p>
            <p>• <strong>Tasa inicio conversación:</strong> 10–20% (tuyo: {numberToFixed(tasaInicioConv)}%)</p>
            <p>• <strong>Tasa conversión venta:</strong> 20–30% (tuyo: {numberToFixed(tasaConversión)}%)</p>
            <p>• <strong>ROAS mínimo recomendado:</strong> 3x (tuyo: {numberToFixed(roas)}x)</p>
            <p>• <strong>ROI saludable:</strong> +100% (tuyo: {numberToFixed(roi)}%)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center text-xs text-slate-500">Hecho con ❤️ para Tacea Music</div>
      </div>
    </div>
  );
}
