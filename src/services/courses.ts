const API_URL = import.meta.env.VITE_API_URL;

export interface Course {
  id: number;
  name: string;
  abbr: string | null;
  price_panamanian: number | null;
  price_panamanian_renewal: number | null;
  price_foreign: number | null;
  price_foreign_renewal: number | null;
  imo_no: string | null;
  deletedAt?: string | null;
}

export interface CourseFormData {
  name: string;
  abbr?: string;
  imo_no?: string;
  price_panamanian?: number | null;
  price_panamanian_renewal?: number | null;
  price_foreign?: number | null;
  price_foreign_renewal?: number | null;
}

export class CourseServices {
  private jwt: string;

  constructor(jwt: string = '') {
    this.jwt = jwt;
  }

  private get authHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.jwt ? { Authorization: `Bearer ${this.jwt}` } : {}),
    };
  }

  async getAllCourses(): Promise<Course[]> {
    const response = await fetch(`${API_URL}/api/courses/getAllCourses?limit=500`);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const json = await response.json();
    // El endpoint devuelve { data: Course[], pagination: {...} } o Course[] (retrocompatibilidad)
    return Array.isArray(json) ? json : (json.data ?? []);
  }

  async createCourse(data: CourseFormData): Promise<Course> {
    const response = await fetch(`${API_URL}/api/courses/create`, {
      method: 'POST',
      headers: this.authHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error ${response.status}`);
    }
    return response.json();
  }

  async updateCourse(id: number, data: Partial<CourseFormData>): Promise<Course> {
    const response = await fetch(`${API_URL}/api/courses/${id}`, {
      method: 'PUT',
      headers: this.authHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error ${response.status}`);
    }
    return response.json();
  }

  async deleteCourse(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/courses/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error ${response.status}`);
    }
  }
}
