import axios from "axios";
import { decodeToken, Token } from "../utils/decode";

const API_URL = import.meta.env.VITE_API_URL;
export class authServices {
  static async login(email: string, password: string) {
    return await axios.post(API_URL + "/api/user/auth/login", { email, password })
      .then((response) => {
        if (response.data) {
          window.sessionStorage.setItem('jwt', JSON.stringify(response.data));
          localStorage.setItem("jwt", JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  static async logout(jwt: string) {
  
    try {
      const axiosInstance = axios.create({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
  
      const response = await axiosInstance.post(API_URL + '/api/user/auth/logout');
      window.sessionStorage.removeItem('jwt');
      localStorage.removeItem('jwt');
      window.location.href = '/login';
      return response.data;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }  

  static async register(formData: FormData) {
    try {
      const email_address = formData.get('email');
      const password = formData.get('password');
      return await axios.post(API_URL + "/api/user/auth/register", { email_address, password })
        .then((response) => {
          return response.data;
        });
    } catch (error) {
      throw new Error(error as string);
    }
  }

  static async verification(token: string) {
    try {
      return await axios.get(API_URL + "/api/auth/activate-account", {
        params: { token }
      })
        .then((response) => {
          return response.data;
        });
    } catch (error) {
      throw new Error(error as string);
    }
  }

  static async sendResetEmail(formData: FormData) {
    try {
      const email = formData.get('email');
      const password = formData.get('newPassword');
      return await axios.post(API_URL + "/api/user/auth/sendResetEmail", { email, password })
        .then((response) => {
          return response.data;
        });
    } catch (error) {
      throw new Error(error as string);
    }
  }

  static async sendReset(formData: FormData) {
    try {
      const email = formData.get('email');
      const newPassword = formData.get('newPassword');
      const code = formData.get('code');
      return await axios.post(API_URL + "/api/user/auth/sendResetPassword", { email, code, newPassword })
        .then((response) => {
          return response.data;
        });
    } catch (error) {
      throw new Error(error as string);
    }
  }

  // static isTokenExpired(token: string) {
  //   if (!token) return true;

  //   try {
  //     // Usar atob para decodificar el payload del token en el navegador
  //     const base64Url = token.split('.')[1];
  //     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //     const decodedPayload = atob(base64); // Decodificando con atob

  //     const payload = JSON.parse(decodedPayload);
  //     const expiry = payload.exp * 1000; // Convertir a milisegundos
  //     return Date.now() > expiry;
  //   } catch (e) {
  //     console.error("Error decoding token:", e);
  //     return true; // Asumimos que el token está expirado si ocurre algún error
  //   }
  // }

  static isTokenExpired(exp: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000)
    return exp < currentTime
  }

  static setCurrentUser() {
    return localStorage.setItem('jwt', JSON.stringify({}));
  }

  static getCurrentUser(): string | null {
    try {
      const decoded = decodeToken()
      const token = Token()
      if (!decoded) {
        sessionStorage.removeItem('jwt')
        return null
      }

      const isExpired = this.isTokenExpired(decoded?.exp)

      if (isExpired) {
        sessionStorage.removeItem('jwt')
        localStorage.removeItem('jwt')
        return null
      }

      const sessionJwt = sessionStorage.getItem('jwt')
      if (!sessionJwt) {
        sessionStorage.setItem('jwt', JSON.stringify(decoded))
      }

      return token
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }
  
}
