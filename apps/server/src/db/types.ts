import { sessionTable, userTable } from './schema.js'

type Session = typeof sessionTable.$inferSelect
type User = typeof userTable.$inferSelect

export type { Session, User }
