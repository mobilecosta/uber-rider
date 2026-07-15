import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { toast } from "sonner";
import { Users, Car, DollarSign, Activity, LogOut, ShieldCheck, UserX, UserCheck } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

function AdminContent() {
  const { signout } = useAuth();
  const users = useQuery(api.users.getAllUsers);
  const rides = useQuery(api.rides.getAllRides);
  const setUserActive = useMutation(api.users.setUserActive);
  const [tab, setTab] = useState<"overview" | "users" | "rides">("overview");
  const [roleFilter, setRoleFilter] = useState<"all" | "passenger" | "driver">("all");

  const handleToggleActive = async (userId: Id<"users">, isActive: boolean) => {
    try {
      await setUserActive({ userId, isActive: !isActive });
      toast.success(isActive ? "Usu\u00E1rio desativado" : "Usu\u00E1rio ativado");
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  const statusColor: Record<string, string> = {
    searching: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    accepted: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    in_progress: "bg-green-500/10 text-green-600 border-green-500/30",
    completed: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  const statusLabel: Record<string, string> = {
    searching: "Buscando",
    accepted: "Aceita",
    in_progress: "Em viagem",
    completed: "Conclu\u00EDda",
    cancelled: "Cancelada",
  };

  const totalRides = rides?.length ?? 0;
  const completedRides = rides?.filter(r => r.status === "completed").length ?? 0;
  const totalRevenue = rides?.filter(r => r.status === "completed").reduce((acc, r) => acc + (r.price ?? 0), 0) ?? 0;
  const activeDrivers = users?.filter(u => u.role === "driver" && u.isOnline).length ?? 0;
  const totalPassengers = users?.filter(u => u.role === "passenger").length ?? 0;
  const totalDrivers = users?.filter(u => u.role === "driver").length ?? 0;

  const filteredUsers = users?.filter(u => {
    if (roleFilter === "all") return u.role === "passenger" || u.role === "driver";
    return u.role === roleFilter;
  }) ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-foreground text-background px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <div>
            <div className="font-black text-lg">RideNow Admin</div>
            <div className="text-xs opacity-70">Painel de controle</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-background hover:bg-white/10" onClick={() => signout()}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex border-b border-border">
        {[
          { id: "overview", label: "Vis\u00E3o geral" },
          { id: "users", label: "Usu\u00E1rios" },
          { id: "rides", label: "Corridas" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as "overview" | "users" | "rides")} className={`flex-1 py-3 text-sm font-semibold cursor-pointer transition-colors ${ tab === t.id ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground" }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
        {tab === "overview" && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Resumo da plataforma</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Car, label: "Motoristas online", value: activeDrivers, color: "text-green-600" },
                { icon: Users, label: "Passageiros", value: totalPassengers, color: "text-blue-600" },
                { icon: Activity, label: "Total de corridas", value: totalRides, color: "text-purple-600" },
                { icon: DollarSign, label: "Receita total", value: `R$${totalRevenue.toFixed(0)}`, color: "text-accent-foreground" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-4">
                    <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                    <div className="font-black text-2xl">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Resumo de corridas</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Corridas conclu\u00EDdas", value: completedRides, color: "bg-green-500" },
                  { label: "Em andamento", value: rides?.filter(r => r.status === "in_progress" || r.status === "accepted").length ?? 0, color: "bg-blue-500" },
                  { label: "Buscando motorista", value: rides?.filter(r => r.status === "searching").length ?? 0, color: "bg-yellow-500" },
                  { label: "Canceladas", value: rides?.filter(r => r.status === "cancelled").length ?? 0, color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="font-bold text-sm">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Motoristas</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total de motoristas</span><span className="font-bold">{totalDrivers}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Online agora</span><span className="font-bold text-green-600">{activeDrivers}</span></div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(["all", "passenger", "driver"] as const).map((r) => (
                <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${ roleFilter === r ? "bg-foreground text-background" : "bg-secondary text-foreground" }`}>
                  {r === "all" ? "Todos" : r === "passenger" ? "Passageiros" : "Motoristas"}
                </button>
              ))}
            </div>
            {users === undefined ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl w-full" />)
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum usu\u00E1rio encontrado</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="bg-card border rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
                    {user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{user.name ?? "Sem nome"}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{user.role === "passenger" ? "Passageiro" : user.role === "driver" ? "Motorista" : "Admin"}</Badge>
                      {user.role === "driver" && (
                        <span className={`text-xs ${user.isOnline ? "text-green-600" : "text-muted-foreground"}`}>{user.isOnline ? "\u25CF Online" : "\u25CB Offline"}</span>
                      )}
                    </div>
                  </div>
                  {user.role !== "admin" && (
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleToggleActive(user._id, user.isActive ?? true)}>
                      {user.isActive !== false ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "rides" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Todas as corridas</p>
            {rides === undefined ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl w-full" />)
            ) : rides.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Car className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhuma corrida ainda</p>
              </div>
            ) : (
              rides.map((ride) => (
                <div key={ride._id} className="bg-card border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm space-y-0.5">
                      <div className="text-muted-foreground">{ride.origin} \u2192 {ride.destination}</div>
                      <div className="text-xs text-muted-foreground">\uD83D\uDC64 {ride.passengerName} \u00B7 \uD83D\uDE97 {ride.driverName}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="font-bold text-sm">R${ride.price ?? 0}</div>
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

export default function AdminDashboard() {
  return (
    <>
      <Authenticated><AdminContent /></Authenticated>
      <Unauthenticated><div className="min-h-screen flex items-center justify-center"><SignInButton /></div></Unauthenticated>
    </>
  );
}
