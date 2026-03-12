import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // <-- Importamos el rey de las alertas

const FormularioDeCompra = ({ volverAlMenu }: { volverAlMenu: () => void }) => {
    // ... (tu estado compra y el handleChange quedan igualitos) ...
    const [compra, setCompra] = useState({
        ticker: '',
        cantidad: 0,
        precioUnitario: 0,
        familia: 'ACCION',
        sector: '',
        fechaCompra: new Date().toISOString().split('T')[0],
        estado: 'EN_CURSO'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCompra({ ...compra, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/cartera', compra);
            
            // LA ALERTA FACHERA DE ÉXITO
            Swal.fire({
                title: '¡Adentro!',
                text: 'La compra se guardó joya 🚀',
                icon: 'success',
                background: '#1e293b', // Color slate-800
                color: '#f1f5f9',      // Color slate-100
                confirmButtonColor: '#0284c7' // Color sky-600
            });
            
        } catch (error) {
            console.error("Error al cargar:", error);
            // LA ALERTA DE TERROR
            Swal.fire({
                title: '¡Epa!',
                text: 'El Back te sacó carpiendo. Revisá la consola.',
                icon: 'error',
                background: '#1e293b',
                color: '#f1f5f9',
                confirmButtonColor: '#e11d48' // Color rose-600
            });
        }
    };
    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl mb-10">
            <h3 className="text-sky-400 font-bold mb-4 uppercase text-sm tracking-widest">Nueva Operación</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Ticker</label>
                    <input name="ticker" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" onChange={handleChange} placeholder="YPFD" required />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Sector</label>
                    <input name="sector" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" onChange={handleChange} placeholder="Energía" required />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Cantidad</label>
                    <input name="cantidad" type="number" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Precio U.</label>
                    <input name="precioUnitario" type="number" step="0.01" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Fecha</label>
                    <input name="fechaCompra" type="date" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" value={compra.fechaCompra} onChange={handleChange} />
                </div>
                
                {/* Botón Volver (Punto 7) */}
                <button type="button" onClick={volverAlMenu} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded transition-all active:scale-95 border border-slate-600">
                    VOLVER
                </button>
                
                <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded transition-all active:scale-95 shadow-lg shadow-sky-900/20">
                    CARGAR
                </button>
            </form>
        </div>
    );
};

export default FormularioDeCompra;