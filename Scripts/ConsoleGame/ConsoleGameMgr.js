const globalNetwork = require('globalNetwork');
const { formatMoney } = require('utils');
const gameNetwork = window.GameNetwork || require('game-network');
const EventManager = gameNetwork.EventManager;

cc.Class({
    extends: cc.Component,

    properties: {
        noticeNode: cc.Node,
        labelGameMode: cc.Label,
        noticeLabel: cc.Label,
        labelWinAmt: cc.Label,
        gameID: cc.Label,
        buttonStartGame: cc.Node,
        iconSpin: cc.Node,
    },

    onLoad() {
        this.node.director = this;
        this.joinGameSuccess = false;
        this.betID = '90';
    },
    setUpGame() {
        this.gameID.string = this.node.gameId;
        this.gameStateManager = globalNetwork.registerGame({
            gameId: this.node.gameId,
            isSlotGame: true,
            serverVersion: 1,
            stateUpdate: this.stateUpdate.bind(this),
            userLogout: this.userLogout.bind(this),
            joinGameSuccess: this.onJoinGameSuccess.bind(this),
            onNetworkFailed: this.onNetworkFailed.bind(this),
            onNetworkError: this.onNetworkError.bind(this),
            onNetworkDisconnect: this.onNetworkDisconnect.bind(this),
            onNetworkResume: this.onNetworkResume.bind(this),
            onNetworkWarning: this.onNetworkWarning.bind(this),
            onShowPopupDisconnected: this.onShowPopupDisconnected.bind(this),
            onNetworkConnected: this.onNetworkConnected.bind(this),
            onJoinGameDenied: this.onJoinGameDenied.bind(this),
            onRequestDenied: this.onRequestDenied.bind(this),
            authFailed: this.showMessageAuthFailed.bind(this),
            useShortParam: this.node.config.USE_SHORT_PARAM,
        });
    },

    stateUpdate(data) {
        const { winAmount, freeGameRemain } = data;
        this._tweenAutoSpin && this._tweenAutoSpin.stop();
        this._tweenAutoSpin = cc.tween(this.node)
            .delay(1)
            .call(() => {
                this._tweenRotate && this._tweenRotate.stop();
                this.labelGameMode.string = this.isFreeGame ? "Free" : "Normal";
                this.labelWinAmt.string = "" + (winAmount ? formatMoney(winAmount) : '0');
            })
            .delay(1)
            .call(() => {
                this.isFreeGame = !!freeGameRemain;
                this.sendSpinToNetwork();
            })
            .start();
    },
    onJoinGameSuccess(data) {
        this.joinGameSuccess = true;
        this.showMessageForceClose = false;
        const { dataResume, extendData } = data;
        if (extendData) {
            const { mBet, eBet } = extendData;
            if (mBet) {
                const minBet = mBet.split(',')[0];
                this.betID = minBet.split(';')[0];
            }
            if (eBet) {
                const minExBet = eBet.split(',')[0];
                this.betID = this.betID[0] + minExBet.split(';')[0];
            }
        }
        if (dataResume && dataResume.freeGameRemain) {
            this.isFreeGame = true;
        }
    },
    sendSpinToNetwork() {
        this._tweenRotate && this._tweenRotate.stop();
        this._tweenRotate = cc.tween(this.iconSpin)
            .by(0.5, { angle: 360 })
            .repeatForever()
            .start();
        this.buttonStartGame.active = false;
        this.labelWinAmt.string = "";
        this.labelGameMode.string = "";

        if (this.isFreeGame) {
            this.gameStateManager.triggerFreeSpinRequest();
        } else {
            this.gameStateManager.triggerSpinRequest(this.betID);
        }
    },



    //notice
    showMessageAuthFailed() {
        const { AUTHEN_FAILED } = this.node.config.MESSAGE_DIALOG;
        this.showNotice(AUTHEN_FAILED);
    },
    onJoinGameDenied() {
        const { ACCOUNT_BLOCKED } = this.node.config.MESSAGE_DIALOG;
        this.showNotice(ACCOUNT_BLOCKED);
    },
    onRequestDenied() {

    },
    onNetworkProblem() {
        if (this.logOutUser) return;
        if (reason == 'mismatch-command') {
            const { MISMATCH_DATA } = this.node.config.MESSAGE_DIALOG;
            this.showNotice(MISMATCH_DATA);
        }
    },
    onNetworkFailed(reason) {
        if (this.showMessageForceClose) return;
        const { MESSAGE_DIALOG } = this.node.config;
        let message = MESSAGE_DIALOG.SYSTEM_ERROR;
        switch (reason) {
            case EventManager.CAN_NOT_CONNECT:
                message = MESSAGE_DIALOG.SYSTEM_ERROR;
                break;

            case EventManager.MISMATCH_DATA_VERSION:
                message = MESSAGE_DIALOG.MISMATCH_DATA;
                break;
            case EventManager.MISMATCH_COMMAND_ID:
                message = MESSAGE_DIALOG.MISMATCH_DATA;
                break;
            case EventManager.EXPECTED_EVENT_TIMEOUT:
                message = MESSAGE_DIALOG.SYSTEM_ERROR;
        }
        this.showNotice(message);
        this.showMessageForceClose = true;
    },
    onNetworkError(code, metaData) {
        if (this.showMessageForceClose) return;
        const { MESSAGE_DIALOG } = this.node.config;
        let message = MESSAGE_DIALOG.SYSTEM_ERROR;
        let interruptGame = false;
        switch (code) {
            case '0000':
                code = 1000;
                interruptGame = true;
                message = MESSAGE_DIALOG.SYSTEM_ERROR;
                break;
            case 'W2408':
            case 'W2500':
            case 'W29999':
            case 'W2008':
                message = MESSAGE_DIALOG.SYSTEM_ERROR;
                break;
            case '0001':
                message = MESSAGE_DIALOG.NO_MONEY;
                break;
            case '0007':
                message = MESSAGE_DIALOG.NO_PLAYSESSION;
                interruptGame = true;
                break;
            case '0029':
                message = MESSAGE_DIALOG.GROUP_MAINTAIN;
                interruptGame = true;
                break;
            case '0014':
                message = MESSAGE_DIALOG.NO_FREESPIN_OPTION;
                interruptGame = true;
                break;
            case '0026':
                message = MESSAGE_DIALOG.MISMATCH_DATA;
                interruptGame = true;
                break;
            case '0035':
                message = MESSAGE_DIALOG.EVENT_ENDED;
                interruptGame = true;
                break;
            case 'W2001':
            case 'W2004':
                message = MESSAGE_DIALOG.SPIN_UNSUCCESS;
                break;
            case 'W2006':
            case 'W2007':
                message = MESSAGE_DIALOG.ACCOUNT_BLOCKED;
                break;
        }
        message = message + `\n(${code})`;
        this.showNotice(message);
        if (interruptGame) {
            this.showMessageForceClose = true;
        }
    },
    onNetworkDisconnect() {
        if (this.logOutUser || this.showMessageForceClose || this.networkWaiting) return;
        const { DISCONNECT } = this.node.config.MESSAGE_DIALOG;
        this.showNotice(DISCONNECT);
        this.networkWaiting = true;
    },
    onShowPopupDisconnected() {
        if (this.logOutUser || !this.joinGameSuccess || this.networkWaiting) return;
        const { MESSAGE_DIALOG } = this.node.config;
        this.networkWaiting = true;
        this.showNotice(MESSAGE_DIALOG.NETWORK_DISCONNECT);
    },
    onNetworkWarning() {
        if (this.logOutUser || !this.joinGameSuccess || this.networkWaiting) return;
        if (this.showMessageForceClose) {
            const { MESSAGE_DIALOG } = this.node.config;
            this.showNotice(MESSAGE_DIALOG.NETWORK_WARNING);
        }
    },
    onNetworkConnected() {

    },
    onNetworkResume() {

    },
    userLogout() {
        this.logOutUser = true;
        const { ANOTHER_ACCOUNT } = this.node.config.MESSAGE_DIALOG;
        this.showNotice(ANOTHER_ACCOUNT);
    },
    showNotice(text, time) {
        this._tweenRotate && this._tweenRotate.stop();
        this.noticeNode.active = true;
        this.noticeLabel.string = "" + text;
        if (time) {
            this.scheduleOnce(() => {
                this.noticeNode.active = false;
            }, time)
        }
    },
    onDestroy() {
        this.gameStateManager && this.gameStateManager.outGame();
    },
    init() { },
    initGameMode() { },
});
