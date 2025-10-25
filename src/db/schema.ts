import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').default('free').notNull(),
  settings: jsonb('settings').default('{}').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, {
    onDelete: 'cascade',
  }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'superadmin', 'agency_admin', 'agent', 'customer'
  name: text('name').notNull(),
  isActive: text('is_active').default('true').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inviteTokens = pgTable('invite_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  token: text('token').notNull().unique(),
  email: text('email').notNull(),
  tenantName: text('tenant_name').notNull(),
  role: text('role').default('agency_admin').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  revoked: text('revoked').default('false').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  revokedAt: timestamp('revoked_at'),
});

export const agencies = pgTable('agencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cadastur: text('cadastur').notNull().unique(),
  cnpj: text('cnpj').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencyAddresses = pgTable('agency_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'main', 'branch', 'warehouse'
  address: text('address').notNull(),
  number: text('number').notNull(),
  complement: text('complement'),
  neighborhood: text('neighborhood').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencyPhones = pgTable('agency_phones', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'main', 'mobile', 'fax', 'whatsapp'
  number: text('number').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencyEmails = pgTable('agency_emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencySocials = pgTable('agency_socials', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const boardingLocations = pgTable('boarding_location', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  city: text('city').notNull(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ageRanges = pgTable('age_ranges', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  minAge: integer('min_age').notNull(),
  maxAge: integer('max_age').notNull(),
  occupiesSeat: boolean('occupies_seat').default(true).notNull(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cancellationPolicies = pgTable('cancellation_policies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cancellationPolicyRules = pgTable('cancellation_policy_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  policyId: uuid('policy_id')
    .notNull()
    .references(() => cancellationPolicies.id, { onDelete: 'cascade' }),
  daysBeforeTrip: integer('days_before_trip').notNull(),
  refundPercentage: decimal('refund_percentage', {
    precision: 5,
    scale: 2,
  }).notNull(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const trips = pgTable('trips', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull(),
  destination: text('destination').notNull(),
  mainImageUrl: text('main_image_url'),
  mainImageThumbnailUrl: text('main_image_thumbnail_url'),
  videoUrl: text('video_url'),
  description: text('description'),
  departureDate: timestamp('departure_date').notNull(),
  returnDate: timestamp('return_date').notNull(),
  displayPrice: decimal('display_price', { precision: 10, scale: 2 }),
  displayLabel: text('display_label'),
  totalSeats: integer('total_seats').notNull(),
  reservedSeats: integer('reserved_seats').default(0).notNull(),
  availableSeats: integer('available_seats').notNull(),
  alertLowStockThreshold: integer('alert_low_stock_threshold'),
  alertLastSeatsThreshold: integer('alert_last_seats_threshold'),
  shareableLink: text('shareable_link'),
  status: text('status').default('ACTIVE').notNull(), // 'DRAFT', 'ACTIVE', 'INACTIVE', 'FINISHED', 'CANCELLED'
  allowSeatSelection: boolean('allow_seat_selection').default(false).notNull(),
  acceptsWaitingList: boolean('accepts_waiting_list').default(false).notNull(),
  cancellationPolicyId: uuid('cancellation_policy_id').references(
    () => cancellationPolicies.id,
    { onDelete: 'set null' },
  ),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tripImages = pgTable('trip_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  isMain: boolean('is_main').default(false).notNull(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tripGeneralInfoItems = pgTable('trip_general_info_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tripItems = pgTable('trip_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isIncluded: boolean('is_included').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tripAgePriceGroups = pgTable('trip_age_price_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  ageRangeId: uuid('age_range_id')
    .notNull()
    .references(() => ageRanges.id, { onDelete: 'restrict' }),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  displayOrder: integer('display_order').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  agencies: many(agencies),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  refreshTokens: many(refreshTokens),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const agenciesRelations = relations(agencies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [agencies.tenantId],
    references: [tenants.id],
  }),
  addresses: many(agencyAddresses),
  phones: many(agencyPhones),
  emails: many(agencyEmails),
  socials: many(agencySocials),
  boardingLocations: many(boardingLocations),
  categories: many(categories),
  ageRanges: many(ageRanges),
  cancellationPolicies: many(cancellationPolicies),
  trips: many(trips),
}));

export const agencyAddressesRelations = relations(
  agencyAddresses,
  ({ one }) => ({
    agency: one(agencies, {
      fields: [agencyAddresses.agencyId],
      references: [agencies.id],
    }),
  }),
);

export const agencyPhonesRelations = relations(agencyPhones, ({ one }) => ({
  agency: one(agencies, {
    fields: [agencyPhones.agencyId],
    references: [agencies.id],
  }),
}));

export const agencyEmailsRelations = relations(agencyEmails, ({ one }) => ({
  agency: one(agencies, {
    fields: [agencyEmails.agencyId],
    references: [agencies.id],
  }),
}));

export const agencySocialsRelations = relations(agencySocials, ({ one }) => ({
  agency: one(agencies, {
    fields: [agencySocials.agencyId],
    references: [agencies.id],
  }),
}));

export const boardingLocationsRelations = relations(
  boardingLocations,
  ({ one }) => ({
    agency: one(agencies, {
      fields: [boardingLocations.agencyId],
      references: [agencies.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [categories.agencyId],
    references: [agencies.id],
  }),
  trips: many(trips),
}));

export const ageRangesRelations = relations(ageRanges, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [ageRanges.agencyId],
    references: [agencies.id],
  }),
  tripAgePriceGroups: many(tripAgePriceGroups),
}));

export const cancellationPoliciesRelations = relations(
  cancellationPolicies,
  ({ one, many }) => ({
    agency: one(agencies, {
      fields: [cancellationPolicies.agencyId],
      references: [agencies.id],
    }),
    rules: many(cancellationPolicyRules),
    trips: many(trips),
  }),
);

export const cancellationPolicyRulesRelations = relations(
  cancellationPolicyRules,
  ({ one }) => ({
    policy: one(cancellationPolicies, {
      fields: [cancellationPolicyRules.policyId],
      references: [cancellationPolicies.id],
    }),
  }),
);

export const tripsRelations = relations(trips, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [trips.agencyId],
    references: [agencies.id],
  }),
  category: one(categories, {
    fields: [trips.categoryId],
    references: [categories.id],
  }),
  cancellationPolicy: one(cancellationPolicies, {
    fields: [trips.cancellationPolicyId],
    references: [cancellationPolicies.id],
  }),
  images: many(tripImages),
  generalInfoItems: many(tripGeneralInfoItems),
  items: many(tripItems),
  agePriceGroups: many(tripAgePriceGroups),
}));

export const tripImagesRelations = relations(tripImages, ({ one }) => ({
  trip: one(trips, {
    fields: [tripImages.tripId],
    references: [trips.id],
  }),
}));

export const tripGeneralInfoItemsRelations = relations(
  tripGeneralInfoItems,
  ({ one }) => ({
    trip: one(trips, {
      fields: [tripGeneralInfoItems.tripId],
      references: [trips.id],
    }),
  }),
);

export const tripItemsRelations = relations(tripItems, ({ one }) => ({
  trip: one(trips, {
    fields: [tripItems.tripId],
    references: [trips.id],
  }),
}));

export const tripAgePriceGroupsRelations = relations(
  tripAgePriceGroups,
  ({ one }) => ({
    trip: one(trips, {
      fields: [tripAgePriceGroups.tripId],
      references: [trips.id],
    }),
    ageRange: one(ageRanges, {
      fields: [tripAgePriceGroups.ageRangeId],
      references: [ageRanges.id],
    }),
  }),
);
