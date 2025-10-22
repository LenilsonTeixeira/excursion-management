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

export const tripCategories = pgTable('trip_categories', {
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
  tripCategories: many(tripCategories),
  ageRanges: many(ageRanges),
  cancellationPolicies: many(cancellationPolicies),
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

export const tripCategoriesRelations = relations(tripCategories, ({ one }) => ({
  agency: one(agencies, {
    fields: [tripCategories.agencyId],
    references: [agencies.id],
  }),
}));

export const ageRangesRelations = relations(ageRanges, ({ one }) => ({
  agency: one(agencies, {
    fields: [ageRanges.agencyId],
    references: [agencies.id],
  }),
}));

export const cancellationPoliciesRelations = relations(
  cancellationPolicies,
  ({ one, many }) => ({
    agency: one(agencies, {
      fields: [cancellationPolicies.agencyId],
      references: [agencies.id],
    }),
    rules: many(cancellationPolicyRules),
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
