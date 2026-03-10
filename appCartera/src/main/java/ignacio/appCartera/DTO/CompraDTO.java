package ignacio.appCartera.DTO;

import java.time.LocalDate;

import ignacio.appCartera.models.EstadoOperacion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompraDTO {

    private Long operacion;
    private String familia;
    private String sector;
    private Double precioUnitario;
    private Integer cantidad;
    private EstadoOperacion estado;
    private LocalDate fechaCompra;
    private String ticker;
    private Double valorDeMercado;
    private Double inflacionAcumulada;
    private Double total;
    private Double resultadoRealNominal;
    private Double resultadoRealPorcentaje;
}
