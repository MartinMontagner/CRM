import { AuthData, Role } from "./AuthData";

export type AuthenticationFunction = (authData: AuthData) => boolean;

const not = (fn: AuthenticationFunction) => {
    return (authData: AuthData) => !fn(authData);
};

const and = (...fns: AuthenticationFunction[]) => {
    return (authData: AuthData) => fns.every((fn) => fn(authData));
};

const or = (...fns: AuthenticationFunction[]) => {
    return (authData: AuthData) => fns.some((fn) => fn(authData));
};

const hasRole = (role: Role) => {
    return (authData: AuthData) => authData.roles.includes(role);
};

const hasRoles = (roles: Role[]) => {
    return (authData: AuthData) => {
        for (const role of authData.roles) {
            if (!roles.includes(role)) {
                return false;
            }
        }
        return true;
    };
};

const hasAnyRole = (roles: Role[]) => {
    return (authData: AuthData) => {
        for (const role of authData.roles) {
            if (roles.includes(role)) {
                return true;
            }
        }
        return false;
    };
};

export default {
    not,
    and,
    or,
    hasRole,
    hasRoles,
    hasAnyRole
};
