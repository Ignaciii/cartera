import {  useEffect, useState } from "react"
import { CompraInterface } from "../interfaces/CompraInterface"
import axios from "axios"

export default function HistorialCompras() {
  const [compras, setCompras] = useState<CompraInterface[]>([])
  const [busqueda, setBusqueda] = useState("");

  

  useEffect(() => {
    const guardarCompras = async () => {
      try {
        const comprasGuardadas = await axios.get("http://localhost:8080/api/cartera/activas");
        setCompras(comprasGuardadas.data)


      } catch (error) {
        console.error("Error al traer los datos:", error);
      }
    }
    guardarCompras();
  }, [])
     
  
const manejarBusqueda = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(evento.target.value);
  }

const comprasFiltradas = compras.filter(
  compra=> {
    return compra.ticker.toLowerCase().includes(busqueda.toLowerCase()) || compra.familia.toLowerCase().includes(busqueda.toLowerCase())
  }
)





  return (
     
    <div className="bg-slate-900 min-h-screen justify-items-center  mx-auto overflow-hidden" >
                              
      {compras.length == 0? (
        
          <div className="grid justify-items border-4 border-blue-800/50 mt-60 rounded-xl p-10 " >
            <p className="pb-4 text-slate-100">Parece que no hay compras en curso che</p> 
            
              <button className="mx-auto py-2 px-4 ease-out rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 active:scale-85 hover:opacity-100 duration-400">Volver</button> 
           
          </div>
        
        
        )
        : ( 
      <div className="bg-slate-900 min-h-screen p-8 text-slate-100">
      
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
        {comprasFiltradas.length == 0 ? <p className="text">Parece que no hay coincidencias che</p> :  
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
                <th className="px-5">Resultado (%)</th>
                <th className="px-5">Resultado ($)</th>
                <th className="px-5 py-4 text-center">Acciones</th>
              </tr>
            </thead>

            {/* 5. Cuerpo con filas alternas */}
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

        <div className="flex justify-center mt-8">
          <button className="bg-sky-500 px-6 py-2 rounded-lg shadow-lg shadow-blue-600/50 duration-500 border border-slate-700 transition-all active:scale-80">
            Actualizar Cartera
          </button>
        </div> 
      
    </div>)}</div>
  )
}