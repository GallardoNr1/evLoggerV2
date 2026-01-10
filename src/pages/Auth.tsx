import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const authSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  displayName: z.string().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "reset" ? "reset" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signIn, signUp, resetPassword } = useAuth();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  // Check if we're in password reset mode (coming from email link)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");
    
    if (type === "recovery" && accessToken) {
      setMode("reset");
    }
  }, []);

  // Redirect if already logged in (but not during password reset)
  useEffect(() => {
    if (!loading && user && mode !== "reset") {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, mode]);

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(values.email);
        
        if (error) {
          handleAuthError(error);
          return;
        }

        toast.success("Te hemos enviado un email para restablecer tu contraseña", { 
          position: "top-center",
          duration: 5000,
        });
        setMode("login");
      } else if (mode === "reset") {
        // Update password for logged-in user (coming from recovery email)
        const { error } = await supabase.auth.updateUser({
          password: values.password,
        });
        
        if (error) {
          handleAuthError(error);
          return;
        }

        toast.success("Contraseña actualizada correctamente", { position: "top-center" });
        navigate("/", { replace: true });
      } else if (mode === "login") {
        const { error } = await signIn(values.email, values.password);
        
        if (error) {
          handleAuthError(error);
          return;
        }

        toast.success("¡Bienvenido de nuevo!", { position: "top-center" });
        navigate("/", { replace: true });
      } else if (mode === "signup") {
        const { error } = await signUp(
          values.email,
          values.password,
          values.displayName
        );
        
        if (error) {
          handleAuthError(error);
          return;
        }

        toast.success("Cuenta creada correctamente", { position: "top-center" });
        navigate("/", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes("already registered") || message.includes("already exists")) {
      toast.error("Este email ya está registrado", { position: "top-center" });
    } else if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
      toast.error("Email o contraseña incorrectos", { position: "top-center" });
    } else if (message.includes("email not confirmed")) {
      toast.error("Confirma tu email antes de iniciar sesión", { position: "top-center" });
    } else {
      toast.error(error.message, { position: "top-center" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-7 w-7 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">EVLogger</span>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg">
        {(mode === "forgot" || mode === "reset") && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        )}

        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "login" && "Iniciar sesión"}
            {mode === "signup" && "Crear cuenta"}
            {mode === "forgot" && "Recuperar contraseña"}
            {mode === "reset" && "Nueva contraseña"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" && "Accede a tu cuenta para sincronizar datos"}
            {mode === "signup" && "Regístrate para guardar tus datos en la nube"}
            {mode === "forgot" && "Te enviaremos un email para restablecer tu contraseña"}
            {mode === "reset" && "Introduce tu nueva contraseña"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === "signup" && (
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      Nombre
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre"
                        className="h-12 rounded-xl border-border bg-secondary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      className="h-12 rounded-xl border-border bg-secondary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(mode !== "forgot") && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      {mode === "reset" ? "Nueva contraseña" : "Contraseña"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 rounded-xl border-border bg-secondary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="glow"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === "login" && "Entrando..."}
                  {mode === "signup" && "Creando cuenta..."}
                  {mode === "forgot" && "Enviando..."}
                  {mode === "reset" && "Actualizando..."}
                </>
              ) : (
                <>
                  {mode === "login" && "Iniciar sesión"}
                  {mode === "signup" && "Crear cuenta"}
                  {mode === "forgot" && "Enviar email"}
                  {mode === "reset" && "Actualizar contraseña"}
                </>
              )}
            </Button>
          </form>
        </Form>

        {mode !== "forgot" && mode !== "reset" && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                form.reset();
              }}
              className="text-sm text-primary hover:underline"
            >
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground">
        Tus datos locales se sincronizarán con la nube
      </p>
    </div>
  );
};

export default Auth;
