package ignacio.appCartera.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

import ignacio.appCartera.models.Compra;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    @Query("SELECT c FROM Compra c WHERE c.estado = 'EN_CURSO'")
    public List<Compra> obtenerComprasEnCurso();

    @Query("SELECT c FROM Compra c WHERE c.estado = 'FINALIZADA'")
    public List<Compra> obtenerComprasFinalizadas();
}
