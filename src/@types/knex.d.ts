// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      created_at?: string
      updated_at?: string
    }
    meals: {
      id: string
      name: string
      description: string
      diet: boolean
      date: string
      user_id: string
      created_at?: string
      updated_at?: string
    }
  }
}
