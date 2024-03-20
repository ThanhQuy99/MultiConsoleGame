/* global SwipeUp */
var listDomain = [];
var multiOrientationGames = {
    "g9995":{
        gameId: "9995",
        landscapeMode:{
            designResolution:{
                width: 1920,
                height: 1080,
            },
            splashSize:{
                width: 2436,
                height: 1440,
            }
        }, 
        portraitMode:{
            designResolution:{
                width: 1080,
                height: 1920,
            },
            splashSize:{
                width: 1440,
                height: 2436,
            }
        }
    },
    "g9992":{
        gameId: "9992",
        landscapeMode:{
            designResolution:{
                width: 1920,
                height: 1080,
            },
            splashSize:{
                width: 2436,
                height: 1440,
            }
        }, 
        portraitMode:{
            designResolution:{
                width: 1080,
                height: 1920,
            },
            splashSize:{
                width: 1440,
                height: 2436,
            }
        }
    },
    "g9989":{
        gameId: "9989",
        landscapeMode:{
            designResolution:{
                width: 1920,
                height: 1080,
            },
            splashSize:{
                width: 2436,
                height: 1440,
            }
        }, 
        portraitMode:{
            designResolution:{
                width: 1080,
                height: 1920,
            },
            splashSize:{
                width: 1440,
                height: 2436,
            }
        }
    }
};
var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) != null;
var isiPhone = navigator.userAgent.match(/iPhone|iPod/i) != null;
//baidu
var isBaidu = navigator.userAgent.match('baidu') != null;
//QQ browser
var isQQ = navigator.userAgent.match('MQQBrowser') != null;
//Saferi Browser
var isFirefox = navigator.userAgent.match('FxiOS') != null;
// UC Browser
var isUC = navigator.userAgent.indexOf("UCBrowser") != -1;
// Chrome 1+
var isChrome = navigator.userAgent.match('CriOS') != null;
//xiaomi
var isXiaomi = navigator.userAgent.match('XiaoMi') != null;
var isSafari = navigator.userAgent.match('Safari') && !isBaidu && !isFirefox && !isQQ && !isChrome && !isUC && !isXiaomi;
var isAndroid = /android/i.test(navigator.userAgent || navigator.vendor || window.opera);
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var loadOver = false;//是否加载完毕
var swipeUp;
var handImage;
var divFullscreen;
var enterFullscreenBtn;
var exitFullscreenBtn;
var isLandscapeCanvas = false; // in game orientation
var maxHeightLandscape = 0;
var isShowWarning = false;
var isFullScreenIOS;
var divWarningUserRotate;
var intervalCheckSize;
var lastWindowHeight;
var isIphoneX = (window.screen.height / window.screen.width) > 2;
var originalViewSize = window.innerWidth + window.innerHeight; 
var settings = window._CCSettings;
var multiOrientationGame = isSupportMultiOrientationGame(settings);
var checkFullscreenInterval;
var frameInterval;
var notScrollCount = 0;
var heighOffsetToFS = 23;
var isTouched = false;
var isChecked = false;
var iOsVersion;
var isPortraitGame = function(){
    if(!window._CCSettings) return false;
    return window._CCSettings.orientation === "portrait";
}
var splash = getSplash();
function getSplash() {
    var landScapeSplash = document.getElementById('splash');
    var portraitSplash = document.getElementById('splashGamePortrait');
    if (landScapeSplash) landScapeSplash.style.display = 'none';
    if (portraitSplash) portraitSplash.style.display = 'none';
    return (isSupportMultiOrientationGame(settings) && isMobile) ? portraitSplash : landScapeSplash;
}

if (splash) {
    splash.style.opacity = 0;
    var bgWidth = 2024;
    var bgHeight = 1200;
    var designWidth = 1280;
    var designHeight = 720;
    var isLandscape = isMobile ? isLandscapeScreen() : true;
    var screenWidth = isLandscape?document.documentElement.clientWidth:document.documentElement.clientHeight;
    var screenHeight = isLandscape? document.documentElement.clientHeight : document.documentElement.clientWidth;
    if(multiOrientationGame){
        if(isMobile){
            designWidth = multiOrientationGame.portraitMode.designResolution.width;
            designHeight = multiOrientationGame.portraitMode.designResolution.height;
            bgWidth = multiOrientationGame.portraitMode.splashSize.width;
            bgHeight = multiOrientationGame.portraitMode.splashSize.height;
            screenWidth = isLandscape? document.documentElement.clientHeight : document.documentElement.clientWidth;
            screenHeight = isLandscape? document.documentElement.clientWidth : document.documentElement.clientHeight;
        }else{
            designWidth = multiOrientationGame.landscapeMode.designResolution.width;
            designHeight = multiOrientationGame.landscapeMode.designResolution.height;
            bgWidth = multiOrientationGame.landscapeMode.splashSize.width;
            bgHeight = multiOrientationGame.landscapeMode.splashSize.height;
        }
    }
    var screenRatio = screenHeight/screenWidth;
    var designRatio = designHeight / designWidth;
    var fitWidth = (screenRatio > designRatio);
    var _ratio = fitWidth?screenWidth/designWidth:screenHeight/designHeight;
    splash.style.backgroundSize = (bgWidth*_ratio)+'px '+(bgHeight*_ratio)+'px';
    splash.style.width = screenWidth+'px';
    splash.style.height = screenHeight+'px';
    splash.style.display = 'block';
    setTimeout(function(){
		splash.style.opacity = 1;
    }, isMobile?100:500);
}

