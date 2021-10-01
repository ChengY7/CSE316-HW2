import React from "react";

export default class ItemCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.item,
            editActive: false,
        }
    }
    handleClick =(event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }
    handleToggleEdit = (event) => {
        this.setState({editActive : !this.state.editActive});
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur()
        }
    }
    handleBlur = () => {
        let index = this.props.index;
        let textValue = this.state.text;
        this.props.renameItemCallback(index, textValue);
        this.handleToggleEdit();
    }
    handleUpdate = (event) => {
        this.setState({text: event.target.value});
    }
    render() {
        const {index} = this.props;
        return (
                this.state.editActive
                    ? <input
                        className='top5-item'
                        type='text'
                        onKeyPress={this.handleKeyPress}
                        onBlur={this.handleBlur}
                        onChange={this.handleUpdate}
                        defaultValue={this.state.text}
                    />
                    : <div className="top5-item" onClick={this.handleClick} index={index}>{this.state.text}</div>
            );

    }
}