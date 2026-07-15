import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { motion } from "motion/react";

function HomeRedirect() {
  const user = useQuery(api.users.getCurrentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === undefined) return;
    if (!user?.role) {
      navigate("/role-select");
    } else if (user.role === "passenger") {
      navigate("/passenger");
    } else if (user.role === "driver") {
      navigate("/driver");
    } else if (user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Skeleton className="h-10 w-40" />
    </div>
  );
}

export default function Index() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Skeleton className="h-10 w-40" />
        </div>
      </AuthLoading>
      <Authenticated>
        <HomeRedirect />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen bg-background flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8 max-w-lg"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M6 22L16 8L26 22" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="16" cy="20" r="3" fill="white"/>
                  </svg>
                </div>
                <span className="text-4xl font-black tracking-tight text-foreground">RideNow</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-black leading-tight text-balance text-foreground">
                  Sua corrida,<br />
                  <span className="text-accent">do seu jeito</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Peça uma corrida, seja motorista ou administre a plataforma. Tudo em um só lugar.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
              >
                <SignInButton className="w-full h-14 text-base font-bold rounded-xl" />
              </motion.div>

              <p className="text-sm text-muted-foreground">
                Ao entrar, você concorda com nossos termos de uso.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className="px-6 pb-10 grid grid-cols-3 gap-4 max-w-lg mx-auto w-full"
          >
            {[
              { icon: "🚗", label: "Passageiro", desc: "Peça corridas" },
              { icon: "🛞", label: "Motorista", desc: "Ganhe dinheiro" },
              { icon: "📊", label: "Admin", desc: "Gerencie tudo" },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-xl p-4 text-center space-y-1">
                <div className="text-2xl">{item.icon}</div>
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </Unauthenticated>
    </>
  );
}
