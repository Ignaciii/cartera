package ignacio.appCartera.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class YahooResponseDTO {

    private Chart chart;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Chart {
        private List<Result> result;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {
        private Meta meta;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Meta {
        // Acá está la papa: el precio metido adentro de la meta-data del gráfico
        private Double regularMarketPrice;
    }
}