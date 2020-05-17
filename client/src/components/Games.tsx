import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Segment,
  Form,
  Container
} from 'semantic-ui-react'

import { createGame, deleteGame, getGames, patchGame, getUploadUrl, uploadFile } from '../api/games-api'
import Auth from '../auth/Auth'
import { Game } from '../types/Game'
import {UploadState} from '../components/EditGame'

interface GamesProps {
  auth: Auth
  history: History
}

interface GamesState {
  games: Game[]
  newGameName: string
  newGameDesc: string
  newGameImage: any
  loadingGames: boolean
  uploadState: UploadState
}

export class Games extends React.PureComponent<GamesProps, GamesState> {
  state: GamesState = {
    games: [],
    newGameName: '',
    newGameDesc: '',
    newGameImage: undefined,
    loadingGames: true,
    uploadState: UploadState.NoUpload
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newGameName: event.target.value })
  }

  handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newGameDesc: event.target.value })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      newGameImage: files[0]
    })
  }


  handleSubmit = (event:React.SyntheticEvent) =>{
    this.onGameCreate(event)
  }

  onEditButtonClick = (gameId: string) => {
    this.props.history.push(`/games/${gameId}/edit`)
  }

  onGameCreate = async (event: React.SyntheticEvent) => {
    try {
      const dueDate = this.calculateDueDate()
      const newGame = await createGame(this.props.auth.getIdToken(), {
        name: this.state.newGameName,
        desc: this.state.newGameDesc
      })

      if(newGame)
      {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newGame.gameId)

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.newGameImage)
      }

      this.setState({
        games: [...this.state.games, newGame],
        newGameName: ''
      })
    } catch {
      alert('Game creation failed')
    }
  }

  onGameDelete = async (gameId: string) => {
    try {
      await deleteGame(this.props.auth.getIdToken(), gameId)
      this.setState({
        games: this.state.games.filter(game => game.gameId != gameId)
      })
    } catch {
      alert('Game deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const games = await getGames(this.props.auth.getIdToken())
      this.setState({
        games,
        loadingGames: false
      })
    } catch (e) {
      alert(`Failed to fetch games: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        {this.renderCreateGameInput()}

        {this.renderGames()}
      </div>
    )
  }

  renderCreateGameInput() {
    return (
      <div>

        <Divider horizontal><h2>Insert New Game</h2></Divider>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Title</label>
            <input
              type="text"
              placeholder="Enter Title..."
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Desc</label>
            <input
              type="text"
              placeholder="Enter Description..."
              onChange={this.handleDescChange}
            />
          </Form.Field>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              name="filePath"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}

        </Form>
      </div>
    )
  }

  renderGames() {
    if (this.state.loadingGames) {
      return this.renderLoading()
    }

    return this.renderGamesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Games
        </Loader>
      </Grid.Row>
    )
  }

  renderGamesList() {
    return (
      <Container>
        <Divider horizontal><h2>My Board Games</h2></Divider>

        <Grid>
          {this.state.games.map((game, pos) => {
            return (
              <Grid.Row centered={true} key={game.gameId}>
                <Grid.Column width={8}>
                  <Segment>
                    <Image src={game.attachmentUrl} />
                  </Segment>
                </Grid.Column>
                <Grid.Column width={4}>
                  <Segment>
                    {game.name}
                  </Segment>
                  <Segment>
                    {game.desc}
                  </Segment>
                  <Segment>
                    last modified<br></br>
                    {game.createdAt}
                  </Segment>
                </Grid.Column>
                <Grid.Column width={2}>
                  <Segment>
                    <Button icon color="blue" onClick={() => this.onEditButtonClick(game.gameId)} >
                      <Icon name="pencil" />
                    </Button>
                  </Segment>
                  <Segment>
                    <Button icon color="red" onClick={() => this.onGameDelete(game.gameId)}>
                      <Icon name="delete" />
                    </Button>
                  </Segment>
                </Grid.Column>
              </Grid.Row>
          )
        })}
        </Grid>
      </Container>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Submit
        </Button>
      </div>
    )
  }

  setUploadState(uploadState: UploadState)
  {
    this.setState({
      uploadState
    })
  }
}
