export const dataProvider = {
    // 後から定義でも良いがコード保管のために undefined で定義だけする
    app: undefined,
    isMobile: undefined,

    spRect: {
        width: undefined,
        height:undefined,
    },

    /**
     * Rectangleとは別にSPサイズ縛りを入れる
     */
    limitedScreen: {
        width             : undefined,
        height            : undefined,
        halfWidth         : undefined,
        halfHeight        : undefined,
        negativeWidth     : undefined,
        negativeHeight    : undefined,
        negativeHalfWidth : undefined,
        negativeHalfHeight: undefined,
    },

    assets: {},

    data    : {
        sliderValue: 0
    },

    dev:{
        debug: true,
    },

    style: {},
    color: {
        dark1 : 0x545550,
        dark2 : 0x1A1F22,
        light1: 0xDCD3CC,
    },
};

export const dp = dataProvider;