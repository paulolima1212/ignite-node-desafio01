import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../database'
import { Readable } from 'node:stream'
import readline from 'node:readline'

export async function tasksRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    if (request.headers['content-type']?.includes('multipart/form-data')) {
      const data = await request.file()
      const buffer = await data?.toBuffer()
      const readableFile = new Readable()
      readableFile.push(buffer)
      readableFile.push(null)

      const taskLines = readline.createInterface({
        input: readableFile,
      })

      let i = 0
      for await (let task of taskLines) {
        if (i !== 0) {
          const taskSplit = task.split(',')

          await prisma.task.create({
            data: {
              title: taskSplit[0],
              description: taskSplit[1],
            },
          })
        }

        i += 1
      }
      return
    }

    const bodySchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const body = bodySchema.parse(request.body)

    const { title, description } = body

    await prisma.task.create({
      data: {
        description,
        title,
      },
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const transactions = await prisma.task.findMany()

    return {
      transactions,
    }
  })

  app.get(`/:id`, async (request, replay) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    const transaction = await prisma.task.findUnique({
      where: {
        id,
      },
    })

    return {
      transaction,
    }
  })

  app.patch('/:id/completed', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const date = new Date()

    await prisma.task.update({
      where: {
        id,
      },
      data: {
        completed_at: date,
        updated_at: date,
      },
    })

    return reply.status(201).send()
  })

  app.delete('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    await prisma.task.delete({
      where: {
        id,
      },
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const dataBodySchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const { id } = paramsSchema.parse(request.params)

    const { title, description } = dataBodySchema.parse(request.body)

    await prisma.task.update({
      where: {
        id,
      },
      data: {
        title,
        description,
      },
    })

    return reply.status(201).send()
  })
}
