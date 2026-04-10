import axios, { AxiosInstance } from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export interface UserData {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface UserFormData {
  email: string;
  name?: string;
  role?: string;
  password?: string;
}

export class userServices {
  axiosInstance: AxiosInstance;

  constructor(jwt: string) {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }

  async getAllUsers(): Promise<UserData[]> {
    const response = await this.axiosInstance.get(`${API_URL}/api/user`);
    return response.data;
  }

  async createUser(data: UserFormData): Promise<UserData> {
    const response = await this.axiosInstance.post(`${API_URL}/api/user`, data);
    return response.data;
  }

  async updateUser(id: number, data: Partial<UserFormData>): Promise<UserData> {
    const response = await this.axiosInstance.put(`${API_URL}/api/user/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.axiosInstance.delete(`${API_URL}/api/user/${id}`);
  }
}
