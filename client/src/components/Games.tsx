import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createGame, deleteGame, getGames, patchGame } from '../api/games-api'
import Auth from '../auth/Auth'
import { Game } from '../types/Game'

interface GamesProps {
  auth: Auth
  history: History
}

interface GamesState {
  games: Game[]
  newGameName: string
  loadingGames: boolean
}

export class Games extends React.PureComponent<GamesProps, GamesState> {
  state: GamesState = {
    games: [],
    newGameName: '',
    loadingGames: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newGameName: event.target.value })
  }

  onEditButtonClick = (gameId: string) => {
    this.props.history.push(`/games/${gameId}/edit`)
  }

  onGameCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newGame = await createGame(this.props.auth.getIdToken(), {
        name: this.state.newGameName,
        dueDate
      })
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

  onGameCheck = async (pos: number) => {
    try {
      const game = this.state.games[pos]
      await patchGame(this.props.auth.getIdToken(), game.gameId, {
        name: game.name,
        dueDate: game.dueDate,
        done: !game.done
      })
      this.setState({
        games: update(this.state.games, {
          [pos]: { done: { $set: !game.done } }
        })
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
        <Header as="h1">My Board Games</Header>

        {this.renderCreateGameInput()}

        {this.renderGames()}
      </div>
    )
  }

  renderCreateGameInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Add A New Amazing Game',
              onClick: this.onGameCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Be epic..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
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
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderGamesList() {
    return (
      <Grid padded>
        {this.state.games.map((game, pos) => {
          return (
            <Grid.Row key={game.gameId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onGameCheck(pos)}
                  checked={game.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {game.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {game.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(game.gameId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onGameDelete(game.gameId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {game.attachmentUrl && (
                <Image src={game.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
