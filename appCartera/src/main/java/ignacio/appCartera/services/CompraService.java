package ignacio.appCartera.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    // MÉTODOS OPTIMIZADOS CON CACHÉ
    // ==========================================

    // ACÁ ESTÁ EL CAMBIO CLAVE: Recibe el booleano 'forzar'
    public List<CompraDTO> obtenerComprasActivas(boolean forzar) {
        List<Compra> compras = compraRepository.findByEstado(EstadoOperacion.EN_CURSO);

        // SALVAGUARDA: Si la base de datos no tiene compras, cortamos por lo sano.
        // No chequeamos caché ni imprimimos nada en consola.
        if (compras.isEmpty()) {
            return new ArrayList<>();
        }

        long ahora = System.currentTimeMillis();
        boolean cacheValido = (ahora - ultimaActualizacion) < (5 * 60 * 1000);

        // Si NO estamos forzando, y el caché es válido, y no está vacío... usamos caché
        if (!forzar && cacheValido && !machetePreciosGlobal.isEmpty()) {
            System.out.println("🚀 Usando precios del machete (Caché de servidor)");
            return compras.stream()
                    .map(c -> convertirADTO(c, machetePreciosGlobal.getOrDefault(c.getTicker().toUpperCase(), 0.0)))
                    .toList();
        }

        // Si forzamos, o el caché venció, actualizamos y vamos a buscar a la API
        if (forzar) {
            System.out.println("⚡ Actualización forzada por el usuario. Golpeando a las APIs...");
        } else {
            System.out.println("⏰ Caché vencido. Actualizando precios...");
        }

        ultimaActualizacion = ahora;
        return procesarComprasConCache(compras);
    }

    // Para mantener compatibilidad si lo llamás desde otro lado sin el boolean
    public List<CompraDTO> obtenerComprasActivas() {
        return obtenerComprasActivas(false);
    }

    // El método maestro que arma el machete
    private List<CompraDTO> procesarComprasConCache(List<Compra> compras) {
        machetePreciosGlobal.clear(); // Limpiamos la vieja data
        List<CompraDTO> comprasProcesadas = new ArrayList<>();

        for (Compra compra : compras) {
            String ticker = compra.getTicker().toUpperCase();

            // Preguntamos si ya buscamos este ticker en esta vuelta
            if (!machetePreciosGlobal.containsKey(ticker)) {
                Double precioEnVivo = 0.0;

                // Chequeamos si es bono para IOL, sino a Yahoo
                if (compra.getFamilia().trim().equalsIgnoreCase("bono")) {
                    precioEnVivo = iolTokenService.obtenerPrecio(ticker) / 100.0;
                } else {
                    precioEnVivo = yfinanceService.obtenerPrecio(ticker);
                }

                // Lo anotamos en el machete para las próximas iteraciones
                machetePreciosGlobal.put(ticker, precioEnVivo);
            }

            // Usamos el precio (ya sea recién sacado de la API o rescatado del machete)
            Double precioActual = machetePreciosGlobal.get(ticker);

            // Convertimos la compra pasando el precio por parámetro
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

        // 1. Inflación a decimal
        Double pi = inflacionAcumulada / 100.0;

        // 2. Totales brutos
        Double capitalInvertido = compra.getCantidad() * compra.getPrecioUnitario();
        Double valorActual = compra.getCantidad() * valorDeMercado;

        // 3. Resultado Real Nominal (en Pesos)
        Double capitalAjustado = capitalInvertido * (1.0 + pi);
        Double resultadoRealNominal = valorActual - capitalAjustado;

        // 4. Resultado Real Porcentual (%)
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