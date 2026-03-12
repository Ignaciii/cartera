import { useEffect, useState } from "react"
import { CompraInterface } from "../interfaces/CompraInterface"
import axios from "axios"
import Swal from 'sweetalert2'; 

export default function HistorialCompras({ volverAlMenu }: { volverAlMenu: () => void }) {
  const [compras, setCompras] = useState<CompraInterface[]>([])
  const [busqueda, setBusqueda] = useState("");

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
      // ACÁ ESTÁ EL CAMBIO PARA FORZAR LA ACTUALIZACIÓN
      const url = mostrarAlerta 
            ? "http://localhost:8080/api/cartera/compras/activas?forzar=true" 
            : "http://localhost:8080/api/cartera/compras/activas";

      const comprasGuardadas = await axios.get(url);
      setCompras(comprasGuardadas.data);
      
      if (mostrarAlerta) {
        Swal.fire({
          icon: 'success',
          title: '¡Cartera al día!',
          text: 'Los precios están re fresquitos.',
          background: '#1e293b',
          color: '#f1f5f9',
          confirmButtonColor: '#0284c7',
          timer: 1500 
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

  // LÓGICA PARA EDITAR CON DOBLE CONFIRMACIÓN
  const manejarEditar = async (compra: CompraInterface) => {
    // 1. PRIMER POPUP: Captura de datos
    const { value: formValues } = await Swal.fire({
        title: `Editar ${compra.ticker.toUpperCase()}`,
        background: '#1e293b',
        color: '#f1f5f9',
        html:
            `<div class="text-left px-4">` +
            `<label class="block text-xs text-slate-400 mb-1 uppercase font-bold">Cantidad</label>` +
            `<input id="swal-input1" class="swal2-input !m-0 !w-full bg-slate-800 border-slate-700 text-white" value="${compra.cantidad}">` +
            `<label class="block text-xs text-slate-400 mt-4 mb-1 uppercase font-bold">Precio Unitario</label>` +
            `<input id="swal-input2" class="swal2-input !m-0 !w-full bg-slate-800 border-slate-700 text-white" value="${compra.precioUnitario}">` +
            `<label class="block text-xs text-slate-400 mt-4 mb-1 uppercase font-bold">Sector</label>` +
            `<input id="swal-input3" class="swal2-input !m-0 !w-full bg-slate-800 border-slate-700 text-white" value="${compra.sector}">` +
            `</div>`,
        focusConfirm: false,
        confirmButtonColor: '#0284c7',
        confirmButtonText: 'Siguiente',
        showCancelButton: true,
        cancelButtonColor: '#475569',
        preConfirm: () => {
            return {
                ...compra,
                cantidad: parseFloat((document.getElementById('swal-input1') as HTMLInputElement).value),
                precioUnitario: parseFloat((document.getElementById('swal-input2') as HTMLInputElement).value),
                sector: (document.getElementById('swal-input3') as HTMLInputElement).value
            }
        }
    });

    // 2. SEGUNDO POPUP: Confirmación final
    if (formValues) {
        const resultadoConfirmacion = await Swal.fire({
            title: '¿Confirmar cambios?',
            text: `Vas a actualizar ${compra.ticker}. ¿Estás seguro?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669', // emerald-600
            cancelButtonColor: '#e11d48', // rose-600
            confirmButtonText: 'Sí, aplicar cambios',
            cancelButtonText: 'No, cancelar',
            background: '#1e293b',
            color: '#f1f5f9',
        });

        // 3. EJECUCIÓN: Solo si el usuario confirmó el segundo cartel
        if (resultadoConfirmacion.isConfirmed) {
            try {
                await axios.put(`http://localhost:8080/api/cartera/compras/${compra.operacion}`, formValues);
                Swal.fire({ 
                    icon: 'success', 
                    title: '¡Actualizado!', 
                    background: '#1e293b', 
                    color: '#f1f5f9', 
                    timer: 1000, 
                    showConfirmButton: false 
                });
                traerCompras(false); 
            } catch (error) {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Error al editar', 
                    text: 'El servidor no aceptó los cambios.',
                    background: '#1e293b', 
                    color: '#f1f5f9' 
                });
            }
        }
    }
  }

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

  const totalInvertidoNominal = compras.reduce((acc, p) => acc + (p.cantidad * p.precioUnitario), 0);
  const totalValuacionActual = compras.reduce((acc, p) => acc + (p.cantidad * p.valorDeMercado), 0);
  const totalGananciaReal = compras.reduce((acc, p) => acc + p.resultadoRealNominal, 0);

  return (
    <div className="bg-slate-900 min-h-screen justify-items-center mx-auto overflow-hidden" >
                                  
      {compras.length == 0 ? (
          <div className="grid justify-items border-4 border-blue-800/50 mt-60 rounded-xl p-10 " >
            <p className="pb-4 text-slate-100">Parece que no hay compras en curso che</p> 
            <button onClick={volverAlMenu} className="mx-auto py-2 px-4 ease-out rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 active:scale-85 hover:opacity-100 duration-400 text-white font-bold">
              Volver
            </button> 
          </div>
        )
        : ( 
      <div className="bg-slate-900 min-h-screen p-8 text-slate-100 w-full">
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto w-full">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-bold">Inversión Inicial</p>
                <h3 className="text-2xl font-bold text-slate-100">${totalInvertidoNominal.toLocaleString()}</h3>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-bold">Valuación a Mercado</p>
                <h3 className="text-2xl font-bold text-sky-400">${totalValuacionActual.toLocaleString()}</h3>
            </div>
            <div className={`bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl ${totalGananciaReal >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-bold">Ganancia Real (Fisher)</p>
                <h3 className={`text-2xl font-bold ${totalGananciaReal >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {totalGananciaReal >= 0 ? '+' : ''}${totalGananciaReal.toLocaleString()}
                </h3>
            </div>
        </div>

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

            <tbody className="divide-y divide-slate-800">
              {comprasFiltradas.map((p) => (
                <tr key={p.operacion} className="bg-slate-900 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sky-400 text-[10px] uppercase leading-tight">{p.sector}</td>
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
                    <button 
                      onClick={() => manejarEditar(p)}
                      className="bg-sky-600 hover:bg-emerald-600 text-white text-xs font-bold py-1 px-4 rounded-md transition-transform active:scale-110"
                    >
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