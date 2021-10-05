import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        const {closeCallback, undoCallback, redoCallback}=this.props;
        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button' 
                    className="top5-button"
                    onClick={undoCallback}
                    style={{opacity: 0.5, pointerEvents: 'none'}}>
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    className="top5-button"
                    onClick={redoCallback}
                    style={{opacity: 0.5, pointerEvents: 'none'}}>
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className="top5-button"
                    onClick={closeCallback}
                    style={{opacity: 0.5, pointerEvents: 'none'}}>
                        &#x24E7;
                </div>
            </div>
        )
    }
}