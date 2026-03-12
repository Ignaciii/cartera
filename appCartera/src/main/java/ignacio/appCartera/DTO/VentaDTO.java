package ignacio.appCartera.DTO;

import java.time.LocalDate;

import lombok.Data;

@Data
public class VentaDTO {
    private Long id;

    private String ticker;
    private Double cantidad;
    private Double precioCompra;
    private Double precioVenta;
    private LocalDate fechaCompra;
    private LocalDate fechaVenta;
    private Double resultadoNominal;
    private Double resultadoPorcentual;
}