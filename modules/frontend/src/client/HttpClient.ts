import { appStore } from "@/state/store";
import axios from "axios";
import AuthClient from "./AuthClient";

export const createRefreshTokenHttpClient = (basePath: string) => {
    const client = axios.create({
        baseURL: BACKEND_URL + basePath,
    });

    client.interceptors.request.use(
        (config) => {
            const state = appStore.getState();
            const accessToken = state.authData?.accessToken;
            const userId = state.authData?.userId;

            if (!config.headers["Authorization"] && accessToken) {
                config.headers["Authorization"] = "Bearer " + accessToken;
            }

            if (!config.headers["userId"] && userId) {
                config.headers["userId"] = userId;
            }

            return config;
        },
        (error) => error,
    );

    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const config = error?.config;
            if (error?.response?.status === 403 && config && !config.retried) {
                config.retried = true;
                const refreshRes = await AuthClient.refreshSession();
                if (refreshRes && refreshRes.status === 200) {
                    const newAccessToken = refreshRes.data.accessToken;
                    config.headers["Authorization"] = "Bearer " + newAccessToken;
                    appStore.getState().handleRefreshAccessToken(newAccessToken);
                    return client(config);
                }
            }
            throw error.response;
        },
    );

    return client;
};