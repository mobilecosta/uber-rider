import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation, Clock, DollarSign, LogOut, History, Star, TrendingUp } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

function DriverContent() {
  const { signout } = useAuth();
  const user = useQuery(api.users.getCurrentUser);
  const activeRide = useQuery(api.rides.getActiveRide);
  const searchingRides = useQuery(api.rides.getSearchingRides);
  const history = useQuery(api.rides.getRideHistory);
  const setOnline = useMutation(api.users.setDriverOnline);
  const acceptRide = useMutation(api.rides.acceptRide);
  const startRide = useMutation(api.rides.startRide);
  const completeRide = useMutation(api.rides.completeRide);

  const [tab, setTab] = useState<"home" | "history">("home");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleOnline = async (val: boolean) => {
    try {
      await setOnline({ isOnline: val });
      toast.success(val ? "Voc\u00EA est\u00E1 online!" : "Voc\u00EA foi offline");
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  const handleAccept = async (rideId: Id<"rides">) => {
    setActionLoading(rideId);
    try {
      await acceptRide({ rideId });
      toast.success("Corrida aceita!");
    } catch {
      toast.error("Corrida indispon\u00EDvel");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (rideId: Id<"rides">) => {
    setActionLoading(rideId);
    try {
      await startRide({ rideId });
      toast.success("Viagem iniciada!");
    } catch {
      toast.error("Erro ao iniciar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (rideId: Id<"rides">) => {
    setActionLoading(rideId);
    try {
      await completeRide({ rideId });
      toast.success("Corrida conclu\u00EDda!");
    } catch {
      toast.error("Erro ao concluir");
    } finally {
      setActionLoading(null);
    }
  };

  const statusLabel: Record<string, string> = {
    searching: "Buscando motorista",
    accepted: "Motorista a caminho",
    in_progress: "Em viagem",
    completed: "Conclu\u00EDda",
    cancelled: "Cancelada",
  };

  const statusColor: Record<string, string> = {
    searching: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    accepted: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    in_progress: "bg-green-500/10 text-green-600 border-green-500/30",
    completed: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  if (user === undefined) return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-10 w-40" /></div>;

  const earnings = user?.totalEarnings ?? 0;
  const rides = user?.totalRides ?? 0;
  const rating = user?.rating ?? 5.0;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-foreground text-background px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-black text-lg">RideNow</div>
            <div className="text-xs opacity-70">{user?.name ?? "Motorista"}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/10 text-background text-xs">Motorista</Badge>
            <Button variant="ghost" size="icon" className="text-background hover:bg-white/10" onClick={() => signout()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
          <Switch id="online" checked={user?.isOnline ?? false} onCheckedChange={handleToggleOnline} />
          <Label htmlFor="online" className="text-background cursor-pointer">
            {user?.isOnline ? "\uD83D\uDFE2 Online \u2014 recebendo corridas" : "\u26AB Offline"}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-border">
        {[
          { icon: DollarSign, label: "Ganhos", value: `R$${earnings.toFixed(0)}` },
          { icon: TrendingUp, label: "Corridas", value: rides },
          { icon: Star, label: "Avalia\u00E7\u00E3o", value: rating.toFixed(1) },
        ].map((s) => (
          <div key={s.label} className="py-3 text-center border-r border-border last:border-0">
            <div className="font-black text-lg">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {user?.vehicle && (
        <div className="px-4 py-2 bg-secondary text-xs text-muted-foreground flex items-center gap-2">
          <span>\uD83D\uDE97</span>
          <span>{user.vehicle}</span>
          {user.licensePlate && <span className="font-mono font-bold text-foreground">{user.licensePlate}</span>}
        </div>
      )}

      <div className="flex border-b border-border">
        {[
          { id: "home", label: "Corridas" },
          { id: "history", label: "Hist\u00F3rico" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as "home" | "history")} className={`flex-1 py-3 text-sm font-semibold cursor-pointer transition-colors ${ tab === t.id ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground" }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {tab === "home" ? (
          <>
            {activeRide && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-2 border-green-500/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Corrida atual</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColor[activeRide.status]}`}>{statusLabel[activeRide.status]}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {activeRide.origin}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Navigation className="w-4 h-4" /> {activeRide.destination}</div>
                    </div>
                    {"passenger" in activeRide && activeRide.passenger && (
                      <div className="bg-secondary rounded-lg p-3 text-sm">
                        <div className="font-semibold">{activeRide.passenger.name ?? "Passageiro"}</div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" />{activeRide.duration}</span>
                      <span className="font-bold text-green-600">R${activeRide.price}</span>
                    </div>
                    {activeRide.status === "accepted" && (
                      <Button className="w-full" onClick={() => handleStart(activeRide._id)} disabled={actionLoading === activeRide._id}>Iniciar viagem</Button>
                    )}
                    {activeRide.status === "in_progress" && (
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleComplete(activeRide._id)} disabled={actionLoading === activeRide._id}>Concluir corrida</Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!activeRide && (
              <>
                {!user?.isOnline ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-4xl mb-3">\u26AB</div>
                    <p className="font-semibold">Voc\u00EA est\u00E1 offline</p>
                    <p className="text-sm">Fique online para receber corridas</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground">Corridas dispon\u00EDveis</p>
                    <AnimatePresence>
                      {searchingRides === undefined ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
                      ) : searchingRides.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <div className="text-3xl mb-2">\uD83D\uDD0D</div>
                          <p className="font-semibold">Nenhuma corrida no momento</p>
                          <p className="text-sm">Aguarde novos pedidos...</p>
                        </div>
                      ) : (
                        searchingRides.map((ride) => (
                          <motion.div key={ride._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <Card>
                              <CardContent className="pt-4 space-y-3">
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 text-blue-500" /> {ride.origin}</div>
                                  <div className="flex items-center gap-2 text-muted-foreground"><Navigation className="w-4 h-4 text-green-500" /> {ride.destination}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ride.duration}</span>
                                    <span>{ride.distance}</span>
                                  </div>
                                  <span className="font-bold text-green-600">R${ride.price}</span>
                                </div>
                                <Button className="w-full" onClick={() => handleAccept(ride._id)} disabled={actionLoading === ride._id}>
                                  {actionLoading === ride._id ? "Aceitando..." : "Aceitar corrida"}
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Suas corridas realizadas</p>
            {history === undefined ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : history.filter(r => r.status === "completed" || r.status === "cancelled").length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhuma corrida ainda</p>
              </div>
            ) : (
              history.filter(r => r.status === "completed" || r.status === "cancelled").map((ride) => (
                <div key={ride._id} className="bg-card border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" /> {ride.origin}</div>
                      <div className="flex items-center gap-1 text-muted-foreground"><Navigation className="w-3 h-3" /> {ride.destination}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-green-600">+R${((ride.price ?? 0) * 0.8).toFixed(0)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[ride.status]}`}>{statusLabel[ride.status]}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  return (
    <>
      <Authenticated><DriverContent /></Authenticated>
      <Unauthenticated><div className="min-h-screen flex items-center justify-center"><SignInButton /></div></Unauthenticated>
    </>
  );
}
