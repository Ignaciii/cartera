package ignacio.appCartera.services;

import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import ignacio.appCartera.models.IolToken;
import org.springframework.beans.factory.annotation.Value;

@Service
public class IolTokenService {

    public IolTokenService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.invertironline.com").build();
    }

    private final WebClient webClient;
    private String tokenActual = null;

    @Value("${iol.password}")
    private String password;
    @Value("${iol.username}")
    private String username;

    public void autenticar() {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();

        formData.add("username", username);

        formData.add("password", password);
        formData.add("grant_type", "password");

        IolToken token = webClient.post().uri("/token").body(BodyInserters.fromFormData(formData)).retrieve()
                .bodyToMono(IolToken.class).block();

        if (token != null) {
            this.tokenActual = token.getToken();
        }
    }

    public Double obtenerPrecio(String ticker) {
        if (tokenActual == null)
            autenticar();

        // Ejemplo para acciones de BYMA
        return webClient.get()
                .uri("/api/v2/Titulos/Datos/bcvl/" + ticker + "/Cotizacion")
                .header("Authorization", "Bearer " + tokenActual)
                .retrieve()
                .bodyToMono(Object.class) // Después podés crear un DTO más preciso
                .map(res -> {
                    // Acá tendrías que extraer el campo "ultimoPrecio" del JSON que manda IOL
                    return 1234.50; // Valor de prueba
                })
                .block();
    }

}
