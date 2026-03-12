package ignacio.appCartera.controllers;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ignacio.appCartera.services.VentaService;
import ignacio.appCartera.DTO.VentaDTO;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cartera/ventas")
@CrossOrigin(origins = "http://localhost:5173")
public class VentaController {
    private final VentaService ventaService;

    @GetMapping
    public List<VentaDTO> getVentas() {
        return ventaService.obtenerVentas();
    }

    @PostMapping
    public ResponseEntity<VentaDTO> postVenta(@RequestBody VentaDTO ventaDTO) {
        ventaService.registrarVenta(ventaDTO);
        return new ResponseEntity<>(ventaDTO, HttpStatus.CREATED);
    }

}
