import { APIGatewayProxyEvent } from 'aws-lambda'
import 'source-map-support/register'
import { getUserId } from "../lambda/utils";
import * as uuid from 'uuid'
import { CreateGameRequest } from '../requests/CreateGameRequest'
import AppTodos from "../dataLayer/appTodos";
import {UpdateGameRequest} from "../requests/UpdateGameRequest";
import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);
const applicationData = new AppTodos();

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

//retrieve all the games for a given user
export async function getGame(event: APIGatewayProxyEvent) {

    const userId = getUserId(event)
    const result = await applicationData.getUserGames(userId)

    return result;

}

//create a new item for a given user
export async function createGame(event: APIGatewayProxyEvent) {

    const itemId = uuid.v4()

    const newTodo: CreateGameRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    const item = {
        gameId: itemId,
        userId: userId,
        createdAt: new Date(Date.now()).toISOString(),
        done: false,
        ...newTodo
    }

    await applicationData.createGame(item)

    return item;

}

//delete a specific item
export async function deleteGame(event: APIGatewayProxyEvent) {

    const gameId = event.pathParameters.gameId
    const userId = getUserId(event)

    const toBeDeleted = await applicationData.getUserSpecificGame(userId, gameId)

    if(toBeDeleted.size <=0) {
        throw  new Error("Invalid Item");
    }


    await applicationData.deleteItem(userId, gameId)

}

//update a given item that belong to a specific user
export async function updateGame(event: APIGatewayProxyEvent) {

    const gameId = event.pathParameters.gameId
    const userId = getUserId(event)
    const updatedTodo: UpdateGameRequest = JSON.parse(event.body)

    await applicationData.updateGame(userId, gameId, updatedTodo)


}

//upload an image into an item
export async function uploadImage(event: APIGatewayProxyEvent) {

    const gameId = event.pathParameters.gameId
    const userId = getUserId(event)

    const createSignedUrlRequest = {
        Bucket: bucketName,
        Key: gameId,
        Expires: urlExpiration
    }

    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${gameId}`

    await applicationData.updateImageURL(userId, gameId, attachmentUrl)

    return s3.getSignedUrl('putObject', createSignedUrlRequest);

}
