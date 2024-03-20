if (window.boot = function() {
    var e = window._CCSettings;
    if (window._CCSettings = void 0, !e.debug) {
        var s = e.uuids,
            r = e.rawAssets,
            c = e.assetTypes,
            i = e.rawAssets = {};
        for (var n in r) {
            var t = r[n],
                o = i[n] = {};
            for (var a in t) {
                var u = t[a],
                    d = u[1];
                "number" == typeof d && (u[1] = c[d]), o[s[a] || a] = u
            }
        }
        for (var l = e.scenes, g = 0; g < l.length; ++g) {
            var b = l[g];
            "number" == typeof b.uuid && (b.uuid = s[b.uuid])
        }
        var m = e.packedAssets;
        for (var w in m)
            for (var p = m[w], v = 0; v < p.length; ++v) "number" == typeof p[v] && (p[v] = s[p[v]]);
        var f = e.subpackages;
        for (var y in f) {
            var A = f[y].uuids;
            if (A)
                for (var j = 0, R = A.length; j < R; j++) "number" == typeof A[j] && (A[j] = s[A[j]])
        }
    }
    window.addEventListener("resize", function() {
        cc.sys.isMobile && cc.sys.browserType == cc.sys.BROWSET_TYPE_SAFARI && window.innerHeight != document.documentElement.clientHeight && (document.body.scrollTop = (document.documentElement.clientHeight - window.innerHeight) / 2)
    });
    var E = e.jsList,
        _ = e.debug ? "src/project.dev.js" : "src/project.js";
    E ? (E = E.map(function(e) {
        return "src/" + e
    })).push(_) : E = [_];
    var h = {
        id: "GameCanvas",
        scenes: e.scenes,
        debugMode: e.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: e.debug,
        frameRate: 60,
        jsList: E,
        groupList: e.groupList,
        collisionMatrix: e.collisionMatrix
    };
    cc.AssetLibrary.init({
        libraryPath: "res/import",
        rawAssetsBase: "res/raw-",
        rawAssets: e.rawAssets,
        packedAssets: e.packedAssets,
        md5AssetsMap: e.md5AssetsMap,
        subpackages: e.subpackages
    }), cc.game.run(h, function() {
        cc.loader.downloader._subpackages = e.subpackages, cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID && (cc.macro.DOWNLOAD_MAX_CONCURRENT = 2), "function" == typeof setFullScreen && setFullScreen(e),
            function (e) {
                cc.director.preloadScene(e, null, function (error) {
                    if (error) {
                        setInterval(function () {
                            if (navigator.onLine) {
                                location.reload();
                            }
                        }, 1000)
                    } else {
                        cc.director.loadScene(e, function () {
                            if (cc.sys.isBrowser) {
                                document.getElementById("GameCanvas").style.visibility = "";
                                var s = document.getElementById("GameDiv");
                                s && (s.style.backgroundImage = "")
                            }
                            cc.loader.onProgress = null, console.log("Success to load scene: " + e)
                        });

                    }
                });
            }(e.launchScene)
    }), 
    
    cc.sys.isMobile ? cc.view._maxPixelRatio = 1.7 : cc.view._maxPixelRatio = 1.6;
    if (navigator.userAgent.indexOf('SM-J730GM Build/NRD90M') > -1) {
        cc.view._maxPixelRatio = 1;
    }
}, window.jsb) {
var isRuntime = "function" == typeof loadRuntime;
isRuntime ? (require("src/settings.js"), require("src/cocos2d-runtime.js"), require("jsb-adapter/engine/index.js")) : (require("src/settings.js"), require("src/cocos2d-jsb.js"), require("jsb-adapter/jsb-engine.js")), cc.macro.CLEANUP_IMAGE_CACHE = !0, window.boot()
}