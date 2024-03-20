
cc.Class({
    extends: cc.Component,

    properties: {
        layoutHolder: cc.Node,
        editBox: cc.EditBox,
        configGameConsole: cc.JsonAsset,
    },

    onLoad() {
        this.poolFactory = this.node.poolFactory;
    },

    addNewGame() {
        const gameId = this.editBox.string;
        const configGame = this.configGameConsole.json;
        if (gameId && gameId.length) {
            const config = configGame && configGame[gameId] ? configGame[gameId] : configGame.all;
            const newGamePrefab = this.poolFactory.getObject("ConsoleGame");
            newGamePrefab.gameId = gameId;
            newGamePrefab.configGameConsole = config;
            newGamePrefab.parent = this.layoutHolder;
            newGamePrefab.active = true;
        }
    },
    exportFile() {
        this._exportDataFile(JSON.stringify(this.configGameConsole), "ConfigGameConsole");
    },
    importFile() {
        this._importDataFile((data) => {
            this.configGameConsole = JSON.parse(data);
        });
    },


    _exportDataFile(dataStr, fileName) {
        let type = fileName.split(".").pop();
        const dataUri = `data:application/${type};charset=utf-8,${encodeURIComponent(dataStr)}`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
    },
    _importDataFile(callback) {
        const input = window.document.createElement("input");
        input.type = "file";
        setTimeout(() => { input.click(); }, 500);
        input.onchange = () => {
            const selectedFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                console.log("file loaded", event.target.result);
                callback(event.target.result);
            };
            reader.readAsText(selectedFile);
        }
    }
});
