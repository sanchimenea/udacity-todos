import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdateParams } from '../models/TodoUpdateParam'


const todosAccess = new TodoAccess()

export async function getTodosByUser(userId: string): Promise<TodoItem[]> {
    return await todosAccess.getTodosByUser(userId)
}

export async function createTodo(userId: string, newTodo: CreateTodoRequest) {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()

    const newItem = await todosAccess.createTodo({
        userId,
        todoId,
        createdAt,
        done: false,
        ...newTodo
    })

    delete newItem.userId

    return newItem
}

export async function todoExists(todoId: string, userId: string) {
    return await todosAccess.todoExists(todoId, userId)
}

export async function deleteTodo(todoId: string, userId: string) {
    return await todosAccess.deleteTodo(todoId, userId)

}

export async function updateTodo(updatedTodo: UpdateTodoRequest, todoId: string, userId: string) {
    const params: TodoUpdateParams = {
        Key: {
            "userId": userId,
            "todoId": todoId
        },
        UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done",
        ExpressionAttributeNames: {
            "#n": "name"
        },
        ExpressionAttributeValues: {
            ":name": updatedTodo.name,
            ":dueDate": updatedTodo.dueDate,
            ":done": updatedTodo.done
        }
    };
    return await todosAccess.updateTodo(params)
}

export async function addUrlTodo(todoId: string, userId: string, attachmentUrl: string) {
    const params: TodoUpdateParams = {
        Key: {
            "userId": userId,
            "todoId": todoId
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl": attachmentUrl
        }
    };

    return await todosAccess.updateTodo(params)
}