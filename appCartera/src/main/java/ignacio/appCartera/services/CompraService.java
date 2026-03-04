package ignacio.appCartera.services;

import java.util.List;

import org.springframework.stereotype.Service;

import ignacio.appCartera.models.Compra;
import ignacio.appCartera.repositories.CompraRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CompraService {
    private final CompraRepository compraRepository;

    public Compra cargarCompra(Compra compra) {
        return compraRepository.save(compra);
    }

    public List<Compra> obtenerComprasActivas() {
        return compraRepository.obtenerComprasEnCurso();
    }

    public Compra obtenerCompra(Long operacion) {
        return compraRepository.findById(operacion).orElse(null);
    }

    public List<Compra> obtenerComprasFinalizadas() {
        return compraRepository.obtenerComprasFinalizadas();
    }

    public Compra editarCompra(Compra compra, Long id) {
        Compra compraEditar = obtenerCompra(id);
        if (compra != null && compraEditar != null) {
            compraEditar.setEstado(compra.getEstado());
            compraEditar.setTicker(compra.getTicker());
            compraEditar.setFamilia(compra.getFamilia());
            compraEditar.setCantidad(compra.getCantidad());
            compraEditar.setFechaCompra(compra.getFechaCompra());
            compraEditar.setPrecioUnitario(compra.getPrecioUnitario());
            compraEditar = compraRepository.save(compraEditar);
        }
        return compraEditar;
    }
}
