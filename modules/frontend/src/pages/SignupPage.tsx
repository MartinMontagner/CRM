import { SignupRequest } from "@/client/AuthClient";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/state/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { signup } from "../service/auth/AuthService";

const signupSchema = z
    .object({
        email: z.string().email("Inserte un correo electronico válido"),
        username: z
            .string()
            .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
            .max(20, "El nombre de usuario no puede exceder 20 caracteres")
            .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos"),
        fullName: z
            .string()
            .min(2, "Ingrese su nombre y apellido")
            .max(50, "El nombre completo no puede exceder 50 caracteres"),
        password: z
            .string()
            .min(8, "La contraseña debe tener al menos 8 caracteres"),
        repeatPassword: z.string().min(1, "Repita la contraseña")
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: "Las contraseñas no coinciden",
        path: ["repeatPassword"],
    });

type SignupSchema = z.infer<typeof signupSchema>;

// Tipos para el componente PasswordInput
interface PasswordInputProps {
    field: ControllerRenderProps<SignupSchema, "password" | "repeatPassword">;
    error: boolean;
    placeholder: string;
}

// Componente personalizado para campos de contraseña con toggle
const PasswordInput = ({ field, error, placeholder, ...props }: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                {...field}
                {...props}
                error={error}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className="pr-10"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
        </div>
    );
};

function SignupPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const authData = useAppStore((state) => state.authData);

    const form = useForm<SignupSchema>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            username: "",
            fullName: "",
            password: "",
            repeatPassword: ""
        },
    });

const onSubmit = useCallback(
    async (data: SignupSchema) => {
        console.log("Signup data:", data);
        const request: SignupRequest = {
            email: data.email,
            username: data.username,
            fullName: data.fullName,
            password: data.password,
        };

        try {
            const response = await signup(request);
            console.log("Signup response:", response);

            if (response.status === 200) {
                navigate(location.state?.from?.pathname || "/", {
                    replace: true,
                });
                toast.success("Cuenta creada exitosamente. Para usar tu cuenta debes esperar la aprobacion de un administrador.");
                return;
            }

        } catch (error: any) {
            console.log("=== SIGNUP ERROR DEBUG ===");
            console.log("Error completo:", error);
            console.log("Error data:", error?.data);
            console.log("Error status:", error?.status);
            console.log("========================");

            let errorCode = "UNKNOWN_ERROR";

            // El error viene como objeto con data, status, etc. (no como AxiosError)
            if (error?.data?.errorCode) {
                errorCode = error.data.errorCode;
            }
            // También verificar si viene como Error normal con message
            else if (error?.message) {
                errorCode = error.message;
            }
            // Por si acaso viene como AxiosError
            else if (error?.response?.data?.errorCode) {
                errorCode = error.response.data.errorCode;
            }

            console.log("ErrorCode final:", errorCode);

            if (errorCode === "EMAIL_IN_USE") {
                toast.error("Error al crear la cuenta, email en uso");
                form.setError(
                    "email",
                    { message: "Email en uso" },
                    { shouldFocus: true },
                );
            } else if (errorCode === "USERNAME_IN_USE") {
                console.log("Entrando en USERNAME_IN_USE");
                toast.error("Error al crear la cuenta, nombre de usuario en uso");
                form.setError(
                    "username",
                    { message: "Nombre de usuario en uso" },
                    { shouldFocus: true },
                );
            } else if (errorCode === "NAME_IN_USE") {
                toast.error("Error al crear la cuenta, nombre en uso");
                form.setError(
                    "fullName",
                    { message: "Nombre completo en uso" },
                    { shouldFocus: true },
                );
            } else {
                console.log("Error no manejado:", errorCode);
                toast.error("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
            }
        }
    },
    [navigate, location, form]
);

    if (authData) {
        return <Navigate to={location.state?.from?.pathname || "/"} replace />;
    }

    return (
        <AuthLayout title={"Registro"}>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex w-full flex-col gap-2"
                >
                    <FormField
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="email">Correo</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        error={
                                            !!fieldState.error ||
                                            fieldState.invalid
                                        }
                                        type="email"
                                        placeholder="Escribe tu correo electrónico"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="username"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="username">Nombre de Usuario</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        error={
                                            !!fieldState.error ||
                                            fieldState.invalid
                                        }
                                        type="text"
                                        placeholder="Elige un nombre de usuario"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="fullName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="fullName">Nombre Completo</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        error={
                                            !!fieldState.error ||
                                            fieldState.invalid
                                        }
                                        type="text"
                                        placeholder="Escribe tu nombre y apellido"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="password">Contraseña</FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        field={field}
                                        error={
                                            !!fieldState.error ||
                                            fieldState.invalid
                                        }
                                        placeholder="Escribe tu contraseña"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="repeatPassword"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormControl>
                                    <PasswordInput
                                        field={field}
                                        error={
                                            !!fieldState.error ||
                                            fieldState.invalid
                                        }
                                        placeholder="Repite tu contraseña"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="w-full pt-2">
                        <Button
                            className="w-full font-semibold bg-primary-600"
                            disabled={form.formState.isSubmitting}
                            type="submit"
                        >
                            Crear Cuenta
                        </Button>
                        <div className="text-sm text-grey-700 font-semibold text-center pt-4">
                            Ya tienes cuenta?{" "}
                            <Button
                                onClick={() => {
                                    navigate("/login");
                                }}
                                type="button"
                                className="px-1 text-grey-700 font-semibold no-underline hover:text-primary-500"
                                variant="link"
                            >
                                Inicia sesión
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    );
}
export default SignupPage;