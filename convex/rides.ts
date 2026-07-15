import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const requestRide = mutation({
  args: {
    origin: v.string(),
    destination: v.string(),
    price: v.number(),
    distance: v.string(),
    duration: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });

    return await ctx.db.insert("rides", {
      passengerId: user._id,
      origin: args.origin,
      destination: args.destination,
      status: "searching",
      price: args.price,
      distance: args.distance,
      duration: args.duration,
    });
  },
});

export const acceptRide = mutation({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });

    const driver = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!driver || driver.role !== "driver") throw new ConvexError({ message: "Forbidden", code: "FORBIDDEN" });

    const ride = await ctx.db.get(args.rideId);
    if (!ride || ride.status !== "searching") throw new ConvexError({ message: "Ride not available", code: "BAD_REQUEST" });

    await ctx.db.patch(args.rideId, { driverId: driver._id, status: "accepted" });
  },
});

export const startRide = mutation({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });

    const driver = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!driver) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" });

    const ride = await ctx.db.get(args.rideId);
    if (!ride || ride.driverId !== driver._id) throw new ConvexError({ message: "Forbidden", code: "FORBIDDEN" });

    await ctx.db.patch(args.rideId, { status: "in_progress" });
  },
});

export const completeRide = mutation({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });

    const driver = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!driver) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" });

    const ride = await ctx.db.get(args.rideId);
    if (!ride || ride.driverId !== driver._id) throw new ConvexError({ message: "Forbidden", code: "FORBIDDEN" });

    await ctx.db.patch(args.rideId, { status: "completed" });

    await ctx.db.patch(driver._id, {
      totalRides: (driver.totalRides ?? 0) + 1,
      totalEarnings: (driver.totalEarnings ?? 0) + (ride.price ?? 0) * 0.8,
    });
  },
});

export const cancelRide = mutation({
  args: { rideId: v.id("rides"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });

    const ride = await ctx.db.get(args.rideId);
    if (!ride) throw new ConvexError({ message: "Not found", code: "NOT_FOUND" });

    await ctx.db.patch(args.rideId, { status: "cancelled", cancelReason: args.reason });
  },
});

export const getActiveRide = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    if (user.role === "passenger") {
      const rides = await ctx.db
        .query("rides")
        .withIndex("by_passenger", (q) => q.eq("passengerId", user._id))
        .order("desc")
        .collect();

      const active = rides.find((r) =>
        r.status === "searching" || r.status === "accepted" || r.status === "in_progress"
      );
      if (!active) return null;

      const driver = active.driverId ? await ctx.db.get(active.driverId) : null;
      return { ...active, driver };
    }

    if (user.role === "driver") {
      const rides = await ctx.db
        .query("rides")
        .withIndex("by_driver", (q) => q.eq("driverId", user._id))
        .order("desc")
        .collect();

      const active = rides.find((r) =>
        r.status === "accepted" || r.status === "in_progress"
      );
      if (!active) return null;

      const passenger = await ctx.db.get(active.passengerId);
      return { ...active, passenger };
    }

    return null;
  },
});

export const getSearchingRides = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("rides")
      .withIndex("by_status", (q) => q.eq("status", "searching"))
      .order("desc")
      .take(20);
  },
});

export const getRideHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    if (user.role === "passenger") {
      return await ctx.db
        .query("rides")
        .withIndex("by_passenger", (q) => q.eq("passengerId", user._id))
        .order("desc")
        .take(50);
    }

    if (user.role === "driver") {
      return await ctx.db
        .query("rides")
        .withIndex("by_driver", (q) => q.eq("driverId", user._id))
        .order("desc")
        .take(50);
    }

    return [];
  },
});

export const getAllRides = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const self = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (self?.role !== "admin") return [];

    const rides = await ctx.db.query("rides").order("desc").take(200);

    return await Promise.all(
      rides.map(async (ride) => {
        const passenger = await ctx.db.get(ride.passengerId);
        const driver = ride.driverId ? await ctx.db.get(ride.driverId) : null;
        return { ...ride, passengerName: passenger?.name ?? "Unknown", driverName: driver?.name ?? "—" };
      })
    );
  },
});
