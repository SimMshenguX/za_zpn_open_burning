// INTEGRATION INPUT VALUES
var isisKey = 229568;
var caseType = "ZE05";
var caseID = 700000051
var applicationType = "Other";
var allowEdits = true;
// INTEGRATION INPUT VALUES END

// Map Layers
var propertyGraphicsLayer = null;
var ehmGraphicsLayer = null;
var aerialImageryLayer = null;

// JS API Objs
var view = null;
var webmap = null;
var sketchWidget = null;

// JQuery DOM elements
var $panelTitleLabel = null;
var $panelDiv = null;
var $viewDiv = null;
var $sketchDiv = null;
var $noticeDiv = null;
var $loaderDiv = null;
var $noticeMessageDiv = null;
var $btnConfirmAddressLocation = null
var $btnClearMap = null;
var $btnAerialPhoto = null;
var $selectAddress = null;
var $iconAerialImagery = null;
var $noticeMessageDiv = null;
var $propertResultsDiv = null;
var $lblPropertyResultsCount = null;

// Global/Initial Values
var selectedProperty = null;
var isUpdating = false;
var caseConfig = null;

// Symbols
var symbolLineCyan = {
    type: "simple-line",
    color: "cyan",
    width: "3px"
}
var symbolLineRed = {
    type: "simple-line",
    color: "red",
    width: "3px"
}
var symbolPointRed = {
    type: "simple-marker",
    style: "circle",
    color: [1, 1, 1, 0.1],
    outline: symbolLineRed
}
var symbolFillRed = {
    type: "simple-fill",
    color: [1, 1, 1, 0.1],
    outline: symbolLineRed
}

$(function () {
    app.loadMap();
    //sim updated
    debugger;
    
    
    $btnConfirmAddressLocation = $("#btnConfirmAddressLocation");
    $panelTitleLabel = $("#panelTitleLabel");
    $btnClearMap = $("#btnClearMap");
    $btnAerialPhoto = $("#btnAerialPhoto");
    $selectAddress = $("#selectAddress");
    $sketchDiv = $("#sketchDiv");
    $iconAerialImagery = $("#iconAerialImagery")
    $noticeMessageDiv = $("#noticeMessageDiv");
    $propertResultsDiv = $("#propertResultsDiv");
    $lblPropertyResultsCount = $("#lblPropertyResultsCount");
    $noticeDiv = $("#noticeDiv");
    $loaderDiv = $("#loaderDiv");
    $tabs = $("#tabs")
    $panelDiv = $("#panelDiv");
    $viewDiv = $("#viewDiv");

    var configsFilter = config.caseConfigs.filter(function (conf) {
        return conf.caseTypeCode == caseType
    });

    caseConfig = configsFilter[0];

    if (!caseConfig) {
        app.notifyUser.show("error", `Application not configured for CaseType ${caseType}`)
        return;
    }

    $panelTitleLabel.text(caseConfig.caseTypeLabel)

    $selectAddress.on("calciteSelectChange", function (evt) {
        app.handleAddressSelect(evt)
    })

    $btnAerialPhoto.click(function () {
        app.toggleAerialImagery();
    })

    $btnConfirmAddressLocation.click(function () {
        var polygons = [];
        var points = [];

        ehmGraphicsLayer.graphics.items.forEach(function (gra) {
            if (gra.geometry) {
                if (gra.geometry.type == "point") {
                    points.push({
                        geometry: gra.geometry,
                        attributes: null
                    })
                } else if (gra.geometry.type == "polygon") {
                    polygons.push({
                        geometry: gra.geometry,
                        attributes: null
                    })
                }
            }
        })

        // INTEGRATION OUTPUT VALUES
        /* Here an array of point and polygon geometries are provided to the SAP UI5 application.
        *  The SAP component will attach attributes from the Case and foward the features to SAP PO
        *  for insert.
        */
        var EHMFeatures = {
            POINTS: points,
            POLYGONS: polygons
        }
        console.log({ EHMFeatures })
        //INTEGRATION OUTPUT VALUES END
        
        //Sim update 
        var arrayFeatures = JSON.stringify(EHMFeatures);
         sessionStorage.setItem("featuresToPass",arrayFeatures); 
         
    })

    $btnClearMap.click(function () {
        isisKey = sessionStorage.getItem("plno");
        app.getPropertyByIsisKey(isisKey, app.handleGetProperty)
        app.loadFeatures(view, app.handleLoadFeatures)
    });
})

