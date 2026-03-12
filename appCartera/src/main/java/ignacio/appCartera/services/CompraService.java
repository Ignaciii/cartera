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

    public Compra cargarCompra(Compra compra) {
        return compraRepository.save(compra);
    }

    // ==========================================
    // MÉTODOS OPTIMIZADOS CON CACHÉ
    // ==========================================

    public List<CompraDTO> obtenerComprasActivas() {
        List<Compra> compras = compraRepository.findByEstado(EstadoOperacion.EN_CURSO);
        return procesarComprasConCache(compras);
    }

    // El método maestro que arma el machete
    private List<CompraDTO> procesarComprasConCache(List<Compra> compras) {
        Map<String, Double> cachePrecios = new HashMap<>();
        List<CompraDTO> comprasProcesadas = new ArrayList<>();

        for (Compra compra : compras) {
            String ticker = compra.getTicker().toUpperCase();

            // Preguntamos si ya buscamos este ticker en esta vuelta
            if (!cachePrecios.containsKey(ticker)) {
                Double precioEnVivo = 0.0;
                // Acá a futuro podés meter el IF para ver si usás IOL o Yahoo
                if (compra.getFamilia().toLowerCase() == "bono") {
                    precioEnVivo = iolTokenService.obtenerPrecio(ticker);
                } else {
                    precioEnVivo = yfinanceService.obtenerPrecio(ticker);
                }

                // Lo anotamos en el machete para las próximas iteraciones
                cachePrecios.put(ticker, precioEnVivo);
            }

            // Usamos el precio (ya sea recién sacado de IOL o rescatado del machete)
            Double precioActual = cachePrecios.get(ticker);

            // Convertimos la compra pasando el precio por parámetro
            comprasProcesadas.add(convertirADTO(compra, precioActual));
        }

        return comprasProcesadas;
    }

    // ==========================================
    // MÉTODOS INDIVIDUALES Y CONVERSIÓN
    // ==========================================

    // CHEQUEAR QUE TAN NECESARIO SOS VOS
    public CompraDTO obtenerCompra(Long operacion) {
        Compra compra = compraRepository.findById(operacion).orElse(null);
        if (compra == null)
            return null;

        Double precioActual = iolTokenService.obtenerPrecio(compra.getTicker());
        return convertirADTO(compra, precioActual);
    }

    // A VOS ME PARECE QUE TE VOY A CAMBIAR POR ARMAR UNA VENTA
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

    // Fijate que ahora pide el precio por parámetro para no llamar a IOL desde acá
    // adentro
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

        // ========================================================
        // CÁLCULO FINANCIERO CORREGIDO (Exacto por Ecuación de Fisher)
        // ========================================================

        // 1. Inflación a decimal
        Double pi = inflacionAcumulada / 100.0;

        // 2. Totales brutos
        Double capitalInvertido = compra.getCantidad() * compra.getPrecioUnitario();
        Double valorActual = compra.getCantidad() * valorDeMercado;

        // 3. Resultado Real Nominal (en Pesos)
        Double capitalAjustado = capitalInvertido * (1.0 + pi);
        Double resultadoRealNominal = valorActual - capitalAjustado;

        // 4. Resultado Real Porcentual (%)
        // Prevenimos dividir por cero por si la base de datos trae algún error de carga
        Double resultadoRealPorcentual = 0.0;
        if (compra.getPrecioUnitario() > 0) {
            Double multiplicadorNominal = valorDeMercado / compra.getPrecioUnitario();
            resultadoRealPorcentual = (multiplicadorNominal / (1.0 + pi)) - 1.0;
        }

        compraDTO.setResultadoRealNominal(resultadoRealNominal);
        compraDTO.setResultadoRealPorcentaje(resultadoRealPorcentual * 100.0);

        return compraDTO;
    }
}