function isSupportMultiOrientationGame(settings){
    if(settings){
        var launchScene = settings.launchScene;
        var sceneName = getSceneNameFromPath(launchScene);
        if(sceneName){
            return multiOrientationGames[sceneName];
        }
    }
    return false;
}

function getSceneNameFromPath(scenePath){
    if(scenePath){
        var splitUrls = scenePath.split('/');
        var sceneName = splitUrls[splitUrls.length-1];
        sceneName = sceneName.split('.')[0];
        return sceneName;
    }
    return null;
}

function isLandscapeScreen(){
    if (window.matchMedia("(orientation: landscape)").matches) {
        return true;
    }
    if (window.matchMedia("(orientation: portrait)").matches) {
        return false;
    }
    return false;
}

function listenCallBack() {
    if(!splash){
        splash = getSplash();
    }
    var isLandscape = isLandscapeScreen();
    // console.log("==== Landscape is : "+ isLandscape);
    var mask = document.getElementById('mask');
    if (loadOver && typeof splash !== 'undefined') {
        splash.style.display = 'none';
    }

    var canvasDesignResolutionSize = cc.view.getDesignResolutionSize();
    if (canvasDesignResolutionSize) {
        isLandscapeCanvas = canvasDesignResolutionSize.width > canvasDesignResolutionSize.height;
    }

    var urlRuFS = new URL(window.location);
    var disableFullscreen = urlRuFS.searchParams.get('disableFullscreen');

    if (isMobile && isAndroid && isLandscapeCanvas && !disableFullscreen) {
        if (typeof divFullscreen !== 'undefined') {
            divFullscreen.style.display = "block";
            divFullscreen.style.visibility = "visible";
        }
    } else {
        if (typeof divFullscreen !== 'undefined') {
            divFullscreen.style.display = "none";
            divFullscreen.style.visibility = "hidden";
        }
    }
    
    // ! just for game portrait
    if(isMobile && !isLandscapeCanvas){
        showWarningUserRotate(isLandscape);
    }

    if (isMobile && isAndroid) {
        if (loadOver && splash) {
            splash.style.display = 'none';
        }
    }
    else if (isiPhone && isLandscape && isLandscapeCanvas && !isPortraitGame()) {
        var _isFullScreen = false;
        if (isSafari) {
            setTimeout(function () {   
                window.scrollTo(0,0);             
                if(iOsVersion <14.2){
                    if (window.innerHeight == document.documentElement.clientHeight) {
                        if (typeof mask !== 'undefined') {
                            mask.style.display = 'none';
                        }
                        if (typeof swipeUp !== 'undefined') {
                            swipeUp.disable();
                        }
                        isFullScreenIOS = true;
                    }
                    else { //未全屏显示则把div显示出来
                        if (typeof mask !== 'undefined') {
                            mask.style.display = 'block';
                        }
                        if (typeof swipeUp !== 'undefined') {
                            swipeUp.enable();
                        }
                        isFullScreenIOS = false;
                    }
                }else if(iOsVersion < 15){
                	if(window.innerHeight == window.outerHeight){
                		//absolute fullscreen
                		_isFullScreen = true;
                	}else{
						if (window.innerHeight == document.documentElement.clientHeight){
							if(window.outerHeight - window.innerHeight<30){
								//minimal top bar fullscreen
								_isFullScreen = true;
							}
						}
                	}
                    onIOSFullscreenChanged(_isFullScreen);
                }else{
                    isFullScreenIOS = true;
                    if (typeof swipeUp !== 'undefined') {
            			swipeUp.disable();
        			}
        			if (typeof mask !== 'undefined') {
            			mask.style.display = 'none';
        			}
                }
            }, 100);
        } else if (isChrome && isiPhone 
            && iOsVersion > 12) { 
            setTimeout(function (){
                if(window.innerHeight == window.outerHeight){
                //absolute fullscreen
                _isFullScreen = true;
                }else{
                    if(window.outerHeight-window.innerHeight<=heighOffsetToFS){
                        //minimal top bar fullscreen
                        _isFullScreen = true;
                    }
                }
                if(!_isFullScreen){
                    onIOSFullscreenChanged(false);
                }else{
                	notScrollCount = 0;
                	if (typeof mask !== 'undefined') {
            			mask.style.opacity = 0;
        			}
                }
            }, 100);
            
            if(!isShowWarning){
                isShowWarning = true;
                showWarningUserLockScreen();
            }
        }
    } else {
        if (typeof swipeUp !== 'undefined') {
            swipeUp.disable();
        }
        if (typeof mask !== 'undefined') {
            mask.style.display = 'none';
        }
        if (loadOver && splash) {
            splash.style.display = 'none';
        }
    }

    if (isMobile && isAndroid && isLandscapeCanvas) {
        setTimeout(function () {
            if (isLandscape) {
                // Landscape Orientation
                if (typeof enterFullscreenBtn !== 'undefined') {
                    enterFullscreenBtn.classList.remove("enterFullScreen_Landscape");
                    enterFullscreenBtn.classList.remove("enterFullScreen_Portrait");
                    enterFullscreenBtn.classList.add("enterFullScreen_Landscape");
                }
    
                if (typeof exitFullscreenBtn !== 'undefined') {
                    enterFullscreenBtn.classList.remove("exitFullscreen_Landscape");
                    enterFullscreenBtn.classList.remove("exitFullscreen_Portrait");
                    exitFullscreenBtn.classList.add("exitFullscreen_Landscape");
                }
            }
            else {
                // Portrait Orientation
                if (typeof enterFullscreenBtn !== 'undefined') {
                    enterFullscreenBtn.classList.remove("enterFullScreen_Portrait");
                    enterFullscreenBtn.classList.remove("enterFullScreen_Landscape");
                    enterFullscreenBtn.classList.add("enterFullScreen_Portrait");
                }

                if (typeof exitFullscreenBtn !== 'undefined') {
                    exitFullscreenBtn.classList.remove("exitFullscreen_Landscape");
                    exitFullscreenBtn.classList.remove("exitFullscreen_Portrait");
                    exitFullscreenBtn.classList.add("exitFullscreen_Portrait");
                }
            }
        }, 10);
    }
}

