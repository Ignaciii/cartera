package ignacio.appCartera.models;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double precioCompra;
    private Double precioVenta;

    private String ticker;
    private Double cantidad;

    private LocalDate fechaCompra;
    private LocalDate fechaVenta;

    private Double resultadoPorcentual;
    private Double resultadoNominal;
}
