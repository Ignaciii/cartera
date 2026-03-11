package ignacio.appCartera.services;

import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import ignacio.appCartera.DTO.CotizacionDTO;
import ignacio.appCartera.models.IolToken;
import org.springframework.beans.factory.annotation.Value;

@Service
public class IolTokenService {

    private final WebClient webClient;
    private String tokenActual = null;

    @Value("${iol.password}")
    private String password;
    @Value("${iol.username}")
    private String username;

    public IolTokenService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.invertironline.com").build();
    }

    public void autenticar() {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("username", username);
        formData.add("password", password);
        formData.add("grant_type", "password");

        try {
            IolToken token = webClient.post().uri("/token")
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(IolToken.class)
                    .block();

            if (token != null) {
                this.tokenActual = token.getToken();
            }
        } catch (Exception e) {
            System.out.println("🔥 ERROR AL AUTENTICAR. IOL dice: " + e.getMessage());
        }
    }

    public Double obtenerPrecio(String ticker) {
        if (tokenActual == null)
            autenticar();

        try {
            // Código limpio y directo al DTO
            CotizacionDTO cotizacion = webClient.get()
                    .uri("/api/v2/bcba/Titulos/" + ticker.toUpperCase() + "/Cotizacion")
                    .header("Authorization", "Bearer " + tokenActual)
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(CotizacionDTO.class)
                    .block();

            return (cotizacion != null && cotizacion.getUltimoPrecio() != null)
                    ? cotizacion.getUltimoPrecio()
                    : 0.0;

        } catch (Exception e) {
            System.out.println("❌ ERROR EN IOL (" + ticker + "): " + e.getMessage());
            return 0.0;
        }
    }
}