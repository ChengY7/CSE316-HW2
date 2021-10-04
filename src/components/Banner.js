import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        const { title, closeCallback} = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar closeCallback={closeCallback} />
            </div>
        );
    }
}