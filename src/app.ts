import fastify from 'fastify'
import { tasksRoutes } from './routes/tasks'
import cookie from '@fastify/cookie'
import { fastifyMultipart } from '@fastify/multipart'

export const app = fastify()

app.register(cookie)

app.register(fastifyMultipart)

app.register(tasksRoutes, {
  prefix: 'tasks',
})