function onIOSFullscreenChanged(isFullscreen){
	var mask = document.getElementById('mask');
	if (!isFullscreen) {
        document.body.style.overflow = "auto";
        document.body.style.height =  '140vh';
        if (typeof mask !== 'undefined') {
            mask.style.display = 'block';
            mask.style.opacity = 0.5;
        }
        if (typeof swipeUp !== 'undefined' && isSafari) {
            swipeUp.enable();
        }
        isFullScreenIOS = false;
        if(!isChrome) return;
        if(checkFullscreenInterval){
            clearInterval(checkFullscreenInterval);
        }
        if(frameInterval){
            clearInterval(frameInterval);
        }
        notScrollCount = 0;
        checkFullscreenInterval = setInterval(checkFullScreenChromeIOS, 100);

        frameInterval = setInterval(updateFrame, 100);
    }
    else {
        if (typeof mask !== 'undefined') {
            mask.style.display = 'none';
        }
        if (typeof swipeUp !== 'undefined' && isSafari) {
            swipeUp.disable();
        }
        isFullScreenIOS = true;
        window.scrollTo(0,0);
        alignGameCanvasWithScreen(100);
    }
    
}

function onTouchEnded(){
	var isLandscape = isLandscapeScreen();
	if(!isLandscape) return;
	var canvasHeight = 9999;
	var canvas = cc.game.canvas;
	if(canvas){
		var str = canvas.style.height.substr(0,canvas.style.height.length-2);
    	canvasHeight = Number(str);
	}
    if(window.scrollX !=0 || window.scrollY>0 ||((window.innerHeight-canvasHeight)>10)){
        setTimeout(function (){
            window.scrollTo(0,0);
            alignGameCanvasWithScreen(100);
        }, 100);
    }
}
function onWindownTouchEnded(){
	isTouched = false;
	if (isSafari && isFullScreenIOS){
		setTimeout(function (){
            window.scrollTo(0,0);
        }, 10);
	}
}

function onWindownTouchStarted(){
	isTouched = true;
	isChecked = false;
}

function onScroll(){
    notScrollCount = 0;
    if(!checkFullscreenInterval){
        checkFullscreenInterval = setInterval(checkFullScreenChromeIOS, 100);
    }
    if(!frameInterval){
        frameInterval = setInterval(updateFrame, 100);
    }
}
function checkFullScreenChromeIOS(){
    if(window.outerHeight-window.innerHeight<=heighOffsetToFS && !isTouched){
    	if(!isChecked){
    		isChecked = true;
    		notScrollCount = 0;
    	}
    	if(notScrollCount>1){
	        setTimeout(function (){
	            onIOSFullscreenChanged(true);  
	            notScrollCount = 0;
	        }, 100);
	    	notScrollCount = 0;
	        setTimeout(function(){
	        	if(checkFullscreenInterval){
	                clearInterval(checkFullscreenInterval);
	                checkFullscreenInterval = false;
	            }
	            if(frameInterval){
	                clearInterval(frameInterval);
	                frameInterval = false;
	            }
	    	}, 300);
    	}	
    }
}

function updateFrame(){
    notScrollCount++;
}

