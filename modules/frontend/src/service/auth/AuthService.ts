import AuthClient, {
  AuthDataResponse,
  LoginRequest,
  SignupRequest,
} from "@/client/AuthClient";
import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { Role } from "@/model/auth/AuthData";
import { getUser } from "@/service/user/UserService";
import { appStore } from "@/state/store";

export const login = async (payload: LoginRequest) => {
  const loginRes = await AuthClient.login(payload);
  if (loginRes.status === 200) {
    await processAuthDataAndFetchUser(loginRes.data);
  }
  return loginRes;
};

export const refreshSession = async () => {
  const refreshRes = await AuthClient.refreshSession();
  if (refreshRes.status === 200) {
    await processAuthDataAndFetchUser(refreshRes.data);
  }
  return refreshRes;
};

const processAuthDataAndFetchUser = async (res: AuthDataResponse) => {
  const authData = {
    accessToken: res.accessToken,
    roles: res.roles
      .map((role) => Role[<keyof typeof Role>role])
      .filter((role) => role !== undefined),
    userId: res.userId,
  };
  const user = await getUser(authData);
  appStore.getState().handleLogin(authData, user);
};

export const logOut = async () => {
  const res = await AuthClient.logOut();
  appStore.getState().handleLogout();
  return res;
};

type ErrorResponse = {
  errorCode: string;
};

export const signup = async (payload: SignupRequest) => {
  const client = createRefreshTokenHttpClient("/auth");

  const response = await client.post<string | ErrorResponse>(
    "/signup",
    payload,
    {
      headers: {
        "Custom-Header-Domain": FRONTEND_URL,
      },
    }
  );

  if (response.status !== 200) {
    const errorData = response.data as ErrorResponse;
    throw new Error(errorData.errorCode);
  }

  return response;
};