var app = {
    handlePointerUp: function (p) {
        if (isUpdating) {
            sketchWidget.complete();
        }
    },
    toggleAerialImagery: function (forceValue) {

        aerialImageryLayer.visible = !aerialImageryLayer.visible;

        if (forceValue) {
            aerialImageryLayer.visible = forceValue
        }

        var iconName = aerialImageryLayer.visible ? "view-visible" : "view-hide";
        $iconAerialImagery.prop("icon", iconName)
    },
    loadMap: function () {
        console.time("Webmap Load Time")

        require(["esri/config",
            "esri/WebMap",
            "esri/views/MapView"],
            function (esriConfig,
                WebMap,
                MapView) {

                if (config.pushPortalUrlTrustedServers)
                    esriConfig.request.trustedServers.push(portalUrl);
                esriConfig.portalUrl = config.portalUrl

                webmap = new WebMap({
                    portalItem: {
                        id: config.webmapID
                    }
                });

                view = new MapView({
                    map: webmap,
                    container: "viewDiv",
                    navigation: {
                        mouseWheelZoomEnabled: false,
                        browserTouchPanEnabled: false
                    },
                    constraints: {
                        rotationEnabled: false
                    }
                });

                view.when(app.handleViewLoaded);

                view.watch("widthBreakpoint", app.handleWidthBreakpointWatch);

                view.on("mouse-wheel", app.handleMouseWheel);
                //view.on("pointer-down", app.handlePointerDown);
                view.on("pointer-up", app.handlePointerUp)
            })
    },
    setLayout: function (device) {
        if (device == "mobile") {
            $panelDiv.removeClass("panel-float");
            $panelDiv.addClass("panel-dock");
            $panelDiv.css("max-width", "");
        } else { // Desktop
            $panelDiv.removeClass("panel-dock");
            $panelDiv.addClass("panel-float");
            $panelDiv.css("max-width", "300px")
        }
    },
    handleWidthBreakpointWatch: function (breakpoint) {
        switch (breakpoint) {
            case "xsmall":
                app.setLayout("mobile")
                break;
            case "small":
            case "medium":
            case "large":
            case "xlarge":
                app.setLayout("desktop")
                break;
        }
    },
    handleGraphicsLayersAdded: function () {
        isisKey = sessionStorage.getItem("plno");
        app.getPropertyByIsisKey(isisKey, app.handleGetProperty)
        app.loadFeatures(view, app.handleLoadFeatures);
    },
    getPropertyByIsisKey: function (isisKey, callback) {
        require(["esri/rest/support/Query", "esri/rest/query"],
            function (Query, query) {

                var q = new Query();
                q.where = `SL_LAND_PRCL_KEY=${isisKey}`;
                q.returnGeometry = true;
                q.outFields = ["*"];

                var queryPropertyService = query.executeQueryJSON(config.appUrls.propertyServiceUrl + "/0", q);

                app.loader.show("Querying Property");
                queryPropertyService.then(function (featureSet) {
                    app.loader.hide()
                    callback(featureSet.features)
                }, function (error) {
                    app.loader.hide()
                    console.error({ error })
                    app.notifyUser.show("error", `Property Query: ${error.message}`)
                })
            })
    },
    handlePointerDown: function (event) {
        console.log(event)
        if (event.pointerType === "touch") {
            app.notifyUser.show("info", "To zoom in please use the zoom (+/-) buttons or use two fingers.");
        }
    },
    handleMouseWheel: function (params) {
        app.notifyUser.show("info", "To zoom in please double click the map or use the zoom (+/-) buttons.");
    },
    handleViewLoaded: function (view) {
        console.timeEnd("Webmap Load Time");

        app.loadWidgets(view, app.handleWidgetsLoaded);
        app.setAerialLayer(view);
        app.handleWidthBreakpointWatch(view.widthBreakpoint);

        app.loadGraphicsLayers(webmap, app.handleGraphicsLayersAdded);

    },
    handleWidgetsLoaded: function (view) {
        if (!allowEdits) {
            $btnConfirmAddressLocation.prop("disabled", true)
        } else {
            if (!sketchWidget)
                app.createSketchTool(view)
        }
    },
    handleLoadFeatures: function (features) {
        require(["esri/Graphic"],
            function (Graphic) {

                var popupTemplate = {
                    content: [{
                        type: "fields",
                        fieldInfos: caseConfig.fieldInfos
                    }]
                }

                ehmGraphicsLayer.removeAll();
                features.forEach(function (feature) {

                    if (feature.geometry) {
                        var gra = new Graphic()

                        //gra.popupTemplate = popupTemplate;
                        gra.attributes = feature.attributes;

                        if (feature.geometry.type == "point") {
                            if (feature.geometry.x && feature.geometry.y) {
                                gra.geometry = feature.geometry
                                gra.symbol = symbolPointRed
                            }
                        } else if (feature.geometry.type == "polygon") {
                            gra.geometry = feature.geometry
                            gra.symbol = symbolFillRed
                        }

                        ehmGraphicsLayer.add(gra);
                    }
                });
            })
    },
    loadFeatures: function (view, callback) {
        require(["esri/rest/support/Query",
            "esri/rest/query",
            "esri/geometry/SpatialReference",
            "dojo/promise/all"],
            function (Query,
                query,
                SpatialReference,
                all) {

                var q = new Query();

                q.where = `${caseConfig.caseGISKeyFieldName} = ${caseID}`
                //q.where = "1=1"
                q.outSpatialReference = new SpatialReference({
                    wkid: 3857
                })
                q.outFields = ["*"];
                q.returnGeometry = true;

                app.loader.show("Querying EHM features...");

                var queries = [];
                caseConfig.featureServices.forEach(function (featureService) {
                    var queryFeatures = query.executeQueryJSON(featureService.url + "/0", q);
                    queries.push(queryFeatures);
                });

                all(queries).then(function (featureSets) {
                    app.loader.hide();
                    var features = []
                    featureSets.forEach(function (featureSet) {
                        features.push.apply(features, featureSet.features)
                    })
                    callback(features);
                }, function (error) {
                    app.loader.hide();
                    console.error(error);
                    app.notifyUser.show("error", "We are unable to query your property details at this time.")
                })
            })
    },
    createSketchTool: function (view) {
        require(["esri/widgets/Sketch",
            "esri/widgets/Sketch/SketchViewModel"],
            function (Sketch, SketchViewModel) {

                var sketchVM = new SketchViewModel({
                    pointSymbol: symbolPointRed,
                    polygonSymbol: symbolFillRed
                })

                sketchWidget = new Sketch({
                    container: $sketchDiv[0],
                    availableCreateTools: caseConfig.getGeometryTypes(applicationType),
                    creationMode: "single",
                    layer: ehmGraphicsLayer,
                    view: view,
                    viewModel: sketchVM,
                    visibleElements: {
                        duplicateButton: false,
                        settingsMenu: false,
                        undoRedoMenu: false,
                        selectionTools: {
                            "lasso-selection": false/*,
                            "rectangle-selection": false*/
                        }
                    }
                });

                sketchWidget.on("create", app.handleSketchCreate);
                sketchWidget.on("update", app.handleSketchUpdate);
                sketchWidget.on("delete", app.handleSketchDelete);
            })
    },
    handleSketchCreate: function (created) {

        if (created.state == "complete") {
            var newGraphic = created.graphic;

            app.validateGraphics([newGraphic], function (graphics) {

            })
        }
    },
    handleSketchUpdate: function (updated) {

        if (updated.state == "start") {
            isUpdating = true;
            view.navigation.browserTouchPanEnabled = true;
        }

        if (updated.state == "complete") {
            isUpdating = false;
            view.navigation.browserTouchPanEnabled = false;

            var updatedGraphics = updated.graphics;
            app.validateGraphics(updatedGraphics, function (graphics) {

            })
        }
    },
    handleSketchDelete: function (deleted) {

        if (deleted.state == "complete") {
            var deletedGraphics = deleted.graphics;

            deletedGraphics.forEach(function (graphic) {
                ehmGraphicsLayer.remove(graphic)
            })
        }
    },
    validateGraphics: function (graphics, callback) {
        require(["esri/geometry/geometryEngine"],
            function (geometryEngine) {

                var isValidGraphics = true;
                graphics.forEach(function (graphic) {
                    var isWithin = geometryEngine.within(graphic.geometry, selectedProperty.geometry)

                    if (!isWithin) {
                        isValidGraphics = false;
                    }
                })

                if (!isValidGraphics) {
                    app.notifyUser.show("error", "One or more of the graphics created or updated does not fall within the boundaries of the highlighted property");

                    ehmGraphicsLayer.removeAll();
                    app.loadFeatures(view, app.handleLoadFeatures)
                    return
                }

                callback(graphics)
            })
    },
    setAerialLayer: function (view) {
        view.map.layers.items.forEach(function (item) {
            if (item.title) {
                if (item.title.toLowerCase().indexOf("aerial imagery") >= 0) {
                    aerialImageryLayer = item;
                }
            }
        })
    },
    loadGraphicsLayers: function (webmap, callback) {
        require(["esri/layers/GraphicsLayer"],
            function (GraphicsLayer) {

                propertyGraphicsLayer = new GraphicsLayer({
                    listMode: "hide"
                });

                ehmGraphicsLayer = new GraphicsLayer({
                    listMode: "hide"
                })

                webmap.addMany([propertyGraphicsLayer, ehmGraphicsLayer]);

                callback(view)
            })
    },
    handleGetProperty: function (features) {

        $lblPropertyResultsCount.text(features.length)

        if (features.length == 0) {
            app.notifyUser.show("warning", "We were unable to locate your property at this time.")
            return;
        }
        else if (features.length == 1) {
            selectedProperty = features[0]

            app.addFeatureToMap(selectedProperty)
            app.listFeatures([selectedProperty]);
        } else {
            app.listFeatures(features);
        }
    },
    listFeatures: function (features) {

        propertyFeatures = features
        $propertResultsDiv.slideDown();

        $selectAddress.empty()

        features.forEach(feature => {
            var attr = feature.attributes;

            var fullAddrNo = app.getFullAddressNo(feature)

            var label = app.titleCase(`${fullAddrNo || ""} ${attr["STR_NAME"] || ""} ${attr["LU_STR_NAME_TYPE"] || ""} ${attr["OFC_SBRB_NAME"] || ""}`)
            var value = attr["OBJECTID"]

            $("<calcite-option>", {
                value: value,
                text: label
            }).appendTo($selectAddress)
        });
    },
    handleAddressSelect: function (evt) {
        var objectid = evt.target.value;

        var features = propertyFeatures.filter(function (feature) {
            return feature.attributes["OBJECTID"] == objectid;
        });

        selectedProperty = features[0]

        app.addFeatureToMap(selectedProperty);
    },
    addFeatureToMap: function (feature) {
        require(["esri/Graphic"],
            function name(Graphic) {

                var gra = new Graphic({
                    geometry: feature.geometry,
                    attributes: feature.attributes,
                    symbol: symbolLineCyan
                })

                propertyGraphicsLayer.add(gra)

                view.goTo({
                    extent: feature.geometry.extent.expand(1.5)
                })

                app.toggleAerialImagery(true);
            })
    },
    getFullAddressNo: function (feature) {
        var fullAddrNo = feature.attributes["ADR_NO"];

        if (feature.attributes["ADR_NO_SFX"] && feature.attributes["ADR_NO_SFX"].trim().length > 0) {
            fullAddrNo += feature.attributes["ADR_NO_SFX"]
        }

        if (!fullAddrNo) {
            fullAddrNo = null
        } else {
            fullAddrNo = fullAddrNo.toString().toUpperCase();
        }

        return fullAddrNo
    },
    getStreetName: function (street, type) {

        if (!street && !type) {
            return null
        }

        if (type == "Null" || !type) {
            type = ""
        }

        var streetName = `${street} ${type}`

        if (!streetName) {
            streetName = ""
        } else {
            streetName = streetName.toString().toUpperCase()
        }

        return streetName
    },
    loadWidgets: function (view, callback) {
        require([
            "esri/widgets/Home",
            "esri/widgets/Track",
            "esri/widgets/LayerList",
            "esri/widgets/Expand"],
            function (
                Home,
                Track,
                LayerList,
                Expand) {

                $panelDiv.slideDown();

                var homeBtn = new Home({
                    view: view
                });

                view.ui.add(homeBtn, {
                    position: "top-left"
                });

                var track = new Track({
                    view: view,
                    goToLocationEnabled: true,
                    scale: 750
                });

                track.on("track", function (tracking) {
                    view.goTo({
                        center: [tracking.position.longitude, tracking.position.latitude],
                        scale: 750
                    })
                })

                view.ui.add(track, {
                    position: "top-left"
                });

                var layerList = new LayerList({
                    view: view,
                    listItemCreatedFunction: (event) => {
                        const item = event.item;
                        if (item.layer.type != "group") {
                            // don't show legend twice
                            item.panel = {
                                content: "legend",
                                open: false
                            };
                        }
                    }
                });

                layerList.when(function (layerlist) {
                    layerlist.visibleItems._items.forEach(function (item) {
                        item.title = item.title.replace(/%20/g, " ")
                    })
                })

                var layerListExpand = new Expand({
                    expandIconClass: "esri-icon-layer-list",
                    view: view,
                    mode: "floating",
                    content: layerList
                });
                view.ui.add(layerListExpand, "top-left");

                callback(view);
            })
    },
    titleCase: function (s) {
        return s.toLowerCase().split(/\s+/).map(function (word) {
            if (word[0])
                return word.replace(word[0], word[0].toUpperCase())
        }).join(' ')
    },
    resetToolButtons: function () {
        $btnConfirmAddressLocation.prop("disabled", true);
    },
    clearAddressOptions: function () {
        $propertResultsDiv.hide();
        $selectAddress.empty()
        propertyFeatures = [];
    },
    clearMap: function () {
        selectedProperty = null;
        app.clearAddressOptions();
        app.resetToolButtons();

        app.notifyUser.hide();
        message.reset();
    },
    loader: {
        show:
            function (message) {
                $loaderDiv.prop("text", message);
                $loaderDiv.prop("label", message);
                $loaderDiv.prop("scale", "m");
                $loaderDiv.show();
            },
        hide: function () {
            $loaderDiv.hide();
        }
    },
    notifyUser: {
        show: function (type, message) {
            switch (type) {
                case "error":
                    $noticeDiv.attr("kind", "danger")
                    break;
                case "warning":
                    $noticeDiv.attr("kind", "warning")
                    break;
                case "info":
                    $noticeDiv.attr("kind", "info")
                    break;
                case "success":
                    $noticeDiv.attr("kind", "success")
                    break;
            }

            $noticeDiv
                .prop("open", true)
                .prop("closable", true)
                .prop("width", "full")

            $noticeMessageDiv.text(message);
        },
        hide: function () {
            $noticeDiv.removeAttr("open")
        }
    }
}