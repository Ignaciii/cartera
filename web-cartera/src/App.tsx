import { useState } from 'react';
import HistorialCompras from './components/HistorialCompras';
import HistorialDeVentas from './components/HistorialDeVentas'; // <-- El nuevo chiche
import FormularioDeCompra from './components/FormularioDeCompra';
import FormularioDeVenta from './components/FormularioDeVenta';

function App() {
  const [pantallaActual, setPantallaActual] = useState('menu');

  return (
    <div className="bg-slate-900 min-h-screen font-serif text-slate-100">
      
      {pantallaActual === 'menu' && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl  text-sky-400 mb-10 tracking-widest ">AppCartera</h1>
          <div className="flex flex-col gap-4 w-72">
            
            <button 
              onClick={() => setPantallaActual('nueva_compra')}
              className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-lg shadow-sky-900/20"
            >
              Cargar Nueva Compra
            </button>

            <button 
              onClick={() => setPantallaActual('nueva_venta')}
              className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-lg shadow-sky-900/20"
            >
              Registrar Venta
            </button>

            <button 
              onClick={() => setPantallaActual('historial')}
              className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-lg shadow-sky-900/20"
            >
              Ver Cartera Activa
            </button>

            {/* NUEVO: Botón de Historial de Ventas */}
            <button 
              onClick={() => setPantallaActual('historial_ventas')}
              className="bg-slate-800 hover:scale-110 border border-slate-700 text-fuchsia-100 font-bold my-1 py-3 px-4 rounded-xl transition-all active:bg-sky-400/70 shadow-lg shadow-sky-900/20"
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