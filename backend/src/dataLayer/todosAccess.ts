import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdateParams } from '../models/TodoUpdateParam'
// import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('todosAccess')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) { }

    async getTodosByUser(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            ScanIndexForward: false
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(newItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: newItem
        }).promise()

        return newItem
    }

    async todoExists(todoId: string, userId: string) {
        const result = await this.docClient
            .get({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                }
            }).promise()

        logger.info('Get todo: ' + todoId)
        return !!result.Item
    }

    async deleteTodo(todoId: string, userId: string) {

        const params = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            }
        };

        await this.docClient.delete(params, function (err, data) {
            if (err) logger.error(err);
            else logger.info("Delete Success " + data)
        }).promise()
    }

    async updateTodo(params: TodoUpdateParams) {

        await this.docClient.update(
            {
                TableName: this.todosTable,
                ...params
            }, function (err, data) {
                if (err) logger.error(err);
                else logger.info("Success " + data)
            }).promise()

    }

}