function showWarningUserLockScreen(){
    var warningText = document.createElement('div');
    document.body.appendChild(warningText);
    warningText.innerHTML = "Vui lòng khoá xoay màn hình </br> hoặc sử dụng trình duyệt Safari</br>để có trải nghiệm chơi game tốt nhất!";

    warningText.style.pointerEvents = "none";
    warningText.style.zIndex = 1000;
    warningText.style.margin = "50px auto";
    warningText.style.backgroundColor =  "white";
    warningText.style.borderRadius = "10px";
    warningText.style.fontSize = "20px";
    warningText.style.padding = "5px 10px";
    warningText.style.color = "darkblue";

    warningText.style.opacity = "0";
    warningText.style.transition = "opacity 1s"; // animation fade
    
    setTimeout(function(){ // fadeIn
        warningText.style.opacity = "1";
    }, 10);

    setTimeout(function(){ // fadeOut
        warningText.style.opacity = "0";
    }, 4000);
}

function showWarningUserRotate(isLandscape) {
    if (isLandscape) {
        if (!divWarningUserRotate) {
            divWarningUserRotate = document.createElement("div");
            document.body.appendChild(divWarningUserRotate);
            divWarningUserRotate.style.position = "fixed";
            divWarningUserRotate.style.display = "flex";
            divWarningUserRotate.style.flexDirection = "collumn";
            divWarningUserRotate.style.top = "0px";
            divWarningUserRotate.style.left = "0px";
            divWarningUserRotate.style.width = "100vw";
            divWarningUserRotate.style.height = "100vh";
            divWarningUserRotate.style.overflow = "hidden";
            divWarningUserRotate.style.zIndex = 10000;
            divWarningUserRotate.style.backgroundColor = "black";
            divWarningUserRotate.style.opacity = "0.85";

            var text = document.createElement("div");
            divWarningUserRotate.appendChild(text);
            text.style.backgroundColor = "white";
            text.style.borderRadius = "10px";
            text.style.padding = "5px 10px";
            text.style.margin = "auto";
            text.innerHTML = "Vui lòng xoay màn hình </br> để tiếp tục chơi game!";
            text.style.fontSize = "20px";
            text.style.color = "darkblue";
        } else {
            divWarningUserRotate.style.display = "flex";
        }
        document.body.style.position = "fixed";
    } else {
        document.body.style.position = "absolute";
        if (divWarningUserRotate) {
            divWarningUserRotate.style.display = "none";
        }
    }
}

function onOrientationChanged(){
    if(isiPhone){
        if(window.orientation == 90 || window.orientation == -90){
            listenChangeSize(false);
            alignGameCanvasWithScreen(200);
        }else {
            listenChangeSize(true);
        }
    }
}

function alignGameCanvasWithScreen(delayTime = 0){
    setTimeout(function () {
        var canvas = cc.game.canvas;
        var container = cc.game.container;
        var str = canvas.style.height.substr(0,canvas.style.height.length-2);
    	var canvasHeight = Number(str);
    	if(canvasHeight>=window.innerHeight) return;
        canvas.width = window.innerWidth * cc.view.getDevicePixelRatio();
        canvas.height = window.innerHeight * cc.view.getDevicePixelRatio();

        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';

        container.style.width = window.innerWidth + 'px';
        container.style.height = window.innerHeight + 'px';
        cc.view._viewportRect.width = window.innerWidth * cc.view.getDevicePixelRatio();
        cc.view._viewportRect.height = window.innerHeight * cc.view.getDevicePixelRatio();

        var policy = cc.view.getResolutionPolicy();
        if (policy) {
            policy.preApply(cc.view);
        }else{
            return;
        }
        cc.view._adjustViewportMeta();
        cc.view._initFrameSize();

        cc.view._frameSize.width = window.innerWidth;
        cc.view._frameSize.height = window.innerHeight;

        cc.game.frame.style.width = window.innerWidth + "px";
        cc.game.frame.style.height = window.innerHeight + "px";

        var result = policy.apply(cc.view, cc.view._designResolutionSize);

        if(result.scale && result.scale.length === 2){
            cc.view._scaleX = result.scale[0];
            cc.view._scaleY = result.scale[1];
        }

        if(result.viewport){
            var vp = cc.view._viewportRect,
                vb = cc.view._visibleRect,
                rv = result.viewport;

            vp.x = rv.x;
            vp.y = rv.y;
            vp.width = rv.width;
            vp.height = rv.height;

            vb.x = 0;
            vb.y = 0;
            vb.width = rv.width / cc.view._scaleX;
            vb.height = rv.height / cc.view._scaleY;
        }

        policy.postApply(cc.view);


        cc.winSize.width = cc.view._visibleRect.width;
        cc.winSize.height = cc.view._visibleRect.height;

        cc.visibleRect && cc.visibleRect.init(cc.view._visibleRect);


        cc.renderer.updateCameraViewport();
        cc.view.emit('design-resolution-changed');
        var canvasNode = cc.find("Canvas");
        if(canvasNode){
            var canvasComponent = canvasNode.getComponent(cc.Canvas);
            if(canvasComponent){
                canvasComponent.alignWithScreen();
                cc._widgetManager.onResized();
            }
        }else{
            console.log("do not node: Canvas");
        }
        var eventFullScreenIOs = new Event('onFullScreenIOs');
        window.dispatchEvent(eventFullScreenIOs);
    }, delayTime);
}

