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
import { recoverPassword } from "@/service/user/UserService";
import { useAppStore } from "@/state/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const recoverPasswordSchema = z.object({
    email: z.string().email("Inserte un correo electronico válido"),
});

type RecoverPasswordSchema = z.infer<typeof recoverPasswordSchema>;

function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const authData = useAppStore((state) => state.authData);

    const form = useForm<RecoverPasswordSchema>({
        resolver: zodResolver(recoverPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = useCallback(
        async (data: RecoverPasswordSchema) => {
            const response = await recoverPassword(data.email);
            if (response.status === 200) {
                navigate("/login");
                toast.success(
                    "Revisa tu mail para ver las instrucciones y recuperar tu contraseña",
                    { duration: 2000 },
                );
                return;
            }
            toast.error("Error recuperando contraseña!");
        },
        [navigate],
    );

    if (authData) {
        return <Navigate to={location.state?.from?.pathname || "/"} replace />;
    }

    return (
        <AuthLayout title="Recuperar contraseña">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex w-full flex-col gap-6"
                >
                    <FormField
                        name="email"
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
                                        type="email"
                                        placeholder="Correo electrónico"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="w-full pt-2">
                        <Button
                            className="w-full bg-primary-600 font-semibold"
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
