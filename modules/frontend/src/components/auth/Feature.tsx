import { ReactNode } from "react";
import { AuthenticationFunction } from "../../model/auth/Authenticators";
import { useAppStore } from "@/state/store";

type FeatureProps = {
    authenticate: AuthenticationFunction;
    children: ReactNode;
};

function Feature({ authenticate, children }: FeatureProps) {
    const authData = useAppStore((state) => state.authData);

    if (authData && authenticate(authData)) {
        return children;
    }

    return null;
}

export default Feature;