function setFullScreen(settings) { // eslint-disable-line
    var options;
    var canvasDesignResolutionSize = cc.view.getDesignResolutionSize();
    if (canvasDesignResolutionSize) {
        isLandscapeCanvas = canvasDesignResolutionSize.width > canvasDesignResolutionSize.height;
    }
    divFullscreen = document.getElementById('div_full_screen');
    handImage = document.getElementById('handImage');
    enterFullscreenBtn = document.getElementById('enterFullscreen');
    exitFullscreenBtn = document.getElementById('exitFullscreen');
    if(isMobile && iOS){
    	window.ontouchend = onWindownTouchEnded;
        window.ontouchstart = onWindownTouchStarted;
        if(isChrome){
    		var gameCanvas = document.getElementById('GameCanvas');
    		if(gameCanvas) gameCanvas.ontouchend = onTouchEnded;
            window.onscroll = onScroll;
        }
    }
    var urlRuFS = new URL(window.location);
    var disableFullscreen = urlRuFS.searchParams.get('disableFullscreen');
    iOsVersion = Number(cc.sys.osVersion.split("_")[0]) + Number(cc.sys.osVersion.split("_")[1])*0.1;
    
    if (isMobile && isAndroid && isLandscapeCanvas && !disableFullscreen) {
        if (typeof divFullscreen !== 'undefined') {
            divFullscreen.style.display = "block";
            divFullscreen.style.visibility = "visible";
        }

        if (typeof enterFullscreenBtn !== 'undefined') {
            enterFullscreenBtn.addEventListener("touchend", toggleFullscreen, false);
        }

        if (typeof exitFullscreenBtn !== 'undefined') {
            exitFullscreenBtn.addEventListener("touchend", toggleFullscreen, false);
        }

        if (document.addEventListener) {
            document.addEventListener('webkitfullscreenchange', onFullscreenChanged, false);
            document.addEventListener('mozfullscreenchange', onFullscreenChanged, false);
            document.addEventListener('fullscreenchange', onFullscreenChanged, false);
            document.addEventListener('MSFullscreenChange', onFullscreenChanged, false);

            document.addEventListener('fullscreenerror', onFullscreenError, false);
            document.addEventListener('mozfullscreenerror', onFullscreenError, false);
            document.addEventListener('webkitfullscreenerror', onFullscreenError, false);
            document.addEventListener('msfullscreenerror', onFullscreenError, false);

        }
    } else {
        if (typeof divFullscreen !== 'undefined') {
            divFullscreen.style.display = "none";
            divFullscreen.style.visibility = "hidden";
        }
    }

    if (typeof handImage !== 'undefined') {
        handImage.style.display = 'none';
    }
    if (isMobile && iOS) {
        options = {
            swipeUpContent: '',
            // expandBodyHeightTo: '115vh',
            scrollWindowToTopOnShow: true,
            html5FullScreenContent: '',
        };
    } else if (isMobile && isAndroid)
        options = { 
            swipeUpContent: '',
            customCSS: '.fixedFlexBox { position: absolute; top: 0;left: 0; right: 0; bottom: 0; width: 100%;height: 100%; background: rgba(20, 20, 20, 0.001)}',
            html5FullScreenContent: '',
        };
    if (typeof SwipeUp !== 'undefined') {
        swipeUp = new SwipeUp(options);
    }
   
    window.addEventListener('resize', listenCallBack);
    window.addEventListener('orientationchange', onOrientationChanged);
    listenCallBack();

    if(isiPhone){
        window.addEventListener('gameShow', function(){
            var isLandscape = isLandscapeScreen();
            if(isFullScreenIOS && isLandscape || isPortraitGame()){
                if(cc.view._frameSize.width !== window.innerWidth || cc.view._frameSize.height !== window.innerHeight){
                    alignGameCanvasWithScreen(0);
                }
            }
        });
        window.addEventListener('focus', function (){
            checkViewIOS();
        });
        checkViewIOS(); // !for case reload 
    }
    
    cc.view.enableRetina(true);
    cc.view.resizeWithBrowserSize(true);

    if (cc.sys.isBrowser) {
        setLoadingDisplay();
    }

    if (cc.sys.isMobile) {
        if (settings.orientation === 'landscape') {
            cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
        }
        else if (settings.orientation === 'portrait') {
            cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
        }
    }
}

