// src/services/courseServices.ts (o donde tengas definido courseServices)
// REMOVER: import axios from "axios"; // Ya no necesitamos axios

const API_URL = import.meta.env.VITE_API_URL;

// Define la interfaz para un curso si aún no la tienes globalmente.
export interface Course {
	id: number;
	name: string;
	abbr: string;
	price_panamanian: number | null;
	price_panamanian_renewal: number | null;
	price_foreign: number | null;
	price_foreign_renewal: number | null;
    imo_no: string | null; // Número IMO del curso, si aplica
  // Añade cualquier otra propiedad relevante que tu API devuelva
  // Por ejemplo: description: string; category: string; isRenewable?: boolean;
}

export class CourseServices { // Renombrado a CourseServices por convención

  async getAllCourses(): Promise<Course[]> { // Cambiado el nombre del método y tipado el retorno
    try {
      if (!API_URL) {
        throw new Error("VITE_API_URL is not defined in environment variables.");
      }

      const response = await fetch(
        `${API_URL}/api/courses/getAllCourses`
      );

      // fetch no lanza error para respuestas HTTP como 404, 500.
      // Debemos verificar la propiedad `ok` de la respuesta.
      if (!response.ok) {
        // Intentar leer el cuerpo del error si el servidor envía un JSON o texto con el error
        const errorBody = await response.text().catch(() => "No error detail available");
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText || 'Unknown error'} Body: ${errorBody.substring(0, 200)}`);
      }

      const data: Course[] = await response.json(); // Parsea la respuesta como JSON
      console.log("Cursos obtenidos de la API (fetch):", data);
      return data;
    } catch (error: unknown) {
      console.error("Error al obtener los cursos de la API:", error);
      // Lanza un Error con un mensaje más descriptivo
      if (error instanceof Error) {
        throw new Error(`Error al obtener los cursos: ${error.message}`);
      } else {
        throw new Error("Error al obtener los cursos: Error desconocido");
      }
    }
  }
}