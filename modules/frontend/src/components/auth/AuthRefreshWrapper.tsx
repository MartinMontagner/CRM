import { useAppStore } from "@/state/store";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { refreshSession } from "../../service/auth/AuthService";

function AuthRefreshWrapper() {
    const [loading, setLoading] = useState(true);
    const authData = useAppStore((state) => state.authData);

    useEffect(() => {
        const refresh = async () => {
            await refreshSession();
            setLoading(false);
        };
        !authData ? refresh() : setLoading(false);
    }, [authData]);

    return loading ? null : <Outlet />;
}

export default AuthRefreshWrapper;
