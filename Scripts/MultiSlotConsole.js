
cc.Class({
    extends: cc.Component,

    properties: {
        layoutHolder: cc.Node,
        editBox: cc.EditBox,
    },

    onLoad() {
        this.poolFactory = this.node.poolFactory;
    },

    addNewGame() {
        const gameId = this.editBox.string;
        if (gameId && gameId.length) {
            const newGamePrefab = this.poolFactory.getObject("ConsoleGame");
            newGamePrefab.gameId = gameId;
            newGamePrefab.parent = this.layoutHolder;
            newGamePrefab.active = true;
        }
    }
});
