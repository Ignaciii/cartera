import { useState } from 'react';
import HistorialCompras from './components/HistorialCompras';
import HistorialDeVentas from './components/HistorialDeVentas'; // <-- El nuevo chiche
import FormularioDeCompra from './components/FormularioDeCompra';
import FormularioDeVenta from './components/FormularioDeVenta';

function App() {
  const [pantallaActual, setPantallaActual] = useState('menu');

  return (
    <div className="bg-slate-900 min-h-screen font-sans text-slate-100">
      
      {pantallaActual === 'menu' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold text-sky-400 mb-10 tracking-widest uppercase">appCartera</h1>
          <div className="flex flex-col gap-4 w-72">
            
            <button 
              onClick={() => setPantallaActual('nueva_compra')}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-900/20"
            >
              Cargar Nueva Compra
            </button>

            <button 
              onClick={() => setPantallaActual('nueva_venta')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
            >
              Registrar Venta
            </button>

            <button 
              onClick={() => setPantallaActual('historial')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/20"
            >
              Ver Cartera Activa
            </button>

            {/* NUEVO: Botón de Historial de Ventas */}
            <button 
              onClick={() => setPantallaActual('historial_ventas')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/20"
            >
              Historial de Ganancias
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

      {/* NUEVO: Renderizamos el componente de ventas */}
      {pantallaActual === 'historial_ventas' && (
        <HistorialDeVentas volverAlMenu={() => setPantallaActual('menu')} />
      )}

    </div>
  );
}

export default App;