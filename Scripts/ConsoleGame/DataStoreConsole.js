const BetDataStore = require('MoneyDataStore');
const { convertSlotMatrixTBLR, convertPayLine, convertPayLineAllways } = require('utils');
cc.Class({
    extends: require('DataStorev2'),
    onLoad() {
        this.node.gSlotDataStore = {
            slotBetDataStore: new BetDataStore(),
            playSession: {},
            lastEvent: {},
            lastedNormalPaylines: {},
            modeTurbo: false,
            isAutoSpin: false,
            spinTimes: 0,
            gameId: "9877",
            isEnableBGM: false,
            isEnableSFX: false,
            betValueWithGame: [...Array(this.node.config.PAY_LINE_LENGTH).keys()].map(i => i + 1)
        };
        this.node.gSlotDataStore.gameId = this.gameId;
        this.node.gSlotDataStore.isEnableBGM = this.isEnableBGM;
        this.node.gSlotDataStore.isEnableSFX = this.isEnableSFX;
        this.node.gSlotDataStore.slotBetDataStore.createDefaultBet(this.node.config);

        this.node.gSlotDataStore.formatData = this.formatData.bind(this);
        this.node.gSlotDataStore.convertSlotMatrix = convertSlotMatrixTBLR.bind(this);
        this.node.gSlotDataStore.getDefaultMatrix = this.getDefaultMatrix.bind(this);
        this.node.gSlotDataStore.cacheDataJoinGame = this.cacheDataJoinGame.bind(this);
        this.node.gSlotDataStore.loadBetByKey = this.loadBetByKey.bind(this);

        if (this.node.config.PAY_LINE_ALLWAYS) {
            this.node.gSlotDataStore.convertPayLine = convertPayLineAllways.bind(this);
        } else {
            this.node.gSlotDataStore.convertPayLine = convertPayLine.bind(this);
        }

        this.node.gSlotDataStore.bellProgress = 0;
        this.node.gSlotDataStore.fishInfo = [];
    },
    cacheDataJoinGame(data) {
        if (!this.fishInfoCache) this.fishInfoCache = {};
        const { extendData } = data;
        if (extendData && extendData.eData) {
            const dataPss = extendData.eData.split('#')[1].slice(3);
            const betData = dataPss.split(',');
            betData.forEach(data => {
                let fishInfo = [];
                const betKey = data.split(':')[0][0];
                const fishData = data.split(':')[1];
                const bellProgress = data.split(':')[2];
                if (fishData && fishData.length) {
                    fishData.split(";").forEach(fish => {
                        const symbol = fish.split("|")[0];
                        const fishIndex = fish.split("|")[1];
                        const fishMultiply = fish.split("|")[2];
                        const { row, col } = this.getRowColByIndex(fishIndex);
                        fishInfo.push({ symbol, fishIndex, col, row, fishMultiply, isNewFish: false });
                    });
                }
                this.fishInfoCache[betKey] = { fishInfo, bellProgress };
            });
        }
    },
    formatData(playSession) {
        const { TABLE_FORMAT } = this.node.config;
        const { matrix, matrix0, normalGameMatrix, nMx0, freeGameMatrix, fMx0, winAmount,
            jackpot, winAmountPS, payLines, gbP, posD, wMl, betId, state, wFl, mulF } = playSession;
        const tableFormat = TABLE_FORMAT;
        playSession.tableFormat = tableFormat;

        if (matrix0) {
            playSession.matrix0 = this.node.gSlotDataStore.convertSlotMatrix(matrix0, tableFormat);
        }
        if (nMx0) {
            playSession.normalMatrix0 = this.node.gSlotDataStore.convertSlotMatrix(nMx0, tableFormat);
        }
        if (fMx0) {
            playSession.freeMatrix0 = this.node.gSlotDataStore.convertSlotMatrix(fMx0, tableFormat);
        }
        if (matrix) {
            playSession.matrix = this.node.gSlotDataStore.convertSlotMatrix(matrix, tableFormat);
            playSession.bigWild = this.getBigWild(playSession.matrix);
        } else {
            if (normalGameMatrix) {
                playSession.normalGameMatrix = this.node.gSlotDataStore.convertSlotMatrix(normalGameMatrix, tableFormat);
            }
            if (freeGameMatrix) {
                playSession.freeGameMatrix = this.node.gSlotDataStore.convertSlotMatrix(freeGameMatrix, tableFormat);
                playSession.bigWild = this.getBigWild(playSession.freeGameMatrix);
            }
        }
        if (payLines) {
            playSession.payLines = this.node.gSlotDataStore.convertPayLine(payLines);
            playSession.payLines.sort((a, b) => b.payLineWinAmount - a.payLineWinAmount);
        }
        if (jackpot) {
            let infoJP = jackpot[jackpot.length - 1];
            let arrayJP = infoJP.split(';');
            const jackpotAmount = Number(arrayJP[1]);
            playSession.winJackpotAmount = jackpotAmount ? jackpotAmount : 0
        }

        if (state == 1) { //normal
            if (posD) {
                playSession.posDragon = posD;
            }
            playSession.fishInfo = wMl ? this.formatFishInfo(wMl, matrix ? matrix : normalGameMatrix, posD) : [];
            playSession.bellProgress = gbP ? gbP : 0;


            this.node.gSlotDataStore.fishInfo = wMl ? this.formatFishInfo(wMl, matrix ? matrix : normalGameMatrix, posD) : [];
            this.fishInfoCache[betId[0]] = { fishInfo: playSession.fishInfo, bellProgress: playSession.bellProgress }
        }

        if (state == 2) {  //free
            if (wFl) {
                playSession.wildRandom = this.formatWildRandomFree(wFl);
            }
        }
        playSession.multipleFree = mulF ? mulF : 1;
        playSession.winAmountPS = winAmountPS ? winAmountPS : 0;
        playSession.winAmount = winAmount ? winAmount : 0;
        this.node.gSlotDataStore.playSession = playSession;

        cc.warn("%c data-update ", "color: red", this.node.gSlotDataStore.playSession);
        return playSession;
    },
    formatFishInfo(wildData, matrix, posDragon) {
        let fishData = [];
        wildData.split(",").forEach(fish => {
            const fishIndex = fish.split(":")[0];
            const fishMultiply = fish.split(":")[1];
            const { row, col } = this.getRowColByIndex(fishIndex);
            const symbol = matrix[fishIndex];
            const isDragon = posDragon && posDragon == fishIndex;
            fishData.push({ symbol, fishIndex, col, row, fishMultiply, isNewFish: fishMultiply == 1, isDragon });
        });
        return fishData;
    },
    formatWildRandomFree(data) {
        let wildData = [];
        data.split(",").forEach(fish => {
            const wildIndex = fish.split(":")[0];
            const wildType = fish.split(":")[1];
            const wildValue = fish.split(":")[2];
            const { row, col } = this.getRowColByIndex(wildIndex);
            wildData.push({ wildIndex, wildType, wildValue, col, row });
        });
        return wildData;
    },
    getRowColByIndex(fishIndex) {
        const { TABLE_FORMAT } = this.node.config;
        let count = 0;
        for (let i = 0; i < TABLE_FORMAT.length; i++) {
            for (let j = 0; j < TABLE_FORMAT[i]; j++) {
                if (fishIndex == count) {
                    return { col: i, row: j };
                }
                count++;
            }
        }
        return null;
    },
    getDefaultMatrix() {
        const defaultMatrix = [
            [['4', '3', '6'], ['3', '3', '7'], ['8', '9', '8'], ['7', '5', '5'], ['6', '5', '2']],
            [['3', '3', '9'], ['6', '7', '2'], ['7', '5', '8'], ['4', '8', '9'], ['6', '3', '5']],
            [['3', '8', '9'], ['3', '9', '4'], ['2', '7', '4'], ['2', '6', '5'], ['6', '7', '5']],
        ];
        const index = Math.floor(Math.random() * defaultMatrix.length);
        const matrix = defaultMatrix[index];
        return { matrix, matrix0: matrix, isResume: true };
    },
    getBigWild(matrix) {
        const bigWild = [];
        for (let i = 0; i < matrix.length; i++) {
            const countK = matrix[i].filter(symbol => symbol === "K").length;
            if (countK >= 3) {
                bigWild.push(i);
            }
        }
        return bigWild;
    },
    loadBetByKey(betKey) {
        if (this.fishInfoCache && this.fishInfoCache[betKey]) {
            const { fishInfo, bellProgress } = this.fishInfoCache[betKey];
            this.node.gSlotDataStore.bellProgress = bellProgress;
            this.node.gSlotDataStore.fishInfo = fishInfo;
            return { fishInfo, bellProgress };
        }
    },
});