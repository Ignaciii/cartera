/*
 * package ignacio.appCartera; // Fijate que sea tu paquete correcto
 * 
 * import org.springframework.boot.context.event.ApplicationReadyEvent;
 * import org.springframework.context.event.EventListener;
 * import org.springframework.stereotype.Component;
 * 
 * @Component
 * public class NavegadorAutoOpen {
 * 
 * @EventListener({ ApplicationReadyEvent.class })
 * public void alArrancar() {
 * try {
 * // Este es un comando nativo de Windows para abrir la URL en el navegador por
 * // defecto
 * Runtime.getRuntime().
 * exec("rundll32 url.dll,FileProtocolHandler http://localhost:8080");
 * System.out.println("Navegador abierto con éxito.");
 * } catch (Exception e) {
 * System.out.println("No se pudo abrir el navegador automáticamente.");
 * e.printStackTrace();
 * }
 * }
 * }
 */