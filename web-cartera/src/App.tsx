import { useState } from 'react';
import HistorialCompras from './components/HistorialCompras';
import HistorialDeVentas from './components/HistorialDeVentas'; 
import FormularioDeCompra from './components/FormularioDeCompra';
import FormularioDeVenta from './components/FormularioDeVenta';
import GraficosVisualizacion from './components/GraficosVisualizacion'; // <-- IMPORTAMOS EL NUEVO

function App() {
  const [pantallaActual, setPantallaActual] = useState('menu');

  return (
    <div className="bg-slate-900 min-h-screen font-serif text-slate-100">
      
      {pantallaActual === 'menu' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl text-blue-500 mb-10 tracking-widest animate-pulse">AppCartera</h1>
          <div className="flex flex-col gap-4 w-72">
            
            <button 
              onClick={() => setPantallaActual('nueva_compra')}
             className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-xl shadow-emerald-900/30">
              Cargar Nueva Compra
            </button>

            <button 
              onClick={() => setPantallaActual('nueva_venta')}
             className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-xl shadow-emerald-900/30">
              Registrar Venta
            </button>

            <button 
              onClick={() => setPantallaActual('historial')}
              className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-xl shadow-emerald-900/30"
            >
              Ver Cartera Activa
            </button>

            <button 
              onClick={() => setPantallaActual('historial_ventas')}
              className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-xl shadow-emerald-900/30">
              Historial de Ganancias
            </button>

            {/* NUEVO: Botón de Análisis Gráfico */}
            <button 
              onClick={() => setPantallaActual('graficos')}
              className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-xl shadow-emerald-900/30"
            >
              📊 Análisis de Cartera
            </button>
          </div>
        </div>
      )}

      {pantallaActual === 'nueva_compra' && (
        <div className="pt-10 max-w-6xl mx-auto px-4">
          <FormularioDeCompra volverAlMenu={() => setPantallaActual('menu')} />
        </div>
      )}

      {pantallaActual === 'nueva_venta' && (
        <div className="pt-10 max-w-6xl mx-auto px-4">
          <FormularioDeVenta volverAlMenu={() => setPantallaActual('menu')} />
        </div>
      )}

      {pantallaActual === 'historial' && (
        <HistorialCompras volverAlMenu={() => setPantallaActual('menu')} />
      )}

      {pantallaActual === 'historial_ventas' && (
        <HistorialDeVentas volverAlMenu={() => setPantallaActual('menu')} />
      )}

      {/* NUEVO: Renderizamos los gráficos */}
      {pantallaActual === 'graficos' && (
        <GraficosVisualizacion volverAlMenu={() => setPantallaActual('menu')} />
      )}

    </div>
  );
}

export default App;