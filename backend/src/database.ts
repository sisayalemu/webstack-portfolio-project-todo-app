import 'dotenv/config'
import "reflect-metadata";
import { DataSource } from "typeorm";
import { ApiKey } from "./api.key/api.key.entity";
import { Todo } from "./todo/todo.entity";
import { User } from "./user/user.entity";
import { UserSession } from "./user/user.session.entity";

export const Database = new DataSource({
	type: 'mysql',
	username: process.env.DB_USER || 'todo_user',
	password: process.env.DB_PASSWORD || 'todo_123',
	database: process.env.DB_NAME || 'todo_app',
	host: 'sisay-todo-mysql',
	port: 3306,
	entities: [ ApiKey, User, UserSession, Todo ],
	synchronize: true,
	dropSchema: false,
})
