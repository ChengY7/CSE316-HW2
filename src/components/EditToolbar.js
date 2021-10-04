import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        const {closeCallback}=this.props;
        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button' 
                    className="top5-button">
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    className="top5-button">
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className="top5-button"
                    onClick={closeCallback}>
                        &#x24E7;
                </div>
            </div>
        )
    }
}