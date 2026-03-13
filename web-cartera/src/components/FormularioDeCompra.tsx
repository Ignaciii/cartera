import React, { useState} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 

const FormularioDeCompra = ({ volverAlMenu }: { volverAlMenu: () => void }) => {
    
    // 1. Definimos el estado inicial
    const estadoInicial = {
        ticker: '',
        cantidad: 0,
        precioUnitario: 0,
        familia: 'ACCION',
        sector: '', // Arranca vacío
        fechaCompra: new Date().toISOString().split('T')[0],
        estado: 'EN_CURSO'
    };

    const [compra, setCompra] = useState(estadoInicial);

    // Las validaciones siguen firmes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let valorFinal: string | number = value;

        if (type === 'number') {
            const numero = parseFloat(value);
            if (numero < 0) {
                valorFinal = 0;
            }
        }

        // Si es el Sector, aunque sea select, mantenemos la limpieza por las dudas
        if (name === 'sector') {
            valorFinal = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        }

        setCompra({ ...compra, [name]: valorFinal });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Salvaguarda: que no mande el sector vacío
        if (!compra.sector) {
            Swal.fire({
                icon: 'warning',
                title: '¡Falta el sector!',
                text: 'Elegí un sector para que los colores se vean bien después.',
                background: '#1e293b',
                color: '#f1f5f9'
            });
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/cartera/compras', compra);
            setCompra(estadoInicial);

            Swal.fire({
                title: '¡Adentro!',
                text: 'La compra se guardó joya 🚀',
                icon: 'success',
                background: '#1e293b', 
                color: '#f1f5f9',      
                confirmButtonColor: '#0284c7' 
            });
            
        } catch (error) {
            console.error("Error al cargar:", error);
            Swal.fire({
                title: '¡Epa!',
                text: 'Hubo un drama con el servidor.',
                icon: 'error',
                background: '#1e293b',
                color: '#f1f5f9',
                confirmButtonColor: '#e11d48' 
            });
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl mb-10">
            <h3 className="text-sky-400 font-bold mb-4 uppercase text-sm tracking-widest">Nueva Operación</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Ticker</label>
                    <input 
                        name="ticker" 
                        value={compra.ticker} 
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" 
                        onChange={handleChange} 
                        placeholder="YPFD" 
                        required 
                    />
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Familia</label>
                    <select 
                        name="familia" 
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" 
                        value={compra.familia}
                        onChange={handleChange}
                    >
                        <option value="ACCION">Acción</option>
                        <option value="BONO">Bono</option>
                        <option value="CEDEAR">Cedear</option>
                        <option value="ON">ON</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Sector</label>
                    {/* ACÁ ESTÁ EL SELECTOR QUE QUERÍAS */}
                    <select 
                        name="sector" 
                        value={compra.sector} 
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer" 
                        onChange={handleChange} 
                        required 
                    >
                        <option value="" disabled>Seleccionar sector...</option>
                        <option value="Energía">Energía / Oil & Gas</option>
                        <option value="Banco">Bancos / Finanzas</option>
                        <option value="Agro">Agro</option>
                        <option value="Construcción">Construcción</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Bono Soberano">Bono Soberano</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Cantidad</label>
                    <input 
                        name="cantidad" 
                        type="number" 
                        value={compra.cantidad === 0 ? '' : compra.cantidad} 
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Precio U.</label>
                    <input 
                        name="precioUnitario" 
                        type="number" 
                        step="0.01" 
                        value={compra.precioUnitario === 0 ? '' : compra.precioUnitario} 
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Fecha</label>
                    <input 
                        name="fechaCompra" 
                        type="date" 
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" 
                        value={compra.fechaCompra} 
                        onChange={handleChange} 
                    />
                </div>
                
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