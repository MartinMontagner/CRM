import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/service/user/UserService";
import { useAppStore } from "@/state/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import {
    Navigate,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "La contraseña debe tener al menos 8 caracteres"),
        repeatPassword: z.string().min(1, "Repita la contraseña"),
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: "Las contraseñas no coinciden",
        path: ["repeatPassword"],
    });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const authData = useAppStore((state) => state.authData);
    const { code } = useParams();
    console.log(code);
    const form = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", repeatPassword: "" },
    });

    const onSubmit = useCallback(
        async (data: ResetPasswordSchema) => {
            if (!code) {
                return;
            }
            const response = await resetPassword(data.password, code);
            if (response.status === 200) {
                navigate("/login");
                toast.success("Contraseña cambiada exitosamente");
                return;
            }
            if (response.data === "EXPIRED_TOKEN") {
                toast.error(
                    "Este link ha caducado, vuelva a recuperar contraseña",
                );
                navigate("/login");
                return;
            }
            toast.error("Error cambiando la contraseña!");
        },
        [navigate, code],
    );

    if (authData || !code) {
        return <Navigate to={location.state?.from?.pathname || "/"} replace />;
    }

    return (
        <AuthLayout title="Cambiar contraseña">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex w-full flex-col gap-6"
                >
                    <FormField
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        error={
                                            !!fieldState.error ||
                                            fieldState.invalid
                                        }
                                        type="password"
                                        placeholder="Nueva contraseña"
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
                                    <Input
                                        {...field}
                                        error={
                                            !!fieldState.error ||
                                            fieldState.invalid
                                        }
                                        type="password"
                                        placeholder="Repite contraseña"
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
                            Cambiar contraseña
                        </Button>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    );
}
export default ResetPasswordPage;
