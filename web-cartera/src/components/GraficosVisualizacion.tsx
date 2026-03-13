import { useEffect, useState } from "react";
import axios from "axios";
import { CompraInterface } from "../interfaces/CompraInterface";
import { Chart as ChartJS, ArcElement, Tooltip, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Title);

export default function GraficosVisualizacion({ volverAlMenu }: { volverAlMenu: () => void }) {
    const [compras, setCompras] = useState<CompraInterface[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const traerDatos = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/cartera/compras/activas");
                setCompras(res.data);
            } catch (error) {
                console.error("Error trayendo datos:", error);
            } finally {
                setLoading(false);
            }
        };
        traerDatos();
    }, []);

    // --- PROCESAMIENTO DE DATOS ---
    const datosPorTicker: { [key: string]: number } = {};
    const datosPorSector: { [key: string]: number } = {};
    let inversionTotal = 0;

    compras.forEach(c => {
        const inversion = c.cantidad * c.precioUnitario;
        inversionTotal += inversion;
        
        const ticker = c.ticker.toUpperCase();
        const sector = (c.sector || "Otros").toUpperCase();

        datosPorTicker[ticker] = (datosPorTicker[ticker] || 0) + inversion;
        datosPorSector[sector] = (datosPorSector[sector] || 0) + inversion;
    });

    const paletaColores = [
        '#38bdf8', '#fbbf24', '#10b981', '#f87171', '#a78bfa', 
        '#f472b6', '#2dd4bf', '#fb923c', '#e2e8f0', '#6366f1',
        '#fcd34d', '#fda4af', '#5eead4', '#bae6fd', '#c4b5fd',
        '#a3e635', '#f9a8d4', '#4ade80', '#fb7185', '#a5b4fc',
        '#f97316', '#34d399', '#fca5a5', '#c084fc', '#e879f9',
        '#818cf8', '#bef264', '#fecdd3', '#44ad99', '#f8fafc'
    ];

    const generarDataGrafico = (datos: { [key: string]: number }) => {
        const itemsSorted = Object.entries(datos).sort((a, b) => b[1] - a[1]);
        const labels = itemsSorted.map(item => item[0]);
        const values = itemsSorted.map(item => item[1]);
        
        return {
            labels,
            datasets: [{
                data: values,
                backgroundColor: labels.map((_, i) => paletaColores[i % paletaColores.length]),
                borderColor: '#0f172a',
                // ACÁ ESTÁ EL CAMBIO: Lo bajamos de 4 a 1 para que las porciones chicas respiren
                borderWidth: 1, 
                hoverOffset: 30
            }],
        };
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        }
    };

    if (loading) return <div className="text-white text-center mt-40 font-sans text-2xl tracking-[0.3em] animate-pulse uppercase">Analizando Cartera...</div>;

    const LeyendaCustom = ({ datos }: { datos: { [key: string]: number } }) => {
        const itemsSorted = Object.entries(datos).sort((a, b) => b[1] - a[1]);
        
        return (
            <div className="flex flex-col gap-4 w-full max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                {itemsSorted.map(([label, value], index) => {
                    const porcentaje = ((value / inversionTotal) * 100).toFixed(1);
                    return (
                        <div key={label} className="flex items-center justify-between bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 hover:bg-slate-700/40 transition-colors">
                            <div className="flex items-center gap-5">
                                <div 
                                    className="w-5 h-5 rounded-full shadow-lg" 
                                    style={{ backgroundColor: paletaColores[index % paletaColores.length] }}
                                />
                                <span className="font-black text-lg text-slate-100 uppercase tracking-wider">{label}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sky-400 font-black text-2xl">{porcentaje}%</span>
                                <span className="text-sm text-slate-400 font-sans font-bold">
                                    ${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-slate-900 min-h-screen p-10 text-slate-100 w-full flex flex-col items-center">
            
            <h2 className="text-5xl font-black text-sky-400 text-center mb-16 uppercase tracking-[0.2em] font-sans drop-shadow-2xl">
                Dashboard de Composición
            </h2>

            <div className="flex flex-col gap-12 w-full max-w-[1600px]">
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    
                    {/* CARD ACTIVO */}
                    <div className="bg-slate-800/30 p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl backdrop-blur-sm">
                        <h3 className="text-center text-slate-500 text-sm font-black uppercase tracking-[0.4em] mb-12">Peso por Activo</h3>
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="w-full lg:w-1/2 h-[450px]">
                                <Pie data={generarDataGrafico(datosPorTicker)} options={options} />
                            </div>
                            <div className="w-full lg:w-1/2">
                                <LeyendaCustom datos={datosPorTicker} />
                            </div>
                        </div>
                    </div>

                    {/* CARD SECTOR */}
                    <div className="bg-slate-800/30 p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl backdrop-blur-sm">
                        <h3 className="text-center text-slate-500 text-sm font-black uppercase tracking-[0.4em] mb-12">Distribución Sectorial</h3>
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="w-full lg:w-1/2 h-[450px]">
                                <Pie data={generarDataGrafico(datosPorSector)} options={options} />
                            </div>
                            <div className="w-full lg:w-1/2">
                                <LeyendaCustom datos={datosPorSector} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <button 
                onClick={volverAlMenu} 
                className="mt-20 mb-16 bg-sky-600 hover:bg-sky-500 hover:scale-105 px-16 py-5 rounded-2xl text-white text-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-sky-900/40"
            >
                Volver al Menú
            </button>
        </div>
    );
}