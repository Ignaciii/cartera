import { useEffect, useState } from "react"
import { CompraInterface } from "../interfaces/CompraInterface"
import axios from "axios"
import Swal from 'sweetalert2'; // <-- Adentro SweetAlert

export default function HistorialCompras({ volverAlMenu }: { volverAlMenu: () => void }) {
  const [compras, setCompras] = useState<CompraInterface[]>([])
  const [busqueda, setBusqueda] = useState("");

  // Separamos la lógica de ir a buscar al Back en esta función
  const traerCompras = async (mostrarAlerta = false) => {
    if (mostrarAlerta) {
      Swal.fire({
        title: 'Actualizando mercado...',
        text: 'Bancame un cachito, estoy llamando a los brokers.',
        background: '#1e293b',
        color: '#f1f5f9',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    }

    try {
      const comprasGuardadas = await axios.get("http://localhost:8080/api/cartera/compras/activas");
      setCompras(comprasGuardadas.data);
      
      if (mostrarAlerta) {
        Swal.fire({
          icon: 'success',
          title: '¡Cartera al día!',
          text: 'Los precios están re fresquitos.',
          background: '#1e293b',
          color: '#f1f5f9',
          confirmButtonColor: '#0284c7',
          timer: 1500 // Se cierra solo al segundo y medio
        });
      }
    } catch (error) {
      console.error("Error al traer los datos:", error);
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

  // Cuando carga el componente por primera vez, llama sin alerta
  useEffect(() => {
    traerCompras(false);
  }, [])
      
  const manejarBusqueda = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(evento.target.value);
  }

  const comprasFiltradas = compras.filter(
    compra => {
      return compra.ticker.toLowerCase().includes(busqueda.toLowerCase()) || compra.familia.toLowerCase().includes(busqueda.toLowerCase())
    }
  )

  return (
    <div className="bg-slate-900 min-h-screen justify-items-center mx-auto overflow-hidden" >
                                  
      {compras.length == 0 ? (
          <div className="grid justify-items border-4 border-blue-800/50 mt-60 rounded-xl p-10 " >
            <p className="pb-4 text-slate-100">Parece que no hay compras en curso che</p> 
            {/* Le enchufamos la función al botón Volver */}
            <button onClick={volverAlMenu} className="mx-auto py-2 px-4 ease-out rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 active:scale-85 hover:opacity-100 duration-400 text-white font-bold">
              Volver
            </button> 
          </div>
        )
        : ( 
      <div className="bg-slate-900 min-h-screen p-8 text-slate-100 w-full">
      
        <div className="max-w-4xl mx-auto mb-8">
          <input 
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-500"
            placeholder="Buscar activo (AL30, GGAL...)"
            type="text"
            name="search"
            value={busqueda}
            onChange={manejarBusqueda}
          />
        </div>

        <div className="max-w-6xl mx-auto overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
        {comprasFiltradas.length == 0 ? <p className="text-center p-4">Parece que no hay coincidencias che</p> :  
          <table className="w-full text-sm text-left">
            
            <thead className="bg-sky-900 text-sky-100 uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-4">Sector</th>
                <th className="px-5 py-4">Ticker</th>
                <th className="px-5 py-4">Familia</th>
                <th className="px-5 py-4 text-center">Cant.</th>
                <th className="px-5 py-4 text-right">Precio U.</th>
                <th className="px-5 py-4 text-center">Total</th>
                <th className="px-5 py-4 text-center">Fecha</th>
                <th className="px-5 py-4 text-center">Inflacion</th>
                <th className="px-5 py-4 text-center">Resultado (%)</th>
                <th className="px-5 py-4 text-center">Resultado ($)</th>
                <th className="px-5 py-4 text-center">Acciones</th>
              </tr>
            </thead>

            {/* Cuerpo con filas alternas */}
            <tbody className="divide-y divide-slate-800">
              {comprasFiltradas.map((p) => (
                <tr key={p.operacion} className="bg-slate-900 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sky-400">{p.sector.toLocaleUpperCase()}</td>
                  <td className="px-6 py-4 font-bold text-sky-400">{p.ticker.toLocaleUpperCase()}</td>
                  <td className="px-6 py-4 text-slate-400">{p.familia.toLocaleUpperCase()}</td>
                  <td className="px-6 py-4 text-center">{p.cantidad}</td>
                  <td className="px-6 py-4 text-right">${p.precioUnitario.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                    ${(p.cantidad * p.precioUnitario).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-slate-500">{p.fechaCompra}</td>
                  <td className="text-center font-semibold">{p.inflacionAcumulada.toFixed(2)}%</td>
                
                  <td className={`text-center font-bold ${p.resultadoRealPorcentaje >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {p.resultadoRealPorcentaje.toFixed(2)}%
                  </td>
                  <td className={`px-6 text-right font-bold ${p.resultadoRealNominal >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      ${p.resultadoRealNominal.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button className="bg-sky-600 hover:bg-emerald-600 text-white text-xs font-bold py-1 px-4 rounded-md transition-transform active:scale-110">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody> 
          </table>}
        </div>

        <div className="flex justify-center gap-6 mt-10 mb-10">
          <button 
            onClick={volverAlMenu} 
            className="bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 px-8 py-3 rounded-xl text-slate-200 font-bold transition-all active:scale-95 shadow-lg shadow-slate-900/50"
          >
            Volver al Menú
          </button>
          
          {/* ¡Le enchufamos la función con true para que muestre la alerta! */}
          <button 
            onClick={() => traerCompras(true)} 
            className="bg-sky-600 hover:bg-sky-500 px-8 py-3 rounded-xl shadow-lg shadow-sky-900/50 duration-300 border border-sky-500/50 transition-all active:scale-95 text-white font-bold tracking-wide"
          >
            Actualizar Cartera
          </button>
        </div>
      
      </div>)}
    </div>
  )
}