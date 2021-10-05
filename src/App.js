import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js';
import tps from './components/jsTPS.js';
import MoveItem_Transaction from './components/MoveItem_Transaction.js';
import ChangeItem_Transaction from './components/ChangeItem_Transaction';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        this.tps = new tps();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            currentKeyNamePair : null
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };
        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData)
            document.getElementById('close-button').style.opacity=1;
            document.getElementById('close-button').style.pointerEvents='auto';
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    renameItem = (index, textValue) => {
        this.state.currentList.items[index]=textValue;
        this.setState({
            currentList: this.state.currentList
        })
        this.db.mutationUpdateList(this.state.currentList)
        this.checkRedoButton();
        this.checkUndoButton();
        //let newList = { items: this.state.currentList.items}
       // newList[index]=textValue;
        //this.setState({
           // currentList: newList
       // })
       // this.db.mutationUpdateList(this.state.currentList)
        
    }
    moveItem = (index1, index2) => {
        this.state.currentList.items.splice(index2, 0, this.state.currentList.items.splice(index1, 1)[0])
        this.setState({
            currentList: this.state.currentList
        })
        this.db.mutationUpdateList(this.state.currentList);
        this.checkRedoButton();
        this.checkUndoButton();
    }
    addChangeItemTransaction = (id, newText) => {
        let oldText = this.state.currentList.items[id]
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
        this.checkRedoButton();
        this.checkUndoButton();
    }
    addMoveItemTransaction = (oldIndex, newIndex) => {
        let transaction = new MoveItem_Transaction(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
        this.checkRedoButton();
        this.checkUndoButton();
    }
    undo=() =>{
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
        }
        this.checkRedoButton();
        this.checkUndoButton();
    }
    redo=() =>{
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
        }
        this.checkRedoButton();
        this.checkUndoButton();
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            this.tps.clearAllTransactions();
            document.getElementById('close-button').style.opacity=1;
            document.getElementById('close-button').style.pointerEvents='auto';
            this.checkRedoButton();
            this.checkUndoButton();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            this.tps.clearAllTransactions()
            document.getElementById('close-button').style.opacity=0.5;
            document.getElementById('close-button').style.pointerEvents='none';
            this.checkRedoButton();
            this.checkUndoButton();
        });
    }
    deleteList = (knp) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.showDeleteListModal();
        this.setState({
            currentKeyNamePair : knp
        })
        let list= this.db.queryGetList(knp.key)
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    deletingList = (knp) => {
        for (let i=0;i<this.state.sessionData.keyNamePairs.length;i++) {
            if (this.state.sessionData.keyNamePairs[i].key===knp.key) {
                this.state.sessionData.keyNamePairs.splice(i, 1)
            }
        }
        if(knp.key==this.state.currentList.key) {
            this.closeCurrentList();
        }
        this.setState(prevState => ({
            sessionData: {
                keyNamePairs: this.state.sessionData.keyNamePairs,
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
            }
        }), () => {
            this.tps.clearAllTransactions()
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.checkRedoButton();
            this.checkUndoButton();
        });
    }
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    keyboardCommand = () => {
        if (window.event.keyCode===90) {
            this.undo()
        }
        else if (window.event.keyCode===89) {
            this.redo()
        }
        this.checkRedoButton();
        this.checkUndoButton();
    }
    checkRedoButton() {
        if (!this.tps.hasTransactionToRedo()) {
            document.getElementById("redo-button").style.opacity=0.5;
            document.getElementById("redo-button").style.pointerEvents='none';
        } else {
            document.getElementById("redo-button").style.opacity=1;
            document.getElementById("redo-button").style.pointerEvents='auto';
        }
    }
    checkUndoButton() {
        if (!this.tps.hasTransactionToUndo()) {
            document.getElementById("undo-button").style.opacity=0.5;
            document.getElementById("undo-button").style.pointerEvents='none';
        } else {
            document.getElementById("undo-button").style.opacity=1;
            document.getElementById("undo-button").style.pointerEvents='auto'
        }
    }
    render() {
        {document.addEventListener('keydown', this.keyboardCommand)}
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList} 
                    redoCallback={this.redo}
                    undoCallback={this.undo}/>
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <Workspace
                    currentList={this.state.currentList} 
                    renameItemCallback={this.addChangeItemTransaction}
                    key={this.state.currentList && this.state.currentList.key}
                    moveItemCallback={this.addMoveItemTransaction}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair={this.state.currentKeyNamePair}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deletingList}
                />
            </div>
        );
    }
}

export default App;
