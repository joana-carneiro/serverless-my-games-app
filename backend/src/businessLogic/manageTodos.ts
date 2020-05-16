import { APIGatewayProxyEvent } from 'aws-lambda'
import 'source-map-support/register'
import { parseUserId } from '../auth/utils'
import * as uuid from 'uuid'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import AppTodos from "../dataLayer/appTodos";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);
const applicationData = new AppTodos();

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

//retrieve all the to dos for a given user
export async function getTodo(event: APIGatewayProxyEvent) {

    const userId = getUserId(event)
    const result = await applicationData.getUserTodos(userId)

    return result;

}

//create a new item for a given user
export async function createTodo(event: APIGatewayProxyEvent) {

    const itemId = uuid.v4()

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    const item = {
        todoId: itemId,
        userId: userId,
        createdAt: new Date(Date.now()).toISOString(),
        done: false,
        ...newTodo
    }

    await applicationData.createTodo(item)

    return item;

}

//delete a specific item
export async function deleteTodo(event: APIGatewayProxyEvent) {

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const toBeDeleted = await applicationData.getUserSpecificTodo(userId, todoId)

    if(toBeDeleted.size <=0) {
        throw  new Error("Invalid Item");
    }


    await applicationData.deleteItem(userId, todoId)

}

//update a given item that belong to a specific user
export async function updateTodo(event: APIGatewayProxyEvent) {

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    await applicationData.updateTodo(userId, todoId, updatedTodo)


}

//upload an image into an item
export async function uploadImage(event: APIGatewayProxyEvent) {

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const createSignedUrlRequest = {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    }

    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

    await applicationData.updateImageURL(userId, todoId, attachmentUrl)

    return s3.getSignedUrl('putObject', createSignedUrlRequest);

}

//retrieve a user id from the event passed information
export function getUserId(event: APIGatewayProxyEvent): string {

    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    return parseUserId(jwtToken);
}
