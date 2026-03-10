package ignacio.appCartera.models;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long operacion;

    @Enumerated(EnumType.STRING)
    private EstadoOperacion estado;

    private String sector;
    private String ticker;
    private Integer cantidad;
    private Double precioUnitario;
    private LocalDate fechaCompra;
    private String familia;
}
