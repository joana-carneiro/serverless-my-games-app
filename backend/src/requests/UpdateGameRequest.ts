/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateGameRequest {
  name: string
  dueDate: string
  done: boolean
}
