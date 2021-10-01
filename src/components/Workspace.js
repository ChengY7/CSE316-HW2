import React from "react";
import ItemCard from "./ItemCard";

export default class Workspace extends React.Component {
    render() {
        const {currentList, renameItemCallback} = this.props;
        if (currentList) {
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-items">
                            {currentList.items.map((item, index) => (
                                <ItemCard
                                    item={item}
                                    index={index}
                                    key={index}
                                    renameItemCallback={renameItemCallback}
                                />
                            ))}
                        </div>
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}