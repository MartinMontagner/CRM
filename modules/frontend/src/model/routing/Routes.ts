import EnableUserPage from "@/pages/EnableUserPage";
import LoginPage from "@/pages/LoginPage";
import MemberSubscriptionPage from "@/pages/MemberSubscriptionPage";
import ProfilePage from "@/pages/ProfilePage";
import RecoverPasswordPage from "@/pages/RecoverPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SignupPage from "@/pages/SignupPage";
import WhatsAppPage from "@/pages/WhatsAppPage";
import type { ElementType } from "react";
import { AuthenticationFunction } from "../auth/Authenticators";
import { WazendInstancesPage } from "@/pages/WazendInstancesPage";
import TagsPage from "@/pages/TagsPage";

export type Route = {
    path: string;
    component: ElementType;
    children?: Route[];
    requiresAuth?: boolean;
    authenticate?: AuthenticationFunction;
};

export const routes: Route[] = [
    {
        path: "",
        component: WhatsAppPage,
        requiresAuth: true,
    },
    {
        path: "login",
        component: LoginPage,
    },
    {
        path: "signup",
        component: SignupPage,
    },
    {
        path: "registers",
        component: EnableUserPage,
        requiresAuth: true,
    },
    {
        path: "recover-password",
        component: RecoverPasswordPage,
    },
    {
        path: "reset-password/:code",
        component: ResetPasswordPage,
    },
    {
        path: "profile",
        component: ProfilePage,
        requiresAuth: true,
    },
    {
        path: "chat",
        component: WhatsAppPage,
        requiresAuth: true,
    },
    {
        path: "members",
        component: MemberSubscriptionPage,
        requiresAuth: true,
    },
    {
        path: "wazends",
        component: WazendInstancesPage,
        requiresAuth: true,
    },
    {
        path: "tags",
        component: TagsPage,
        requiresAuth: true,
    },
];
