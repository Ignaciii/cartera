import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FormularioDeVenta = ({ volverAlMenu }: { volverAlMenu: () => void }) => {
    const [venta, setVenta] = useState({
        ticker: '',
        cantidad: 0,
        precioUnitario: 0, // Precio al que vendiste
        fechaVenta: new Date().toISOString().split('T')[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setVenta({ ...venta, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // OJO ACÁ: Pongo un endpoint imaginario, tenés que ajustarlo a cómo lo armaste en Spring Boot
            await axios.post('http://localhost:8080/api/cartera/venta', venta);
            
            Swal.fire({
                title: '¡Caja!',
                text: 'La venta se registró joya 💸',
                icon: 'success',
                background: '#1e293b',
                color: '#f1f5f9',
                confirmButtonColor: '#059669' // Color emerald-600
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
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-emerald-900/50 shadow-xl mb-10 relative overflow-hidden">
            {/* Un brillito verde de fondo para darle onda */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <h3 className="text-emerald-400 font-bold mb-4 uppercase text-sm tracking-widest">Registrar Venta</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end relative z-10">
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Ticker a Vender</label>
                    <input name="ticker" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none" onChange={handleChange} placeholder="AL30" required />
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Cantidad</label>
                    <input name="cantidad" type="number" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none" onChange={handleChange} required />
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Precio de Venta</label>
                    <input name="precioUnitario" type="number" step="0.01" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none" onChange={handleChange} required />
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Fecha</label>
                    <input name="fechaVenta" type="date" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none" value={venta.fechaVenta} onChange={handleChange} />
                </div>
                
                <button type="button" onClick={volverAlMenu} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded transition-all active:scale-95 border border-slate-600">
                    VOLVER
                </button>
                
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                    VENDER
                </button>
            </form>
        </div>
    );
};

export default FormularioDeVenta;