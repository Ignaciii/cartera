package ignacio.appCartera.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ignacio.appCartera.models.Compra;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

}
