package ignacio.appCartera.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import ignacio.appCartera.models.Compra;
import ignacio.appCartera.models.EstadoOperacion;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    public List<Compra> findByEstado(EstadoOperacion estado);

    List<Compra> findByTickerAndEstadoOrderByFechaCompraAsc(String ticker, EstadoOperacion estado);
}
