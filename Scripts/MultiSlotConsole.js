
cc.Class({
    extends: cc.Component,

    properties: {
        layoutHolder: cc.Node,
        editBox: cc.EditBox,
        configGameConsole: cc.JsonAsset,
    },

    onLoad() {
        this.poolFactory = this.node.poolFactory;
        this.configGame=this.configGameConsole.json;
    },

    addNewGame() {
        const gameId = this.editBox.string;
        if (gameId && gameId.length) {
            const config = this.configGame && this.configGame[gameId] ? this.configGame[gameId] : this.configGame.all;
            const newGamePrefab = this.poolFactory.getObject("ConsoleGame");
            newGamePrefab.gameId = gameId;
            newGamePrefab.configGameConsole = config;
            newGamePrefab.parent = this.layoutHolder;
            newGamePrefab.active = true;
        }
    }
});
