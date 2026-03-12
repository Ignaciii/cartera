import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 

const FormularioDeCompra = ({ volverAlMenu }: { volverAlMenu: () => void }) => {
    
    const [compra, setCompra] = useState({
        ticker: '',
        cantidad: 0,
        precioUnitario: 0,
        familia: 'ACCION',
        sector: '',
        fechaCompra: new Date().toISOString().split('T')[0],
        estado: 'EN_CURSO'
    });

    // ESTADO NUEVO: Para guardar la lista de sectores únicos
    const [sectoresGuardados, setSectoresGuardados] = useState<string[]>([]);

    // EFECTO NUEVO: Traemos las compras al cargar la pantalla y sacamos los sectores
    useEffect(() => {
        const traerSectores = async () => {
            try {
                const respuesta = await axios.get('http://localhost:8080/api/cartera/compras/activas');
                // Extraemos los sectores y usamos Set para eliminar los repetidos
                const sectoresUnicos = [...new Set(respuesta.data.map((c: any) => c.sector))];
                setSectoresGuardados(sectoresUnicos as string[]);
            } catch (error) {
                console.error("Error al traer sectores para el autocompletado:", error);
            }
        };
        traerSectores();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCompra({ ...compra, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/cartera/compras', compra);
            
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
                text: 'El Back te sacó carpiendo. Revisá la consola.',
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
                    <input name="ticker" className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" onChange={handleChange} placeholder="YPFD" required />
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

                {/* ACÁ ENTRA LA MAGIA DEL DATALIST PARA EL SECTOR */}
                <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">Sector</label>
                    <input 
                        name="sector" 
                        list="lista-sectores" // Conecta el input con el datalist de abajo
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none" 
                        onChange={handleChange} 
                        placeholder="Energía, Banco..." 
                        required 
                        autoComplete="off" // Apagamos el historial del navegador para que no moleste
                    />
                    <datalist id="lista-sectores">
                        {sectoresGuardados.map((sector, index) => (
                            <option key={index} value={sector} />
                        ))}
                    </datalist>
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