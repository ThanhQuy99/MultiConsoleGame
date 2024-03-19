

const { getMessageSlot } = require('gameCommonUtils');

cc.Class({
    extends: cc.Component,
    onLoad() {
        this.node.config = {
            STATS: {
                FAST: {
                    TIME: 0.06,
                    REEL_DELAY_START: 0,
                    REEL_DELAY_STOP: 0.5,
                    REEL_EASING_DISTANCE: 15,
                    REEL_EASING_TIME: 0.08,
                    BLINKS: 2,
                    BLINK_DURATION: 0.5,
                    ANIMATION_DURATION: 2,
                    STEP_STOP: 12,
                    NEAR_WIN_DELAY_TIME: 2,
                    NEAR_WIN_DELAY_TIME_LAST_REEL: 1,
                    EXPECT_PAYLINE_TIME: 2,
                    EXPECT_PAYLINE_ALLWAYS_TIME: 2,
                    MIN_TIME_EACH_PAYLINE: 0,
                },
                TURBO: {
                    TIME: 0.05,
                    REEL_DELAY_START: 0.0,
                    REEL_DELAY_STOP: 0.0,
                    REEL_EASING_DISTANCE: 15,
                    REEL_EASING_TIME: 0.08,
                    BLINKS: 1,
                    BLINK_DURATION: 0.5,
                    ANIMATION_DURATION: 1,
                    STEP_STOP: 6,
                    NEAR_WIN_DELAY_TIME: 0.3,
                    NEAR_WIN_DELAY_TIME_LAST_REEL: 0.5,
                    EXPECT_PAYLINE_TIME: 1,
                    EXPECT_PAYLINE_ALLWAYS_TIME: 2,
                    MIN_TIME_EACH_PAYLINE: 0,
                }
            },
            GAME_SPEED: {
                NORMAL: 0,
                TURBO: 1,
                INSTANTLY: 2,
            },
            TREASURE_VALUE: [
                { value: 5, count: 7 },
                { value: 15, count: 5 },
                { value: 45, count: 3 }
            ],
            SUPER_TURBO: 0.04,
            SYMBOL_NAME_LIST: [
                ['2', '3', '4', '5', '6', '7', '8', '9'],
                ['2', '3', '4', '5', '6', '7', '8', '9'],
                ['2', '3', '4', '5', '6', '7', '8', '9'],
                ['2', '3', '4', '5', '6', '7', '8', '9'],
                ['2', '3', '4', '5', '6', '7', '8', '9'],
            ],
            SYMBOL_NAME_LIST_FREE: [
                ['2', '3', '4', '5', '6', '7', '8', '9', 'K'],
                ['2', '3', '4', '5', '6', '7', '8', '9', 'K'],
                ['2', '3', '4', '5', '6', '7', '8', '9', 'K'],
                ['2', '3', '4', '5', '6', '7', '8', '9', 'K'],
                ['2', '3', '4', '5', '6', '7', '8', '9', 'K'],
            ],
            SYMBOL_SMALL_NAME_LIST: ['2', '3', '4', '5', '6', '7', '8', '9', 'K1', 'K2'],

            SYMBOL_WIDTH: 166,
            SYMBOL_HEIGHT: 156,
            SYMBOL_MARGIN_RIGHT: 26,

            SYMBOL_WIDTH_HISTORY: 152,
            SYMBOL_HEIGHT_HISTORY: 125,
            SYMBOL_PADDING_HISTORY: 4,

            GAME_ID: '9877',
            JP_PREFIX_EVENT: '9877_',
            JP_NAMES: ["GRAND"],
            EXTRA_BET_STEPS: [0],
            PAY_LINE_LENGTH: 10,
            TOTAL_BET_CREDIT: 50,
            STEPS: {
                '10': 1000,
                '20': 2000,
                '30': 5000,
                '40': 10000,
                '50': 20000,
                '60': 50000,
                '70': 100000,
                '80': 200000,
                '90': 500000,
                'a0': 1000000,
            },
            DEFAULT_BET: 1000,
            EXTRA_STEPS: {
                '0': 0
            },
            DEFAULT_EXTRA_BET: 0,
            DEFAULT_TRIAL_WALLET: 100000000,
            DEFAULT_TRIAL_JACKPOT: {
                "1_GRAND": 1000000,
                "2_GRAND": 10000000,
                "3_GRAND": 100000000,
            },
            MAX_BET: 10000,
            TABLE_FORMAT: [3, 3, 3, 3, 3],
            TABLE_SYMBOL_BUFFER: {
                TOP: 1,
                BOT: 1,
            },
            PAY_LINE_ALLWAYS: false,
            SHOW_INTRO_TIPS: true,
            SHOW_BEAUTY_MATRIX: false,
            PAY_LINE_MATRIX: {
                "1": [0, 0, 0, 0, 0],
                "2": [1, 1, 1, 1, 1],
                "3": [2, 2, 2, 2, 2],
                "4": [0, 1, 2, 1, 0],
                "5": [2, 1, 0, 1, 2],
                "6": [1, 0, 0, 0, 1],
                "7": [1, 2, 2, 2, 1],
                "8": [2, 2, 1, 2, 2],
                "9": [0, 0, 1, 0, 0],
                "10": [2, 1, 1, 1, 0]
            },
            MUSIC_VOLUME: 0.5,
            USE_SHORT_PARAM: true,
            SOUND_EFFECT_VOLUME: 1,
            MESSAGE_DIALOG: getMessageSlot({}),
            TIME_SHOW_JACKPOT_EXPLOSION: 3,
            BEAUTY_MATRIX: [
                "2,3,4,5,6,A,K,2,3,4,5,6,A,K,2",
                "3,4,5,6,A,K,2,3,4,5,6,A,K,2,K"
            ],
            INTRO_GAME_PLAY: [
                "Khi [K] xuất hiện sẽ thay thế cho các biểu tượng khác",
                "Xuất hiện 15 [JP] trúng ngay hũ xu.",
                "Tìm đủ 6 [A] thắng vòng quay miễn phí.",
                "Tìm đủ 6 [R] sẽ được bonus"
            ],
            SYMBOL_HAVE_ANIM: "2,5,K",
            SERVER_VERSION: 1,
            CAN_BACK_TO_REAL_MODE: false
        };
    }
});
