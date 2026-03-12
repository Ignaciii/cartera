import { useEffect, useState } from "react"
import axios from "axios"
import Swal from 'sweetalert2';

// Definimos la estructura del DTO que nos manda el Back
interface VentaDTO {
    id?: number;
    ticker: string;
    cantidad: number;
    precioCompra: number;
    precioVenta: number;
    fechaCompra: string;
    fechaVenta: string;
    resultadoNominal: number;
    resultadoPorcentual: number;
}

export default function HistorialVentas({ volverAlMenu }: { volverAlMenu: () => void }) {
  const [ventas, setVentas] = useState<VentaDTO[]>([])
  const [busqueda, setBusqueda] = useState("");

  const traerVentas = async (mostrarAlerta = false) => {
    if (mostrarAlerta) {
      Swal.fire({
        title: 'Contando los billetes...',
        text: 'Buscando el historial de ventas.',
        background: '#1e293b',
        color: '#f1f5f9',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    }

    try {
      // Le pegamos a la ruta nueva de tu VentaController
      const respuesta = await axios.get("http://localhost:8080/api/cartera/ventas");
      setVentas(respuesta.data)
      
      if (mostrarAlerta) {
        Swal.fire({
          icon: 'success',
          title: '¡Historial traído!',
          background: '#1e293b',
          color: '#f1f5f9',
          confirmButtonColor: '#059669',
          timer: 1500
        });
      }
    } catch (error) {
      console.error("Error al traer las ventas:", error);
      if (mostrarAlerta) {
        Swal.fire({
          icon: 'error',
          title: '¡Error de conexión!',
          text: 'No pudimos traer los datos del servidor.',
          background: '#1e293b',
          color: '#f1f5f9',
          confirmButtonColor: '#e11d48'
        });
      }
    }
  }

  useEffect(() => {
    traerVentas(false);
  }, [])
      
  const manejarBusqueda = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(evento.target.value);
  }

  const ventasFiltradas = ventas.filter(
    venta => venta.ticker.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-start pt-10 px-4 w-full">
                                  
      {ventas.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-slate-700 mt-32 rounded-2xl p-12 max-w-lg bg-slate-800/50 shadow-2xl text-center">
          <span className="text-6xl mb-6">🕸️</span>
          <p className="pb-8 text-slate-300 text-lg font-semibold tracking-wide">
            Todavía no reventaste ningún papel, fiera.
          </p> 
          <button 
            onClick={volverAlMenu} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/50 uppercase tracking-widest text-sm"
          >
            Volver al Menú
          </button> 
        </div>
      ) : ( 
        
      <div className="w-full max-w-7xl mx-auto">
      
        <div className="max-w-4xl mx-auto mb-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-4 uppercase tracking-widest text-center">Historial de Ganancias</h2>
            <input 
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-500 text-slate-100 shadow-inner"
                placeholder="Buscar por ticker (AL30, GGAL...)"
                type="text"
                value={busqueda}
                onChange={manejarBusqueda}
            />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-2xl bg-slate-800/30">
        {ventasFiltradas.length === 0 ? (
          <p className="text-center p-8 text-slate-400 font-semibold tracking-wide">
            No se encontraron coincidencias para tu búsqueda.
          </p> 
        ) : (
          <table className="w-full text-sm text-left text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-800 text-emerald-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-5">Ticker</th>
                <th className="px-6 py-5 text-center">Cant.</th>
                <th className="px-6 py-5 text-right">P. Compra</th>
                <th className="px-6 py-5 text-right">P. Venta</th>
                <th className="px-6 py-5 text-center">F. Compra</th>
                <th className="px-6 py-5 text-center">F. Venta</th>
                <th className="px-6 py-5 text-center">Ganancia (%)</th>
                <th className="px-6 py-5 text-right">Ganancia ($)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/50">
              {ventasFiltradas.map((v, index) => (
                <tr key={v.id || index} className="hover:bg-slate-700/30 transition-colors duration-200">
                  <td className="px-6 py-4 font-bold text-emerald-400">{v.ticker.toUpperCase()}</td>
                  <td className="px-6 py-4 text-center font-medium">{v.cantidad}</td>
                  <td className="px-6 py-4 text-right">${v.precioCompra?.toLocaleString() || '0'}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-100">${v.precioVenta?.toLocaleString() || '0'}</td>
                  <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium">{v.fechaCompra}</td>
                  <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium">{v.fechaVenta}</td>
                
                  {/* Formato condicional para verde/rojo según si ganaste o perdiste */}
                  <td className={`px-6 py-4 text-center font-bold ${v.resultadoPorcentual >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {v.resultadoPorcentual >= 0 ? '+' : ''}{v.resultadoPorcentual?.toFixed(2)}%
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${v.resultadoNominal >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {v.resultadoNominal >= 0 ? '+' : ''}${v.resultadoNominal?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody> 
          </table>
        )}
        </div>

        <div className="flex justify-center gap-6 mt-10 mb-10">
          <button 
            onClick={volverAlMenu} 
            className="bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 px-8 py-3 rounded-xl text-slate-200 font-bold transition-all active:scale-95 shadow-lg shadow-slate-900/50"
          >
            Volver al Menú
          </button>
          <button 
            onClick={() => traerVentas(true)} 
            className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl shadow-lg shadow-emerald-900/50 duration-300 border border-emerald-500/50 transition-all active:scale-95 text-white font-bold tracking-wide"
          >
            Actualizar Historial
          </button>
        </div> 
      
      </div>
      )}
    </div>
  )
}