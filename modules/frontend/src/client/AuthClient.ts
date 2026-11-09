import axios, { AxiosResponse } from "axios";

const authClient = axios.create({
    baseURL: BACKEND_URL + "/auth",
    withCredentials: true,
});

authClient.interceptors.request.use(
    (config) => config,
    (error) => error,
);
authClient.interceptors.response.use(
    (response) => response,
    (error) => error,
);

export type LoginRequest = { email: string; password: string };

export type AuthDataResponse = {
    accessToken: string;
    roles: string[];
    featureFlags: string[];
    userId: number;
};

export type SignupRequest = {
    email: string;
    username: string;
    fullName: string;
    password: string;
};

const login = async (payload: LoginRequest) => {
    return authClient.post<AuthDataResponse>("/login", payload);
};

let refreshSessionPromise: Promise<AxiosResponse<AuthDataResponse>> | null;
const refreshSession = async () => {
    if (refreshSessionPromise) {
        return await refreshSessionPromise;
    }
    refreshSessionPromise = authClient.post<AuthDataResponse>("/refresh");
    const res = await refreshSessionPromise;
    refreshSessionPromise = null;
    return res;
};

const logOut = async () => {
    return await authClient.post("/logout");
};

export default { login, refreshSession, logOut };