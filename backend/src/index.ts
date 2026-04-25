import 'dotenv/config'
import express from 'express'
import 'express-async-errors'
import { createServer } from 'http'
import logger from './common/logger'
import morgan from 'morgan'
import { RouteConfig } from './common/route.config'
import { errorHandler } from './middleware/errorHandler'
import { Database } from './database'
import UserRoute from './user/user.route'
import cors from 'cors'
import TodoRoute from './todo/todo.route'
import authorization from './middleware/authorization'
import { ApiKey } from './api.key/api.key.entity'

const routes: Array<RouteConfig> = []

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(morgan('combined', {
	stream: {
		write: (message: string) => {
			logger.info(message.trim());
		},
	}
}))

app.use(authorization)
app.use(errorHandler)
routes.push(new UserRoute(app))
routes.push(new TodoRoute(app))


Database.initialize()
	.then(async () => {
		logger.info('database connected')
		server.listen(3000, () => {
			logger.info('server started')
			routes.forEach(route => {
				logger.info(`${route.getName()} configured`)
			})
		})

		// create default api key
		try {
			const apiKey = new ApiKey()
			apiKey.usedBy = 'frontend'
			await apiKey.setToken(process.env.FRONTEND_API_KEY || "front-end-api-key")
			await Database.getRepository(ApiKey).save(apiKey)
			logger.debug('frontend api key is set')
		} catch {
			logger.debug('frontend api key is already set')
		}
	})
	.catch(err => {
		logger.error('database conneciton failed')
		logger.error(err.toString())
	})


const server = createServer(app)