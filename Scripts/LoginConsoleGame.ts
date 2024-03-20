const serviceRest = require('serviceRest');
const globalNetwork = require('globalNetwork');
const loadConfigAsync = require('loadConfigAsync');
const { setDeviceOrientation } = require('utils');
const { ccclass, property } = cc._decorator;

@ccclass
export class Login extends cc.Component {

    @property(cc.EditBox)
    tokenInput: cc.EditBox = null;
    @property(cc.EditBox)
    userInput: cc.EditBox = null;
    @property({ type: cc.Label })
    errorMsg: cc.Label = null;
    @property({ type: cc.Node })
    tokenHolder = null;
    @property({ type: cc.Button })
    btnGetToken: cc.Button = null;

    envInfo = {
        stg: {
            userId: '',
            token: '',
        },
        exstg: {
            userId: '',
            token: '',
        },
        loadtest: {
            userId: '',
            token: '',
        },
        loadtest2: {
            userId: '',
            token: '',
        },
        account: {
            userId: '',
            password: '',
        },
        current: 'stg'
    };

    onLoad() {
        // console.log('Loaded scene login v341');
        this.getConfigRemote();
        if (cc.sys.isNative) {
            let versionFilePath = jsb.fileUtils.getWritablePath() + 'eno-hotupdate/' + 'project.manifest';
            if (jsb.fileUtils.isFileExist(versionFilePath)) {
                cc.log('Found hotupdate, version path ' + versionFilePath);
                let str = jsb.fileUtils.getStringFromFile(versionFilePath);
                if (str) {
                    let obj = JSON.parse(str);
                    cc.log('Update lobby version ' + obj.version);
                }
                else {
                    cc.log('Cant get string from version path');
                }
            }
        }
    }

    protected start(): void {
        if (cc.sys.isNative) {
            setDeviceOrientation(false);
        }
    }

    getConfigRemote() {
        const { IS_FINISHED_REMOTE } = loadConfigAsync.getConfig();
        if (!IS_FINISHED_REMOTE) {
            setTimeout(() => {
                this.getConfigRemote();
            }, 100);
            return;
        }
        let cachedInfo = cc.sys.localStorage.getItem('envInfo');
        if (cachedInfo) {
            this.envInfo = JSON.parse(cachedInfo);
        }

        if (this.envInfo && this.envInfo.current == "stg") {
            this.switchStaging();
        }
    }

    replaceConfig(config: any) {
        const dataUpdate = loadConfigAsync.getConfig();
        Object.keys(config).forEach(it => {
            dataUpdate[it] = config[it];
        });
    }

    switchStaging() {
        this.envInfo.current = 'stg';
        let config = {
            API_URL: "https://api.staging.enostd.gay/",
            NETWORK_V3: true,
            USER_TOKEN: "user_token",
            SOCKET_URL: "wss://sock.staging.enostd.gay",
            LOBBY_SCENE_NAME: "MultiGameSlot",
            LOGIN_SCENE_NAME: "Login",
            IPMaster12: "wss://staging.fish.enostd.gay/lobby-1985/",
        }
        this.btnGetToken.interactable = true;
        this.tokenHolder.active = true;
        this.replaceConfig(config);
        cc.sys.localStorage.setItem('envInfo', JSON.stringify(this.envInfo));
        this.loadUserInfo();
    }

    loadUserInfo() {
        let currentEnv = this.envInfo.current;
        let userInfo = this.envInfo[currentEnv] || {};

        if (!userInfo) return;

        if (userInfo.token)
            this.tokenInput.string = userInfo.token;
        else {
            this.tokenInput.string = '';
        }
        this.userInput.string = userInfo.userId || '';
    }

    getToken() {
        this.errorMsg.string = "";
        let userName = this.userInput.string.replace(/xxxxx_|game_|tek_/g, '');
        let url = 'internal-support-tool/token/generate/' + userName;
        serviceRest.post({
            url, params: null,
            callback: (data) => {
                if (data.status == 200 && data.data && this.tokenInput) {
                    this.tokenInput.string = data.data.data.token;
                    this.errorMsg.string = "";
                } else {
                    this.errorMsg.string = "Không thể tạo Token";
                }
            },
            callbackErr: () => {
                this.errorMsg.string = "Không thể tạo Token";
            }
        })
    }

    onLoginPress() {
        if (this.envInfo.current == 'account') {
        } else {
            this.loginToken();
        }
    }


    loginToken() {
        this.errorMsg.string = "";
        const { LOBBY_SCENE_NAME, USER_TOKEN, API_URL } = loadConfigAsync.getConfig();
        const userToken = this.tokenInput.string;
        if (!userToken) return;
        const dataPost = {
            token: userToken,
        };
        // console.log('Trying login user token ' + userToken);
        serviceRest.post({
            url: 'auth/token/login', data: dataPost, callback: (res) => {
                // console.log('login res ' + JSON.stringify(res));
                const { data: { data, error } } = res;
                if (data) {
                    const { token, userId } = data;
                    if (token && token != "") {
                        if (!this.envInfo[this.envInfo.current]) {
                            this.envInfo[this.envInfo.current] = {
                                token: '',
                                userId: ''
                            }
                        }
                        this.envInfo[this.envInfo.current].token = token;
                        this.envInfo[this.envInfo.current].userId = userId.replace(/xxxxx_|tek_/g, ''),
                            cc.sys.localStorage.setItem('envInfo', JSON.stringify(this.envInfo));
                        cc.sys.localStorage.setItem(USER_TOKEN, token);
                        cc.director.loadScene(LOBBY_SCENE_NAME);
                        this.errorMsg.string = "";
                        loadConfigAsync.setToken(token);
                        globalNetwork.init(token, null, 'all', 'all');
                    }
                    else {
                        this.errorMsg.string = "Không thể đăng nhập";
                    }
                } else if (error || res.data.errors) {
                    switch (res.data.errors[0]) {
                        case "ERROR_TOKEN_EXPRIED":
                            this.errorMsg.string = "Token đã expired";
                            break;
                        default:
                            this.errorMsg.string = "Không thể đăng nhập";
                            break;
                    }
                }
            }
        })
    }

}

