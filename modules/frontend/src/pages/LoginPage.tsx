/* eslint-disable @typescript-eslint/no-explicit-any */
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/state/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { login } from "../service/auth/AuthService";
import { Eye, EyeOff } from "lucide-react";


const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

type LoginSchema = z.infer<typeof loginSchema>;



function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const authData = useAppStore((state) => state.authData);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const getErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case "USER_DISABLED":
                return "Tu cuenta ha sido deshabilitada. Contacta al administrador para más información.";
            case "USER_NOT_APPROVED":
                return "Tu cuenta está pendiente de aprobación. Contacta al administrador.";
            case "BAD_CREDENTIALS":
                return "Credenciales incorrectas. Verifica tu email y contraseña.";
            default:
                return "Error de autenticación. Intenta nuevamente.";
        }
    };

    const onSubmit = useCallback(
        async (data: LoginSchema) => {
            try {
                const response = await login(data);

                // Con el interceptor original, tanto éxitos como errores llegan aquí
                // Verificamos si es un error por el status code
                if (response.status >= 400) {
                    // Es un error - usamos any para evitar problemas de tipos
                    const errorCode = (response.data as any)?.errorCode || "BAD_CREDENTIALS";
                    const errorMessage = getErrorMessage(errorCode);

                    toast.error(errorMessage);
                    form.setError(
                        "password",
                        { message: errorMessage },
                        { shouldFocus: true },
                    );
                    return;
                }

                // Si llegamos aquí, el login fue exitoso (200-299)
                if (response.status >= 200 && response.status < 300) {
                    navigate(location.state?.from?.pathname || "/", {
                        replace: true,
                    });
                    return;
                }

            } catch {
                // Errores de red o excepciones inesperadas
                const errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente.";
                toast.error(errorMessage);
                form.setError(
                    "password",
                    { message: errorMessage },
                    { shouldFocus: true },
                );
            }
        },
        [navigate, location, form],
    );

    // Función para alternar la visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (authData) {
        return <Navigate to={location.state?.from?.pathname || "/"} replace />;
    }

    return (
        <AuthLayout title="Iniciar sesión">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex w-full flex-col gap-4"
                >
                    <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="email">Correo electrónico</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Escribe tu correo"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="password">Contraseña</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Escribe tu contraseña"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <Eye size={20} className="text-gray-500" />
                                            ) : (
                                                <EyeOff size={20} className="text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="text-center">
                        <Button
                            type="button"
                            className="px-1 py-0 text-grey-700 font-semibold no-underline hover:text-primary-500"
                            variant="link"
                            asChild
                        >
                            <Link to="/recover-password">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </Button>
                    </div>
                    <div className="w-full">
                        <Button
                            className="w-full font-semibold bg-primary-600"
                            disabled={form.formState.isSubmitting}
                            type="submit"
                        >
                            Ingresar
                        </Button>
                        <div className="text-sm text-grey-700 font-semibold text-center pt-4">
                            ¿No tienes cuenta?{" "}
                            <Button
                                onClick={() => {
                                    navigate("/signup");
                                }}
                                type="button"
                                className="px-1 py-0 text-sm text-grey-700 font-semibold no-underline hover:text-primary-500"
                                variant="link"
                            >
                                Registrarse
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    );
}

export default LoginPage;