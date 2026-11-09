import { useAppStore } from "@/state/store";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthenticationFunction } from "../../model/auth/Authenticators";

type AuthenticatedRouteProps = {
    authenticate?: AuthenticationFunction;
    children: ReactNode;
};

function AuthenticatedRoute({
    authenticate,
    children,
}: AuthenticatedRouteProps) {
    const location = useLocation();

    const authData = useAppStore((state) => state.authData);

    if (!authData) {
        return <Navigate to={"/login"} state={{ from: location }} replace />;
    }

    if (authenticate && !authenticate(authData)) {
        return <Navigate to={"/"} replace />;
    }

    return children;
}

export default AuthenticatedRoute;
