import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FormularioDeVenta = ({ volverAlMenu }: { volverAlMenu: () => void }) => {
    
    // Estado inicial afuera para poder resetear
    const estadoInicial = {
        ticker: '',
        cantidad: 0,
        precioVenta: 0, 
        fechaVenta: new Date().toISOString().split('T')[0],
    };

    const [venta, setVenta] = useState(estadoInicial);
    
    // NUEVO: Estado para guardar lo que tenemos en cartera
    const [cartera, setCartera] = useState<{ ticker: string, cantidad: number }[]>([]);

    // NUEVO: Traemos la cartera apenas carga el componente
    useEffect(() => {
        const traerCartera = async () => {
            try {
                // Le pegamos al endpoint que ya tenés armado para las compras activas
                const respuesta = await axios.get('http://localhost:8080/api/cartera/compras/activas');
                
                // Agrupamos las cantidades por ticker (por si compraste el mismo varias veces)
                const carteraAgrupada: { [key: string]: number } = {};
                
                respuesta.data.forEach((compra: any) => {
                    const t = compra.ticker.toUpperCase();
                    if (carteraAgrupada[t]) {
                        carteraAgrupada[t] += compra.cantidad;
                    } else {
                        carteraAgrupada[t] = compra.cantidad;
                    }
                });

                // Convertimos el objeto en un array para poder mapearlo fácil en el HTML
                const carteraArray = Object.keys(carteraAgrupada).map(ticker => ({
                    ticker: ticker,
                    cantidad: carteraAgrupada[ticker]
                }));

                setCartera(carteraArray);
                
            } catch (error) {
                console.error("Error al traer la cartera disponible:", error);
            }
        };

        traerCartera();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        let valorFinal: string | number = value;

        if (type === 'number') {
            const numero = parseFloat(value);
            if (numero < 0) valorFinal = 0;
        }

        setVenta({ ...venta, [name]: valorFinal });
    };

    // NUEVO: Función para autocompletar cuando hacés clic en la listita
    const seleccionarTicker = (tickerElegido: string, cantidadDisponible: number) => {
        setVenta({
            ...venta,
            ticker: tickerElegido,
            cantidad: cantidadDisponible // Te precarga el máximo por comodidad
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const totalARecibir = venta.cantidad * venta.precioVenta;

        const resultado = await Swal.fire({
            title: '¿Confirmar Orden de Venta?',
            html: `
                <div class="text-left text-slate-200 mt-4">
                    <p class="mb-2">Vas a liquidar <b class="text-sky-400 font-sans">${venta.cantidad}</b> nominales de <b class="text-sky-400 font-sans">${venta.ticker.toUpperCase()}</b>.</p>
                    <p class="mb-4">Precio pactado: <b class="text-emerald-400 font-sans">$${venta.precioVenta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> c/u</p>
                    
                    <div class="border-t border-slate-700 pt-4 mt-4 text-center">
                        <p class="text-sm text-slate-400 uppercase tracking-widest mb-1">Monto total a recibir</p>
                        <h3 class="text-3xl font-bold text-emerald-400 font-sans">$${totalARecibir.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                </div>
            `,
            background: '#1e293b',
            color: '#f1f5f9',
            showCancelButton: true,
            confirmButtonColor: '#059669', 
            cancelButtonColor: '#e11d48',  
            confirmButtonText: 'Sí, ejecutar venta',
            cancelButtonText: 'Cancelar',
            reverseButtons: true 
        });

        if (resultado.isConfirmed) {
            try {
                await axios.post('http://localhost:8080/api/cartera/ventas', venta);
                
                setVenta(estadoInicial);
                
                // NUEVO: Actualizamos la listita del costado sin tener que recargar la página entera
                setCartera(cartera.map(item => {
                    if(item.ticker === venta.ticker.toUpperCase()){
                        return { ...item, cantidad: item.cantidad - venta.cantidad }
                    }
                    return item;
                }).filter(item => item.cantidad > 0)); // Borramos los que quedaron en 0

                Swal.fire({
                    title: '¡Caja!',
                    text: 'La venta se registró joya 💸',
                    icon: 'success',
                    background: '#1e293b',
                    color: '#f1f5f9',
                    confirmButtonColor: '#059669' 
                });
                
            } catch (error) {
                console.error("Error al cargar la venta:", error);
                Swal.fire({
                    title: '¡Epa!',
                    text: 'No se pudo registrar la venta. ¿Revisaste el Backend?',
                    icon: 'error',
                    background: '#1e293b',
                    color: '#f1f5f9',
                    confirmButtonColor: '#e11d48' 
                });
            }
        }
    };

    return (
        // Envolvemos todo en un flex para poner el formulario y la listita lado a lado
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-start w-full max-w-6xl mx-auto">
            
            {/* EL FORMULARIO ORIGINAL (ahora ocupa un poco más de espacio en compus grandes) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-emerald-900/50 shadow-xl relative overflow-hidden flex-grow w-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <h3 className="text-emerald-400 font-bold mb-4 uppercase text-sm tracking-widest">Registrar Venta</h3>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase">Ticker a Vender</label>
                        <input 
                            name="ticker" 
                            value={venta.ticker}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none font-sans uppercase" 
                            onChange={handleChange} 
                            placeholder="AL30" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase">Cantidad</label>
                        <input 
                            name="cantidad" 
                            type="number" 
                            value={venta.cantidad === 0 ? '' : venta.cantidad}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none font-sans" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase">Precio Unitario de Venta</label>
                        <input 
                            name="precioVenta" 
                            type="number" 
                            step="0.01" 
                            value={venta.precioVenta === 0 ? '' : venta.precioVenta}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none font-sans" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase">Fecha</label>
                        <input 
                            name="fechaVenta" 
                            type="date" 
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none font-sans" 
                            value={venta.fechaVenta} 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex gap-4 mt-4">
                        <button type="button" onClick={volverAlMenu} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded transition-all active:scale-95 border border-slate-600">
                            VOLVER
                        </button>
                        
                        <button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                            VENDER
                        </button>
                    </div>
                </form>
            </div>

            {/* NUEVO: LA BILLETERA LATERAL */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-xl w-full md:w-80 flex-shrink-0">
                <h3 className="text-slate-300 font-bold mb-3 uppercase text-xs tracking-widest text-center border-b border-slate-700 pb-2">Disponible en Cartera</h3>
                
                {cartera.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4 italic">No hay activos para vender</p>
                ) : (
                    <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {cartera.map((item, index) => (
                            <div 
                                key={index} 
                                onClick={() => seleccionarTicker(item.ticker, item.cantidad)}
                                className="flex justify-between items-center bg-slate-900/50 p-2 mb-2 rounded border border-slate-700/50 hover:bg-emerald-900/20 hover:border-emerald-500/30 cursor-pointer transition-colors group"
                            >
                                <span className="font-bold text-sky-400 group-hover:text-emerald-400 transition-colors">{item.ticker}</span>
                                <span className="text-slate-300 font-sans text-sm">{item.cantidad} un.</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default FormularioDeVenta;