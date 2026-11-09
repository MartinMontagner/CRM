import { AuthData } from "@/model/auth/AuthData";
import { User } from "@/model/user/User";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export type State = {
    authData: AuthData | null;
    user: User | null;

    handleLogin: (authData: AuthData, user: User | null) => void;
    handleRefreshAccessToken: (accessToken: string) => void;
    handleLogout: () => void;
};

export const appStore = createStore<State>((set) => ({
    authData: null,
    user: null,

    handleLogin: (authData, user) =>
        set({
            authData,
            user,
        }),
    handleRefreshAccessToken: (accessToken) =>
        set((state) => {
            if (!state.authData) {
                console.error(
                    "Tried to refresh access token of inexistent session",
                );
                return {};
            }
            return { authData: { ...state.authData, accessToken } };
        }),
    handleLogout: () => set({ authData: null, user: null }),
}));

export function useAppStore<T>(selector: (state: State) => T) {
    return useStore(appStore, selector);
}
