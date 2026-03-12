package ignacio.appCartera.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ignacio.appCartera.DTO.CompraDTO;
import ignacio.appCartera.models.Compra;
import ignacio.appCartera.services.CompraService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cartera/compras")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CompraController {
    private final CompraService compraService;

    // esta cosa devuelve entonces dos cosas una compra creada y el estado de la
    // consulta
    @PostMapping
    public ResponseEntity<Compra> postCompra(@RequestBody Compra compra) {
        return new ResponseEntity<>(compraService.cargarCompra(compra), HttpStatus.CREATED);

    }

    @GetMapping("/activas")
    public ResponseEntity<List<CompraDTO>> obtenerActivas(
            @RequestParam(required = false, defaultValue = "false") boolean forzar) {
        // Le pasamos el parámetro 'forzar' al Service
        return ResponseEntity.ok(compraService.obtenerComprasActivas(forzar));
    }

    @PutMapping("{operacion}")
    public ResponseEntity<Compra> putCompra(@RequestBody Compra compra, @PathVariable Long operacion) {
        return new ResponseEntity<>(compraService.editarCompra(compra, operacion), HttpStatus.ACCEPTED);

    }

    @GetMapping("{operacion}")
    public CompraDTO getCompra(@PathVariable Long operacion) {
        return compraService.obtenerCompra(operacion);
    }

}
