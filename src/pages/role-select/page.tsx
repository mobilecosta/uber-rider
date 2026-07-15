import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { toast } from "sonner";
import { motion } from "motion/react";
import { cn } from "@/lib/utils.ts";

type RoleType = "passenger" | "driver" | "admin";

function RoleSelectContent() {
  const navigate = useNavigate();
  const setRole = useMutation(api.users.setRole);
  const [selected, setSelected] = useState<RoleType | null>(null);
  const [vehicle, setVehicle] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await setRole({
        role: selected,
        vehicle: selected === "driver" ? vehicle : undefined,
        licensePlate: selected === "driver" ? licensePlate : undefined,
      });
      if (selected === "passenger") navigate("/passenger");
      else if (selected === "driver") navigate("/driver");
      else navigate("/admin");
    } catch {
      toast.error("Erro ao definir perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "passenger" as RoleType,
      emoji: "\uD83D\uDE97",
      title: "Passageiro",
      desc: "Pe\u00E7a corridas r\u00E1pidas para qualquer destino",
      color: "from-blue-500/10 to-blue-500/5 border-blue-500/30",
      selectedColor: "from-blue-500/20 to-blue-500/10 border-blue-500",
    },
    {
      id: "driver" as RoleType,
      emoji: "\uD83D\uDEDE",
      title: "Motorista",
      desc: "Aceite corridas e ganhe dinheiro pelo seu tempo",
      color: "from-green-500/10 to-green-500/5 border-green-500/30",
      selectedColor: "from-green-500/20 to-green-500/10 border-green-500",
    },
    {
      id: "admin" as RoleType,
      emoji: "\uD83D\uDCCA",
      title: "Administrador",
      desc: "Gerencie usu\u00E1rios, corridas e a plataforma",
      color: "from-purple-500/10 to-purple-500/5 border-purple-500/30",
      selectedColor: "from-purple-500/20 to-purple-500/10 border-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Como deseja usar o RideNow?</h1>
          <p className="text-muted-foreground">Escolha seu perfil para come\u00E7ar</p>
        </div>

        <div className="space-y-3">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
              onClick={() => setSelected(role.id)}
              className={cn(
                "w-full p-4 rounded-xl border bg-gradient-to-r text-left transition-all duration-200",
                selected === role.id ? role.selectedColor : role.color,
                "cursor-pointer"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{role.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold text-foreground">{role.title}</div>
                  <div className="text-sm text-muted-foreground">{role.desc}</div>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all",
                  selected === role.id ? "border-foreground bg-foreground" : "border-muted-foreground"
                )}>
                  {selected === role.id && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-background rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {selected === "driver" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 bg-card border rounded-xl p-4"
          >
            <p className="font-semibold text-sm text-foreground">Informa\u00E7\u00F5es do ve\u00EDculo</p>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Modelo do carro</Label>
              <Input
                id="vehicle"
                placeholder="Ex: Honda Civic 2022"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                placeholder="Ex: ABC-1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>
          </motion.div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={!selected || loading || (selected === "driver" && (!vehicle || !licensePlate))}
          className="w-full h-12 font-bold text-base rounded-xl"
        >
          {loading ? "Salvando..." : "Confirmar perfil"}
        </Button>
      </motion.div>
    </div>
  );
}

export default function RoleSelect() {
  return (
    <>
      <Authenticated>
        <RoleSelectContent />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <SignInButton />
        </div>
      </Unauthenticated>
    </>
  );
}
