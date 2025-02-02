import { relations } from 'drizzle-orm'
import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['supervisor', 'user'])

export const userTable = pgTable('user', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'date' })
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	username: varchar().notNull().unique(),
	email: varchar().notNull().unique(),
	password: varchar().notNull(),
	role: roleEnum().default('user'),
})

export const userTableRelations = relations(userTable, ({ many }) => ({
	sessions: many(sessionTable),
	applications: many(userApplicationTable),
}))

export const sessionTable = pgTable('session', {
	id: text().primaryKey(),
	createdAt: timestamp({ withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow(),
	userId: integer()
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp({ withTimezone: true, mode: 'date' }).notNull(),
})

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id],
	}),
}))

export const applicationTable = pgTable('application', {
	id: text().primaryKey(),
	createdAt: timestamp({ withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	name: varchar().unique().notNull(),
	description: text().notNull(),
	img: text().notNull(),
	clientId: text().notNull(),
	callbackUrl: text().notNull(),
	homepageUrl: text().notNull(),
})

export const applicationTableRelations = relations(
	applicationTable,
	({ many }) => ({
		users: many(userApplicationTable),
		clientSecrets: many(applicationClientSecretTable),
	}),
)

export const userApplicationTable = pgTable('user_application', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer()
		.notNull()
		.references(() => userTable.id),
	applicationId: integer()
		.notNull()
		.references(() => applicationTable.id),
})

export const userApplicationTableRelations = relations(
	userApplicationTable,
	({ one }) => ({
		user: one(userTable, {
			fields: [userApplicationTable.userId],
			references: [userTable.id],
		}),
		application: one(applicationTable, {
			fields: [userApplicationTable.applicationId],
			references: [applicationTable.id],
		}),
	}),
)

export const applicationClientSecretTable = pgTable(
	'application_client_secret',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		applicationId: integer()
			.notNull()
			.references(() => applicationTable.id),
		clientSecretId: integer()
			.notNull()
			.references(() => clientSecretTable.id),
	},
)

export const applicationClientSecretTableRelations = relations(
	applicationClientSecretTable,
	({ one }) => ({
		application: one(applicationTable, {
			fields: [applicationClientSecretTable.applicationId],
			references: [applicationTable.id],
		}),
		clientSecret: one(clientSecretTable, {
			fields: [applicationClientSecretTable.clientSecretId],
			references: [clientSecretTable.id],
		}),
	}),
)

export const clientSecretTable = pgTable('client_secret', {
	id: text().primaryKey(),
	createdAt: timestamp({ withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow(),
	usedAt: timestamp({ withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow(),
})

export const clientSecretTableRelations = relations(
	clientSecretTable,
	({ many }) => ({
		applications: many(applicationClientSecretTable),
	}),
)
