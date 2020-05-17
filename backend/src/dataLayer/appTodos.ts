import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS);

export default class AppTodos {

    constructor(
        private readonly docClient : DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.GAMES_TABLE,
        private readonly todosIdIndex = process.env.GAMES_ID_INDEX
    ) {}

    //retrieve all the todos for a given user id
    async getUserTodos(userId) {

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items;
    }

    //return a spefic item with a given id for a specific user
    async getUserSpecificTodo(userId, gameId) {

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                gameId,
                userId
            }
        }).promise();

        return result.Item;

    }

    async deleteItem (userId, gameId) {

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                gameId,
                userId
            }
        }).promise();
    }

    //create a new item for the user
    async createTodo(item) {

        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise();
    }

    //update a given item that belongs to a given user
    async updateTodo(userId,gameId,updatedTodo) {

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                gameId,
                userId
            },
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':due': updatedTodo.dueDate,
                ':d': updatedTodo.done
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
            TableName: this.todosTable,
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
