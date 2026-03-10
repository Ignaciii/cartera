package ignacio.appCartera.services;

import java.util.List;

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

    public Compra cargarCompra(Compra compra) {
        return compraRepository.save(compra);
    }

    public List<CompraDTO> obtenerComprasActivas() {

        List<Compra> compras = compraRepository.findByEstado(EstadoOperacion.EN_CURSO);

        return compras.stream().map(this::convertirADTO).toList();
    }

    public CompraDTO obtenerCompra(Long operacion) {
        return convertirADTO(compraRepository.findById(operacion).orElse(null));
    }

    public List<CompraDTO> obtenerComprasFinalizadas() {
        List<Compra> compras = compraRepository.findByEstado(EstadoOperacion.FINALIZADA);
        return compras.stream().map(this::convertirADTO).toList();
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

    public CompraDTO convertirADTO(Compra compra) {

        Double infacionAcumulada = inflacionService.calcularInflacionAcumulada(compra.getFechaCompra().toString());
        Double valorDeMercado = iolTokenService.obtenerPrecio(compra.getTicker());
        CompraDTO compraDTO = new CompraDTO();
        compraDTO.setCantidad(compra.getCantidad());
        compraDTO.setOperacion(compra.getOperacion());
        compraDTO.setFamilia(compra.getFamilia());
        compraDTO.setSector(compra.getSector());
        compraDTO.setPrecioUnitario(compra.getPrecioUnitario());
        compraDTO.setEstado(compra.getEstado());
        compraDTO.setFechaCompra(compra.getFechaCompra());
        compraDTO.setTicker(compra.getTicker());

        compraDTO.setInflacionAcumulada(infacionAcumulada);
        compraDTO.setValorDeMercado(valorDeMercado);
        compraDTO.setTotal(compra.getCantidad() * compra.getPrecioUnitario());

        compraDTO.setResultadoRealNominal(
                (compra.getCantidad() * valorDeMercado)
                        - (compra.getPrecioUnitario() * compra.getCantidad()) * (1 + infacionAcumulada / 100)

        );
        compraDTO.setResultadoRealPorcentaje(

                (valorDeMercado / compra.getPrecioUnitario() - 1) * 100 - infacionAcumulada

        );

        return compraDTO;
    }

}
