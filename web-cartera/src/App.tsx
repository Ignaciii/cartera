import { useState } from 'react'
import './App.css'
import HistorialCompras from './components/HistorialCompras'
import FormularioDeCompra from './components/FormularioDeCompra'

function App() {
  const [refreshQuery, setRefreshQuery] = useState(0);

  // Esta función suma 1 cada vez que se carga una compra
  const dispararRecarga = () => setRefreshQuery(old => old + 1);

  return (
    <div className="bg-slate-950 min-h-screen pb-10">
      <div className="max-w-6xl mx-auto pt-8 px-4">
        <h1 className="text-3xl font-bold text-slate-100 mb-8 text-center">
          Gestión de Cartera <span className="text-sky-500">Real</span>
        </h1>
        
        {/* Pasamos la función de recarga al form */}
        <FormularioDeCompra onCompraCargada={dispararRecarga} />
        
        {/* Pasamos el trigger al historial */}
        <HistorialCompras key={refreshQuery} />
      </div>
    </div>
  )
}

export default App