function checkWrongClientHeight() {
    if (document.documentElement.clientHeight > window.innerHeight) { // fix for open chrome tab from link.
        if (!cc.view) return;
        if (!cc.view._originalInitFrameSize) {
            cc.view._originalInitFrameSize = cc.view._initFrameSize;
        }
        cc.view._initFrameSize = function () {
            var view = cc.view;
            var locFrameSize = view._frameSize;
            var w = Math.min(document.documentElement.clientWidth, window.innerWidth);
            var h = Math.min(document.documentElement.clientHeight, window.innerHeight);
            var isLandscape = w >= h;

            if (!cc.sys.isMobile ||
                (isLandscape && this._orientation & cc.macro.ORIENTATION_LANDSCAPE) ||
                (!isLandscape && this._orientation & cc.macro.ORIENTATION_PORTRAIT)) {
                locFrameSize.width = window.innerWidth;
                locFrameSize.height = window.innerHeight;
                cc.game.container.style['-webkit-transform'] = 'rotate(0deg)';
                cc.game.container.style.transform = 'rotate(0deg)';
                view._isRotated = false;
            }
            else {
                locFrameSize.width = h;
                locFrameSize.height = w;
                cc.game.container.style['-webkit-transform'] = 'rotate(90deg)';
                cc.game.container.style.transform = 'rotate(90deg)';
                cc.game.container.style['-webkit-transform-origin'] = '0px 0px 0px';
                cc.game.container.style.transformOrigin = '0px 0px 0px';
                view._isRotated = true;
            }

            if (cc.view._orientationChanging) {
                setTimeout(function () {
                    cc.view._orientationChanging = false;
                }, 1000);
            }
        };
        cc.view._resizeEvent();
    }
    else {
        if (cc.view && cc.view._originalInitFrameSize) {
            cc.view._initFrameSize = cc.view._originalInitFrameSize;
        }
    }
    if (window.innerHeight === window.screen.height) {
        alert("Vui lòng xoay màn hình qua lại để game hiển thị đúng");
    }
}

function toggleFullscreen() {
    if (document.fullscreenElement || /* Standard syntax */
        document.webkitFullscreenElement || /* Chrome, Safari and Opera syntax */
        document.mozFullScreenElement ||/* Firefox syntax */
        document.msFullscreenElement) {

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }

        if (typeof exitFullscreenBtn !== 'undefined') {
            exitFullscreenBtn.style.display = 'none';
        }

    } else {
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.msRequestFullscreen) {
            docElm = document.body; //overwrite the element (for IE)
            docElm.msRequestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }

        if (typeof enterFullscreenBtn !== 'undefined') {
            enterFullscreenBtn.style.display = 'none';
        }
    }
}

function onFullscreenChanged() {
    if (isMobile && isAndroid) {
        if (document.fullscreenElement || /* Standard syntax */
            document.webkitFullscreenElement || /* Chrome, Safari and Opera syntax */
            document.mozFullScreenElement ||/* Firefox syntax */
            document.msFullscreenElement) {
            setTimeout(function () {
                if (typeof exitFullscreenBtn !== 'undefined') {
                    exitFullscreenBtn.style.display = 'block';
                }
                if (typeof enterFullscreenBtn !== 'undefined') {
                    enterFullscreenBtn.style.display = 'none';
                }
            }, 10);

        } else {
            setTimeout(function () {
                if (typeof enterFullscreenBtn !== 'undefined') {
                    enterFullscreenBtn.style.display = 'block';
                }
                if (typeof exitFullscreenBtn !== 'undefined') {
                    exitFullscreenBtn.style.display = 'none';
                }
            }, 10);
        }
    }
}

function onFullscreenError() {
    setTimeout(function () {
        if (typeof enterFullscreenBtn !== 'undefined') {
            enterFullscreenBtn.style.display = 'block';
        }
        if (typeof exitFullscreenBtn !== 'undefined') {
            exitFullscreenBtn.style.display = 'none';
        }
    }, 10);
}

function setLoadingDisplay() {
    // var progressBar = splash.querySelector('.progress-bar span');
    // cc.loader.onProgress = function (completedCount, totalCount, item) {
    // var percent = 100 * completedCount / totalCount;
    // if (progressBar) {
    //     progressBar.style.width = percent.toFixed(2) + '%';
    // }
    // };
    // splash.style.display = 'block';
    // progressBar.style.width = '0%';

    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, hideSplashOnSceneLoaded);
}

function hideSplashOnSceneLoaded(scene){
    if(multiOrientationGame){
        var launchScene = settings.launchScene;
        var startSceneName = getSceneNameFromPath(launchScene);
        if(scene.name!== startSceneName){
            hideSplashByDelay(500);
            cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, hideSplashOnSceneLoaded);
        }
    }else{
        hideSplashByDelay(500);
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, hideSplashOnSceneLoaded);
    }
}

function hideSplashByDelay(delay){
    setTimeout(function () {
        if (!splash) splash = getSplash();
        if (splash) {
            splash.style.display = 'none';
        }
        loadOver = true;
    }, delay);
    listenCallBack();
}

