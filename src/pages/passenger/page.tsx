import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { toast } from "sonner";
import { motion } from "motion/react";
import { MapPin, Navigation, Clock, DollarSign, LogOut, History } from "lucide-react";

const MOCK_RIDES = [
  { origin: "Centro", destination: "Aeroporto", distance: "18 km", duration: "25 min", price: 42 },
  { origin: "Shopping", destination: "Universidade", distance: "7 km", duration: "12 min", price: 18 },
  { origin: "Hospital", destination: "Rodovi\u00E1ria", distance: "11 km", duration: "18 min", price: 27 },
];

function PassengerContent() {
  const { signout } = useAuth();
  const user = useQuery(api.users.getCurrentUser);
  const activeRide = useQuery(api.rides.getActiveRide);
  const history = useQuery(api.rides.getRideHistory);
  const requestRide = useMutation(api.rides.requestRide);
  const cancelRide = useMutation(api.rides.cancelRide);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"home" | "history">("home");

  const priceEstimate = origin && destination
    ? Math.floor(Math.random() * 30 + 15)
    : null;

  const options = origin && destination
    ? [
        { label: "RideX", price: priceEstimate!, distance: "~12 km", duration: "~18 min", icon: "\uD83D\uDE97" },
        { label: "RideXL", price: (priceEstimate ?? 0) + 10, distance: "~12 km", duration: "~20 min", icon: "\uD83D\uDE99" },
        { label: "Moto", price: Math.floor((priceEstimate ?? 0) * 0.6), distance: "~12 km", duration: "~12 min", icon: "\uD83C\uDFCD\uFE0F" },
      ]
    : [];

  const handleRequest = async () => {
    if (selectedOption === null || !origin || !destination) return;
    const opt = options[selectedOption];
    setLoading(true);
    try {
      await requestRide({
        origin,
        destination,
        price: opt.price,
        distance: opt.distance,
        duration: opt.duration,
      });
      toast.success("Corrida solicitada! Aguardando motorista...");
      setOrigin("");
      setDestination("");
      setSelectedOption(null);
    } catch {
      toast.error("Erro ao solicitar corrida");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!activeRide) return;
    try {
      await cancelRide({ rideId: activeRide._id, reason: "Cancelado pelo passageiro" });
      toast.info("Corrida cancelada");
    } catch {
      toast.error("Erro ao cancelar");
    }
  };

  const statusLabel: Record<string, string> = {
    searching: "Buscando motorista...",
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

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-foreground text-background px-5 py-4 flex items-center justify-between">
        <div>
          <div className="font-black text-lg">RideNow</div>
          <div className="text-xs opacity-70">{user?.name ?? "Passageiro"}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/10 text-background text-xs">Passageiro</Badge>
          <Button variant="ghost" size="icon" className="text-background hover:bg-white/10" onClick={() => signout()}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex border-b border-border">
        {[
          { id: "home", label: "Pedir corrida" },
          { id: "history", label: "Hist\u00F3rico" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "home" | "history")}
            className={`flex-1 py-3 text-sm font-semibold cursor-pointer transition-colors ${
              tab === t.id ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {tab === "home" ? (
          <>
            {activeRide && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-2 border-accent">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Corrida ativa</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColor[activeRide.status]}`}>
                        {statusLabel[activeRide.status]}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {activeRide.origin}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Navigation className="w-4 h-4" /> {activeRide.destination}</div>
                    </div>
                    {"driver" in activeRide && activeRide.driver && (
                      <div className="bg-secondary rounded-lg p-3 text-sm">
                        <div className="font-semibold">{activeRide.driver.name}</div>
                        <div className="text-muted-foreground">{activeRide.driver.vehicle} \u2022 {activeRide.driver.licensePlate}</div>
                      </div>
                    )}
                    {(activeRide.status === "searching" || activeRide.status === "accepted") && (
                      <Button variant="destructive" className="w-full" onClick={handleCancel}>Cancelar corrida</Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!activeRide && (
              <>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Para onde vamos?</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label>Origem</Label>
                      <Input placeholder="De onde voc\u00EA est\u00E1?" value={origin} onChange={(e) => { setOrigin(e.target.value); setSelectedOption(null); }} />
                    </div>
                    <div className="space-y-1">
                      <Label>Destino</Label>
                      <Input placeholder="Para onde vai?" value={destination} onChange={(e) => { setDestination(e.target.value); setSelectedOption(null); }} />
                    </div>
                  </CardContent>
                </Card>

                {!origin && !destination && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground px-1">Destinos populares</p>
                    {MOCK_RIDES.map((r, i) => (
                      <button key={i} className="w-full text-left bg-card border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-secondary transition-colors" onClick={() => { setOrigin(r.origin); setDestination(r.destination); }}>
                        <Navigation className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="text-sm font-medium">{r.origin} \u2192 {r.destination}</div>
                          <div className="text-xs text-muted-foreground">{r.distance} \u2022 {r.duration}</div>
                        </div>
                        <div className="ml-auto text-sm font-bold">R${r.price}</div>
                      </button>
                    ))}
                  </div>
                )}

                {options.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground px-1">Escolha o tipo</p>
                    {options.map((opt, i) => (
                      <button key={i} onClick={() => setSelectedOption(i)} className={`w-full text-left rounded-xl border p-3 flex items-center gap-3 cursor-pointer transition-all ${ selectedOption === i ? "border-foreground bg-secondary" : "border-border bg-card" }`}>
                        <span className="text-2xl">{opt.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.distance} \u2022 {opt.duration}</div>
                        </div>
                        <div className="font-bold">R${opt.price}</div>
                      </button>
                    ))}
                    <Button className="w-full h-12 font-bold rounded-xl" disabled={selectedOption === null || loading} onClick={handleRequest}>
                      {loading ? "Solicitando..." : "Solicitar corrida"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Suas \u00FAltimas corridas</p>
            {history === undefined ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhuma corrida ainda</p>
              </div>
            ) : (
              history.map((ride) => (
                <div key={ride._id} className="bg-card border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" /> {ride.origin}</div>
                      <div className="flex items-center gap-1 text-muted-foreground"><Navigation className="w-3 h-3" /> {ride.destination}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">R${ride.price}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[ride.status]}`}>{statusLabel[ride.status]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ride.duration}</span>
                    <span>{ride.distance}</span>
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

export default function PassengerDashboard() {
  return (
    <>
      <Authenticated><PassengerContent /></Authenticated>
      <Unauthenticated><div className="min-h-screen flex items-center justify-center"><SignInButton /></div></Unauthenticated>
    </>
  );
}
