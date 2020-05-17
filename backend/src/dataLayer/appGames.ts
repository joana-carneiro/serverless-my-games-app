import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS);

export default class AppGames {

    constructor(
        private readonly docClient : DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly gamesTable = process.env.GAMES_TABLE,
        private readonly gamesIdIndex = process.env.GAMES_ID_INDEX
    ) {}

    //retrieve all the games for a given user id
    async getUserGames(userId) {

        const result = await this.docClient.query({
            TableName: this.gamesTable,
            IndexName: this.gamesIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items;
    }

    //return a spefic item with a given id for a specific user
    async getUserSpecificGame(userId, gameId) {

        const result = await this.docClient.get({
            TableName: this.gamesTable,
            Key: {
                gameId,
                userId
            }
        }).promise();

        return result.Item;

    }

    async deleteItem (userId, gameId) {

        await this.docClient.delete({
            TableName: this.gamesTable,
            Key: {
                gameId,
                userId
            }
        }).promise();
    }

    //create a new item for the user
    async createGame(item) {

        await this.docClient.put({
            TableName: this.gamesTable,
            Item: item
        }).promise();
    }

    //update a given item that belongs to a given user
    async updateGame(userId, gameId, updatedGame) {

        await this.docClient.update({
            TableName: this.gamesTable,
            Key: {
                gameId,
                userId
            },
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': updatedGame.name,
                ':due': updatedGame.dueDate,
                ':d': updatedGame.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            }
        }).promise();
    }

    //update image URL for a given item
    async updateImageURL(userId, gameId, attachmentUrl){

        await this.docClient.update({
            TableName: this.gamesTable,
            Key: {
                gameId,
                userId
            },
            UpdateExpression: 'set attachmentUrl = :a',
            ExpressionAttributeValues: {
                ':a': attachmentUrl
            },
            ReturnValues:"UPDATED_NEW"
        }).promise();

    }


}