function getApiUrl(url)
{
    var urlPart = url.split('/');
    return urlPart[0] + "//" + urlPart[2] + "/share/lib.js";
}

function validURL(str) 
{
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

var urlRu = new URL(window.location);
var paramHref = urlRu.searchParams.get('ru');
if (paramHref && validURL(paramHref))
{
    var isDomainFound = false;
    for (var i = 0; i < listDomain.length; i++) {
        if (paramHref.indexOf(listDomain[i]) > -1) {
            isDomainFound = true;
        }
    }
    if (!isDomainFound) {
        var fullUrl = getApiUrl(paramHref);
        var depositLib = document.createElement('script');
        depositLib.type = "text/javascript";
        depositLib.src = fullUrl;
        document.body.appendChild(depositLib);
    }   
}

/**
 * @fix_portrait_iphone
 */
function checkViewIOS(){
    if (window.orientation == 90 || window.orientation == -90) { // landscape
        alignGameCanvasWithScreen(0);
        listenChangeSize(false);
    } else {
        listenChangeSize(true);
    }
}

function listenChangeSize(isListen) {
    lastWindowHeight = 0;
    if (isListen) {
        if(intervalCheckSize) {
            clearInterval(intervalCheckSize);
            intervalCheckSize = void 0;
        }
        intervalCheckSize = setInterval(checkSize, 500);
    } else {
        if(intervalCheckSize){
            clearInterval(intervalCheckSize);
            intervalCheckSize = void 0;
        }
        document.body.style.top = "0px";
        cc.view._resizeEvent();
    }
}

function checkSize() {
    if(isChrome && !isPortraitGame()){
        checkWrongClientHeight();
    }
    if (isKeyboardShow()) return;
    
    if (isSafari) {
        window.scrollTo(0, 0);
    } else if (isChrome) {
        if (window.pageYOffset !== 0) {
            window.scrollBy(0, -1 * window.pageYOffset);
        }
    }

    var isMinimalUI = checkMinimalUI();

    if (isMinimalUI) {
        var diff = Math.abs(lastWindowHeight - window.innerHeight);
        lastWindowHeight = window.innerHeight;
        if (diff > 20) { // minimal-ui: resize but keep listener
            if (isChrome) {
                var offsetY = isIphoneX ? Math.abs(window.innerHeight - document.documentElement.clientHeight) / 3
                    : Math.abs(window.innerHeight - document.documentElement.clientHeight) / 4;
                document.body.style.top = offsetY + "px";
            }
            setTimeout(function () {
                cc.view._resizeEvent();
            }, 20);
        }
    } else { // full-ui: resize and clear listener
        lastWindowHeight = window.innerHeight;
        document.body.style.top = "0px";
        if (intervalCheckSize) {
            clearInterval(intervalCheckSize);
            intervalCheckSize = void 0;
        }
        setTimeout(function () {
            cc.view._resizeEvent();
        }, 20);
    }
}

function checkMinimalUI(){
    var diffHeight = (window.innerHeight - document.documentElement.clientHeight);
    return diffHeight > 40;
}

function isKeyboardShow(){
    var currentViewSize = window.innerWidth + window.innerHeight;
    var diff = Math.abs(currentViewSize - originalViewSize);
    return diff > 100;
}

var XORCipher = {
    encode: function(key, data) {
        data = xor_encrypt(key, data);
        return b64_encode(data);
    },
    decode: function(key, data) {
        data = b64_decode(data);
        return xor_decrypt(key, data);
    },
};

function stringToUtf8ByteArray(str) {
    var out = [], p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        } else if (
            ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
                ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        } else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
}

function utf8ByteArrayToString(bytes) { // array of bytes
    var out = [], pos = 0, c = 0;
    while (pos < bytes.length) {
        var c1 = bytes[pos++];
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        } else if (c1 > 191 && c1 < 224) {
            var c2 = bytes[pos++];
            out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
        } else if (c1 > 239 && c1 < 365) {
            // Surrogate Pair
            var c2 = bytes[pos++]; // eslint-disable-line
            var c3 = bytes[pos++];
            var c4 = bytes[pos++];
            var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
                    0x10000;
            out[c++] = String.fromCharCode(0xD800 + (u >> 10));
            out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
        } else {
            var c2 = bytes[pos++]; // eslint-disable-line
            var c3 = bytes[pos++]; // eslint-disable-line
            out[c++] =
                    String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        }
    }
    return out.join('');
}

var b64_table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function b64_encode(data) {
    var o1, o2, o3, h1, h2, h3, h4, bits, r, i = 0, enc = "";
    if (!data) { return data; }
    do {
        o1 = data[i++];
        o2 = data[i++];
        o3 = data[i++];
        bits = o1 << 16 | o2 << 8 | o3;
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
        enc += b64_table.charAt(h1) + b64_table.charAt(h2) + b64_table.charAt(h3) + b64_table.charAt(h4);
    } while (i < data.length);
    r = data.length % 3;
    return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
}

