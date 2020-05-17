import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchGame } from '../api/games-api'

export enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditGameProps {
  match: {
    params: {
      gameId: string
    }
  }
  auth: Auth
}

interface EditGameState {
  name: any
  uploadState: UploadState
  desc: string
  file: any
}

export class EditGame extends React.PureComponent<
  EditGameProps,
  EditGameState
> {
  state: EditGameState = {
    name: '',
    desc: '',
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _name = event.target.value
    if (!_name) return

    this.setState({
      name: _name
    })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _desc = event.target.value
    if (!_desc) return

    this.setState({
      desc: _desc
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {

      const newGame = await patchGame(this.props.auth.getIdToken(), this.props.match.params.gameId, {
        name: this.state.name,
        desc: this.state.desc
      })

      if(this.state.file)
      {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.gameId)

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)

      }

      alert('Game Successfully Created!')
    } catch (e) {
      alert('Could not upload image: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Update Game</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter Game Name..."
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Desc</label>
            <input
              type="text"
              placeholder="Enter Description..."
              onChange={this.handleDescriptionChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
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
}
