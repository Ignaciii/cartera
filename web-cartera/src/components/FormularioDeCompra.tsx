import React, { useState } from 'react';
import axios from 'axios';

const FormularioDeCompra = ({ onCompraCargada }: { onCompraCargada: () => void }) => {
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
            // Ejecutamos la función que viene por props para avisar al padre
            onCompraCargada();
            alert("¡Adentro! Compra cargada con éxito 🚀");
        } catch (error) {
            console.error("Error al cargar:", error);
            alert("El Back te sacó carpiendo, revisá la consola.");
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl mb-10">
            <h3 className="text-sky-400 font-bold mb-4 uppercase text-sm tracking-widest">Nueva Operación</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
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
                <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded transition-all active:scale-95 shadow-lg shadow-sky-900/20">
                    CARGAR
                </button>
            </form>
        </div>
    );
};

export default FormularioDeCompra;