function b64_decode(data) {
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, result = [];
    if (!data) { return data; }
    data += "";
    do {
        h1 = b64_table.indexOf(data.charAt(i++));
        h2 = b64_table.indexOf(data.charAt(i++));
        h3 = b64_table.indexOf(data.charAt(i++));
        h4 = b64_table.indexOf(data.charAt(i++));
        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;
        result.push(o1);
        if (h3 !== 64) {
            result.push(o2);
            if (h4 !== 64) {
                result.push(o3);
            }
        }
    } while (i < data.length);
    return result;
}

function xor_encrypt(key, data) {
    key = stringToUtf8ByteArray(key);
    return stringToUtf8ByteArray(data).map(function(c, i) {
        return c ^ Math.floor(i % key.length);
    });
}

function xor_decrypt(key, data) {
    key = stringToUtf8ByteArray(key);
    return utf8ByteArrayToString(data.map(function(c, i) {
        return c ^ Math.floor(i % key.length);
    }));
}

var configLinkEnc = '/config-enc.json';
function methodGetData(url, callback, callbackErr) {
    var request = new XMLHttpRequest();
    var timeStampBuild = window.buildTime ? parseInt(window.buildTime) : new Date().getTime();
    var fullURL = url + '?t=' + timeStampBuild;
    request.open("GET", fullURL, true);
    request.timeout = 3000;
    request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            //get status text
            if (request.responseText) {
                callback(JSON.parse(request.responseText));
            } else {
                handleBackGame();
            }
        } else if (request.readyState === 0) {
            callbackErr();
        }
        if (request.status !== 200) {
            callbackErr();
        }
    };
    request.ontimeout = function () {
        callbackErr();
    };
    request.onerror = function () {
        callbackErr();
    };
    request.send();
}

function encodeQueryData(data) {
    return Object.keys(data).map(function(key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");
}

function methodPostData(url, data, callback, callbackErr) {
    var request = new XMLHttpRequest();
    var fullURL = url;
    request.open('POST', fullURL, true);
    request.timeout = 3000;
    var dataPost = encodeQueryData(data);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            //get status text
            if (request.responseText) {
                callback(JSON.parse(request.responseText));
            } else {
                callbackErr();
            }
        } else if (request.readyState === 0) {
            callbackErr();
        }
        if (request.status !== 200) {
            callbackErr();
        }
    };
    request.ontimeout = function () {
        // callbackErr();
    };
    request.onerror = function () {
        callbackErr();
    };
    request.send(dataPost);
}

function handleBackGame(mess) {
    if (window.dataConfigM && window.dataConfigM.IS_PRODUCTION) {
        alert(mess ? mess: 'Xác thực tài khoản thất bại.');
        if (paramHref) {
            if (paramHref.trim() === 'close') {
                window.close();
            } else {
                window.location.href = paramHref;
            }
        } else {
            window.close();
        }
    }
}
var historyParam = urlRu.searchParams.get('history');
var trialParam = urlRu.searchParams.get('trialMode');
function handleLogin(API_URL, dataPost) {
    methodPostData(API_URL + 'auth/token/login', dataPost, function (res) {
        if (res && res.data) {
            if (!res.data.displayName || !res.data.token || !res.data.userId || !res.data.wallet) {
                handleBackGame();
            } else {
                window.dataLoginM = res.data;
            }
        } 
        else if (res && res.error && res.error.code === 4072) {
            handleBackGame('Bạn bị khoá chơi game ' + document.title.replace('Techplay - ', '') + '!');
        }
        else {
            handleBackGame();
        }
    }, function () {
        handleBackGame();
    });
}

if (!(historyParam && historyParam === 'true') && !trialParam) {
    var token = urlRu.searchParams.get('token');
    var thirdParam = urlRu.pathname.replace(/\//g, '');
    thirdParam = thirdParam.replace('kts', 'kts_').replace('ktf', 'ktf_').replace('ktc', 'ktc_').replace('ktrng', 'ktrng_');
    var dataPost = { token: token, gameId: thirdParam };
    if (!token) {
        handleBackGame();
    } else {
        methodGetData(configLinkEnc,
            function(data) {
                if (data.IS_DECODE) {
                    Object.keys(data).forEach(function(key) {
                        if (key === 'API_URL' || key === 'SOCKET_URL' || key.indexOf('IPMaster') > -1) {
                            data[key] = XORCipher.decode('Không Biết Đặt Tên Gì', data[key]);
                        }
                    });
                }
                delete data.IS_DECODE;
                window.dataConfigM = data;
                window.localStorage.setItem('applicationConfig', JSON.stringify(window.dataConfigM));
                
                handleLogin(data.API_URL, dataPost);
            }, function() {
                var localStoredConfig = localStorage.getItem('applicationConfig');
                if (localStoredConfig) {
                    localStoredConfig = JSON.parse(localStoredConfig);
                    handleLogin(localStoredConfig.API_URL, dataPost);
                }
            });
    }
}