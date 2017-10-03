import React, { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent } from 'react'
import Drawer from './Drawer'

export interface SelectableInputProps {
  defaults?: string[]
  options: string[]
  onChange(keywords: string[]): void
  onRemove(e: MouseEvent<HTMLButtonElement>): void
}

export interface SelectableInputState {
  cursor: number
  input: string
  inputOnFocus: string
  inputOnBlur: string
  isDrawerOpen: boolean
}

export default class SelectableInput extends React.Component<SelectableInputProps, SelectableInputState> {
  input: HTMLInputElement
  drawer: HTMLUListElement
  state = {
    cursor: 0,
    input: (this.props.defaults || []).join(' '),
    inputOnFocus: '',
    inputOnBlur: '',
    isDrawerOpen: false,
  }

  get cursor(): number { return this.state.cursor }

  set cursor(next: number) {
    const length = this.props.options.length
    const cursor = next > length ? length : next > 0 ? next : 0
    const isDrawerOpen = length > 0 && cursor > 0
    const input = isDrawerOpen ? this.props.options[length - cursor] : this.state.inputOnFocus

    if (isDrawerOpen) {
      const item = this.drawer.children[cursor - 1] as HTMLLIElement
      this.drawer.scrollTop = item.offsetTop + item.offsetHeight - this.drawer.offsetHeight
    } else {
      this.drawer.scrollTop = 0
    }

    this.setState({ cursor, input, isDrawerOpen })
    this.handleChange(input)
  }

  componentDidMount() {
    document.body.addEventListener('click', this.handleBodyClick, false)
    this.input.addEventListener('click', this.handleInputClick, false)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleBodyClick)
    this.input.removeEventListener('click', this.handleInputClick)
  }

  handleBodyClick() { this.setState({ isDrawerOpen: false }) }

  handleInputClick(e: Event) { e.stopPropagation() }

  handleChange(input: string) {
    this.props.onChange(input.replace(/\s+/g, ' ').split(/\s/))
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ input: e.target.value })
  }

  handleInputFocus = (e: FocusEvent<HTMLInputElement>) => {
    this.setState({
      inputOnFocus: (e.target as HTMLInputElement).value,
      isDrawerOpen: (this.props.options.length > 0),
    })
  }

  handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    const input = (e.target as HTMLInputElement).value

    this.setState({ input, inputOnBlur: input, isDrawerOpen: false })
    this.handleChange(input)
  }

  handleInputKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1) { return }

    switch (e.key) {
      case 'Escape':
        this.setState({ input: this.state.inputOnFocus, isDrawerOpen: false })
        this.input.blur()
        break

      case 'Enter':
        break

      case 'ArrowUp':
        this.cursor--
        break

      case 'ArrowDown':
        this.cursor++
        break

      default:
        break
    }
  }

  handleSelect = (cursor: number) => {
    const input = this.props.options[this.props.options.length - cursor]

    this.setState({ input, isDrawerOpen: false })
    this.handleChange(input)
  }

  render() {
    return (
      <div className="query-input">
        <input className="textinput" placeholder="スペース区切りで複数入力可能"
               value={this.state.input}
               onChange={this.handleInputChange}
               onFocus={this.handleInputFocus}
               onBlur={this.handleInputBlur}
               onKeyUp={this.handleInputKeyUp}
               ref={(el: HTMLInputElement) => this.input = el} />

        <button className="query-input--remove" tabIndex={-1} onClick={this.props.onRemove}>
          <i className="fa fa-times"/>
        </button>

        <Drawer visible={this.state.isDrawerOpen}
                options={[...this.props.options].reverse()}
                chosen={this.state.cursor}
                onChange={this.handleSelect}
                ref={(el: HTMLUListElement) => this.drawer = el} />
      </div>
    )
  }
}
