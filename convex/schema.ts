import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("passenger"), v.literal("driver"), v.literal("admin"))),
    // Driver-specific
    isOnline: v.optional(v.boolean()),
    vehicle: v.optional(v.string()),
    licensePlate: v.optional(v.string()),
    rating: v.optional(v.number()),
    totalRides: v.optional(v.number()),
    totalEarnings: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_role", ["role"]),

  rides: defineTable({
    passengerId: v.id("users"),
    driverId: v.optional(v.id("users")),
    origin: v.string(),
    destination: v.string(),
    status: v.union(
      v.literal("searching"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    price: v.optional(v.number()),
    distance: v.optional(v.string()),
    duration: v.optional(v.string()),
    cancelReason: v.optional(v.string()),
  })
    .index("by_passenger", ["passengerId"])
    .index("by_driver", ["driverId"])
    .index("by_status", ["status"]),
});
