package ignacio.appCartera.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ignacio.appCartera.DTO.VentaDTO;
import ignacio.appCartera.models.EstadoOperacion;
import ignacio.appCartera.models.Venta;
import ignacio.appCartera.repositories.VentaRepository;
import lombok.RequiredArgsConstructor;
import ignacio.appCartera.models.Compra;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {
    private final VentaRepository ventaRepository;
    private final CompraService compraService;
    private final InflacionService inflacionService;

    @Transactional
    public void registrarVenta(VentaDTO ventaDTO) {
        if (ventaDTO != null) {
            String ticker = ventaDTO.getTicker();
            Double cantidadVender = ventaDTO.getCantidad();
            Double precioVenta = ventaDTO.getPrecioVenta();
            List<Compra> comprasDelTicker = compraService.findByEstadoAndTicker(ticker, EstadoOperacion.EN_CURSO);
            Double cantidadDelTickerComprado = comprasDelTicker.stream().mapToDouble(Compra::getCantidad).sum();

            if (comprasDelTicker.isEmpty() || cantidadVender <= 0 || cantidadDelTickerComprado < cantidadVender) {
                throw new RuntimeException("¡Epa! Estás queriendo vender " + cantidadVender + " y solo tenés "
                        + cantidadDelTickerComprado);

            }

            for (Compra compra : comprasDelTicker) {
                if (cantidadVender == 0)
                    break;

                Double cantidadRestanteVender = Math.min(compra.getCantidad(), cantidadVender);

                Double inflacionAcumulada = inflacionService
                        .calcularInflacionAcumulada(compra.getFechaCompra().toString());
                Double pi = inflacionAcumulada / 100.0;

                Double precioCompra = compra.getPrecioUnitario();
                Double capitalInvertido = cantidadRestanteVender * precioCompra;
                Double valorVentaActual = cantidadRestanteVender * precioVenta;

                // Fórmulas de Fisher
                Double capitalAjustado = capitalInvertido * (1.0 + pi);
                Double resultadoNominal = valorVentaActual - capitalAjustado;
                Double resultadoPorcentual = (valorVentaActual / capitalAjustado) - 1;

                Venta venta = new Venta();

                venta.setCantidad(cantidadRestanteVender);
                venta.setTicker(ticker);
                venta.setPrecioCompra(precioCompra);
                venta.setFechaCompra(ventaDTO.getFechaCompra());
                venta.setFechaVenta(ventaDTO.getFechaVenta());
                venta.setResultadoNominal(resultadoNominal);
                venta.setResultadoPorcentual(resultadoPorcentual);
                venta.setPrecioVenta(precioVenta);

                ventaRepository.save(venta);

                compra.setCantidad(compra.getCantidad() - cantidadRestanteVender);
                if (compra.getCantidad() == 0) {
                    compra.setEstado(EstadoOperacion.FINALIZADA);
                }

                compraService.cargarCompra(compra);

                cantidadVender -= cantidadRestanteVender;

            }

        } else {
            System.out.println("No se paso una venta para registrar!!!");
        }
    }

    public List<VentaDTO> obtenerVentas() {
        List<Venta> ventas = ventaRepository.findAll();
        return ventas.stream().map(venta -> {
            VentaDTO ventaDTO = new VentaDTO();
            ventaDTO.setCantidad(venta.getCantidad());
            ventaDTO.setFechaCompra(venta.getFechaCompra());
            ventaDTO.setFechaVenta(venta.getFechaVenta());
            ventaDTO.setPrecioCompra(venta.getPrecioCompra());
            ventaDTO.setPrecioVenta(venta.getPrecioVenta());
            ventaDTO.setResultadoNominal(venta.getResultadoNominal());
            ventaDTO.setResultadoPorcentual(venta.getResultadoPorcentual());
            ventaDTO.setTicker(venta.getTicker());

            return ventaDTO;
        }).toList();
    }

}
