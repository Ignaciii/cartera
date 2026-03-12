package ignacio.appCartera.services;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import ignacio.appCartera.DTO.YahooResponseDTO;

@Service
public class YfinanceService {

    private final WebClient webClient;

    public YfinanceService(WebClient.Builder webClientBuilder) {
        // Usamos query2 que es el servidor de gráficos (más permisivo)
        this.webClient = webClientBuilder.baseUrl("https://query2.finance.yahoo.com").build();
    }

    public Double obtenerPrecio(String ticker) {
        try {
            // A Yahoo le pasamos el ticker con .BA para Argentina
            String tickerYahoo = ticker.toUpperCase() + ".BA";

            // Le pegamos al endpoint v8 de CHART que no pide la cookie bendita
            YahooResponseDTO response = webClient.get()
                    .uri("/v8/finance/chart/" + tickerYahoo)
                    .header("User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                    .retrieve()
                    .bodyToMono(YahooResponseDTO.class)
                    .block();

            // Navegamos por las nuevas mamushkas para sacar el precio
            if (response != null &&
                    response.getChart() != null &&
                    response.getChart().getResult() != null &&
                    !response.getChart().getResult().isEmpty() &&
                    response.getChart().getResult().get(0).getMeta() != null) {

                Double precio = response.getChart().getResult().get(0).getMeta().getRegularMarketPrice();
                System.out.println("✅ YAHOO (CHART) - TICKER: " + tickerYahoo + " | PRECIO: $" + precio);
                return precio;
            }

        } catch (Exception e) {
            System.out.println("❌ ERROR EN YAHOO FINANCE para " + ticker + ": " + e.getMessage());
        }

        return 0.0;
    }
}