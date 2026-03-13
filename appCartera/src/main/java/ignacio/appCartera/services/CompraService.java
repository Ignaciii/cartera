package ignacio.appCartera.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set; // <-- AGREGADO
import java.util.stream.Collectors; // <-- AGREGADO

import org.springframework.stereotype.Service;

import ignacio.appCartera.DTO.CompraDTO;
import ignacio.appCartera.models.Compra;
import ignacio.appCartera.models.EstadoOperacion;
import ignacio.appCartera.repositories.CompraRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final IolTokenService iolTokenService;
    private final InflacionService inflacionService;
    private final YfinanceService yfinanceService;

    // EL MACHETE AHORA ES GLOBAL
    private final Map<String, Double> machetePreciosGlobal = new HashMap<>();
    private long ultimaActualizacion = 0;

    public Compra cargarCompra(Compra compra) {
        return compraRepository.save(compra);
    }

    // ==========================================
    // MÉTODOS OPTIMIZADOS CON CACHÉ INTELIGENTE
    // ==========================================

    public List<CompraDTO> obtenerComprasActivas(boolean forzar) {
        List<Compra> compras = compraRepository.findByEstado(EstadoOperacion.EN_CURSO);

        if (compras.isEmpty()) {
            return new ArrayList<>();
        }

        long ahora = System.currentTimeMillis();
        boolean cacheValido = (ahora - ultimaActualizacion) < (5 * 60 * 1000);

        // --- SALVAGUARDA PARA TICKERS NUEVOS ---
        // Sacamos los tickers que tenemos en la base de datos ahora mismo
        Set<String> tickersEnDB = compras.stream()
                .map(c -> c.getTicker().toUpperCase())
                .collect(Collectors.toSet());

        // Verificamos si el machete tiene a TODOS esos tickers
        boolean todosLosTickersEnCache = machetePreciosGlobal.keySet().containsAll(tickersEnDB);

        // MODIFICADO: Agregamos "&& todosLosTickersEnCache"
        if (!forzar && cacheValido && !machetePreciosGlobal.isEmpty() && todosLosTickersEnCache) {
            System.out.println("🚀 Usando precios del machete (Caché completa)");
            return compras.stream()
                    .map(c -> convertirADTO(c, machetePreciosGlobal.get(c.getTicker().toUpperCase())))
                    .toList();
        }

        // Si llegamos acá es porque forzamos, pasó el tiempo, o hay un ticker nuevo
        if (forzar) {
            System.out.println("⚡ Actualización forzada por el usuario. Golpeando a las APIs...");
        } else if (!todosLosTickersEnCache) {
            System.out.println("🔍 Activo nuevo detectado. Actualizando machete desde APIs...");
        } else {
            System.out.println("⏰ Caché vencido. Actualizando precios...");
        }

        ultimaActualizacion = ahora;
        return procesarComprasConCache(compras);
    }

    public List<CompraDTO> obtenerComprasActivas() {
        return obtenerComprasActivas(false);
    }

    private List<CompraDTO> procesarComprasConCache(List<Compra> compras) {
        machetePreciosGlobal.clear(); // Limpiamos la vieja data
        List<CompraDTO> comprasProcesadas = new ArrayList<>();

        for (Compra compra : compras) {
            String ticker = compra.getTicker().toUpperCase();

            if (!machetePreciosGlobal.containsKey(ticker)) {
                Double precioEnVivo = 0.0;

                if (compra.getFamilia().trim().equalsIgnoreCase("bono")) {
                    precioEnVivo = iolTokenService.obtenerPrecio(ticker) / 100.0;
                } else {
                    precioEnVivo = yfinanceService.obtenerPrecio(ticker);
                }

                machetePreciosGlobal.put(ticker, precioEnVivo);
            }

            Double precioActual = machetePreciosGlobal.get(ticker);
            comprasProcesadas.add(convertirADTO(compra, precioActual));
        }

        return comprasProcesadas;
    }

    // ==========================================
    // MÉTODOS INDIVIDUALES Y CONVERSIÓN (Sin cambios)
    // ==========================================

    public CompraDTO obtenerCompra(Long operacion) {
        Compra compra = compraRepository.findById(operacion).orElse(null);
        if (compra == null)
            return null;

        Double precioActual = iolTokenService.obtenerPrecio(compra.getTicker());
        return convertirADTO(compra, precioActual);
    }

    public Compra editarCompra(Compra compra, Long id) {
        Compra compraEditar = compraRepository.findById(id).orElse(null);
        if (compra != null && compraEditar != null) {
            compraEditar.setEstado(compra.getEstado());
            compraEditar.setTicker(compra.getTicker());
            compraEditar.setFamilia(compra.getFamilia());
            compraEditar.setCantidad(compra.getCantidad());
            compraEditar.setFechaCompra(compra.getFechaCompra());
            compraEditar.setPrecioUnitario(compra.getPrecioUnitario());
            compraEditar.setSector(compra.getSector());
            compraEditar = compraRepository.save(compraEditar);
        }
        return compraEditar;
    }

    public CompraDTO convertirADTO(Compra compra, Double valorDeMercado) {
        Double inflacionAcumulada = inflacionService.calcularInflacionAcumulada(compra.getFechaCompra().toString());

        CompraDTO compraDTO = new CompraDTO();
        compraDTO.setOperacion(compra.getOperacion());
        compraDTO.setTicker(compra.getTicker());
        compraDTO.setCantidad(compra.getCantidad());
        compraDTO.setPrecioUnitario(compra.getPrecioUnitario());
        compraDTO.setFechaCompra(compra.getFechaCompra());
        compraDTO.setSector(compra.getSector());
        compraDTO.setFamilia(compra.getFamilia());
        compraDTO.setEstado(compra.getEstado());

        compraDTO.setInflacionAcumulada(inflacionAcumulada);
        compraDTO.setValorDeMercado(valorDeMercado);
        compraDTO.setTotal(compra.getCantidad() * compra.getPrecioUnitario());

        Double pi = inflacionAcumulada / 100.0;
        Double capitalInvertido = compra.getCantidad() * compra.getPrecioUnitario();
        Double valorActual = compra.getCantidad() * valorDeMercado;

        Double capitalAjustado = capitalInvertido * (1.0 + pi);
        Double resultadoRealNominal = valorActual - capitalAjustado;

        Double resultadoRealPorcentual = 0.0;
        if (compra.getPrecioUnitario() > 0) {
            Double multiplicadorNominal = valorDeMercado / compra.getPrecioUnitario();
            resultadoRealPorcentual = (multiplicadorNominal / (1.0 + pi)) - 1.0;
        }

        compraDTO.setResultadoRealNominal(resultadoRealNominal);
        compraDTO.setResultadoRealPorcentaje(resultadoRealPorcentual * 100.0);

        return compraDTO;
    }

    public List<Compra> findByEstadoAndTicker(String ticker, EstadoOperacion estadoOperacion) {
        return compraRepository.findByTickerIgnoreCaseAndEstadoOrderByFechaCompraAsc(ticker, estadoOperacion);
    }
}