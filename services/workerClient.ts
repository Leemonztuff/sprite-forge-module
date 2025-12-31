
/**
 * WorkerClient: Abstracción para el procesamiento off-thread.
 * Nota: En este entorno simulado, el worker se inyecta como un blob.
 */
export class WorkerClient {
  static async processPipeline(pixels: any, config: any): Promise<any> {
    // Implementación conceptual de worker para no saturar el hilo de UI
    return new Promise((resolve) => {
       setTimeout(() => resolve(pixels), 10); // Simulación de transferencia
    });
  }
}
