import ApiService from "@/service/ApiService"
import type { User } from "@/types/interface"

const api = new ApiService()
const path = '/users'

export interface Credential {
	email: string,
	password: string
}

export interface LoginResponse extends User {
	token: string
}

export function login(data: Credential) {
	return api.post(`${path}/signin`, data);
}