import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { setPassword } from "@/service/user/UserService";
import { useAppStore } from "@/state/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const changePasswordSchema = z
    .object({
        currPassword: z.string().min(1, "Inserte su contraseña actual"),
        newPassword: z.string().min(1, "Inserte su nueva contraseña"),
        repeatPassword: z.string().min(1, "Repita su nueva contraseña"),
    })
    .refine((data) => data.newPassword === data.repeatPassword, {
        message: "Las contraseñas no coinciden",
        path: ["repeatPassword"],
    });

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

function PasswordChangeForm() {
    const form = useForm<ChangePasswordSchema>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currPassword: "",
            newPassword: "",
            repeatPassword: "",
        },
    });

    const authData = useAppStore((state) => state.authData);

    const onSubmit: SubmitHandler<ChangePasswordSchema> = async (e) => {

        if (!authData) {
            console.error("No hay datos de autenticación disponibles.");
            toast.error("Error: No se puede cambiar la contraseña sin iniciar sesión.");
            return;
        }

        const res = await setPassword(authData, e.currPassword, e.newPassword);

        if (!(res instanceof AxiosError) && res.status === 200) {
            form.reset();
            toast.success("Contraseña actualizada");
            return;
        }

        if (res.data === "WRONG_CURRENT_PASSWORD") {
            form.setError(
                "currPassword",
                { message: "Contraseña actual incorrecta" },
                { shouldFocus: true },
            );
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-2 max-w-screen-sm"
            >
                <FormField
                    name="currPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    {...field}
                                    error={
                                        !!fieldState.error || fieldState.invalid
                                    }
                                    type="password"
                                    placeholder="Contraseña actual"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="newPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    {...field}
                                    error={
                                        !!fieldState.error || fieldState.invalid
                                    }
                                    type="password"
                                    placeholder="Contraseña nueva"
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
                                        !!fieldState.error || fieldState.invalid
                                    }
                                    type="password"
                                    placeholder="Repetir contraseña"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    className="w-full font-semibold"
                    disabled={form.formState.isSubmitting}
                    type="submit"
                >
                    Cambiar contraseña
                </Button>
            </form>
        </Form>
    );
}

export default PasswordChangeForm;
