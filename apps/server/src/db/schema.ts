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
