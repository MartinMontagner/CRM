import { useCallback, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Route as RouteType, routes } from "../../model/routing/Routes.ts";
import AuthenticatedRoute from "../auth/AuthenticatedRoute.tsx";
import AuthRefreshWrapper from "../auth/AuthRefreshWrapper.tsx";

function Router() {
    const mapRoute = useCallback(
        (route: RouteType) =>
            route.path === "" ? (
                <Route
                    key={route.path}
                    index
                    element={
                        route.requiresAuth ? (
                            <AuthenticatedRoute
                                authenticate={route.authenticate}
                            >
                                <route.component />
                            </AuthenticatedRoute>
                        ) : (
                            <route.component />
                        )
                    }
                />
            ) : (
                <Route
                    key={route.path}
                    path={route.path}
                    element={
                        route.requiresAuth ? (
                            <AuthenticatedRoute
                                authenticate={route.authenticate}
                            >
                                <route.component />
                            </AuthenticatedRoute>
                        ) : (
                            <route.component />
                        )
                    }
                >
                    {route.children?.map(mapRoute) ?? null}
                </Route>
            ),
        [],
    );

    const routeComponents = useMemo(() => routes.map(mapRoute), [mapRoute]);

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AuthRefreshWrapper />}>
                    {routeComponents}
                </Route>
                <Route path="*" element={<Navigate to={"/"} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default Router;
