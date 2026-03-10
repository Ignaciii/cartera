package ignacio.appCartera.services;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.List;
import ignacio.appCartera.DTO.InflacionDTO;

@Service
public class InflacionService {

    public InflacionService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.argentinadatos.com/v1/finanzas/indices/inflacion")
                .build();
        obtenerInflacion();
    }

    private final WebClient webClient;
    private List<InflacionDTO> inflacion;

    public void obtenerInflacion() {
        InflacionDTO[] respuesta = webClient.get().retrieve().bodyToMono(InflacionDTO[].class).block();
        if (respuesta != null) {
            inflacion = Arrays.asList(respuesta);
        }
    }

    public Double calcularInflacionAcumulada(String fechaCompra) {
        return inflacion.stream().filter(inf -> inf.getFecha().compareTo(fechaCompra) >= 0)
                .mapToDouble(InflacionDTO::getValor).sum();
    }

}
