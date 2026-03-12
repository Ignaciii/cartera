package ignacio.appCartera.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ignacio.appCartera.models.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

}
