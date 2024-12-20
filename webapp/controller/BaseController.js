/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	'sap/ui/model/SimpleType',
	'sap/ui/model/ValidateException',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/m/MessagePopover',
	'sap/m/MessagePopoverItem',
	'sap/m/library',
    'capetown/gov/za_ZPN_OPEN_BURNING/lib/html2canvas'
], function (Controller, History, SimpleType, ValidateException, Filter, FilterOperator,
		     MessagePopover, MessagePopoverItem,mobileLibrary,html2canvas) {
	"use strict";
	
	var URLHelper = mobileLibrary.URLHelper;
	//All is good
	return Controller.extend("capetown.gov.za_ZPN_OPEN_BURNING.controller.BaseController", {
		/**
		 * Convenience method for accessiisng the router in ev
		 * ery controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
				//GIS Polygon addon
				_savePolygonData: function(oUTILModel, oFeatures, sCaseID){
					let oSpatialReference = oFeatures.POLYGONS[0].geometry.spatialReference;
					let aRings = oFeatures.POLYGONS[0].geometry.rings[0];
					
					oUTILModel.setUseBatch(true);
					debugger;
		
				   
					for(let i in aRings){
						oUTILModel.createEntry("/GisGeometrySet", {
							properties: {
								X : aRings[i][0].toString(),
								Y : aRings[i][1].toString(),
								Spatialreference : {
									latestWkid: oSpatialReference.latestWkid.toString(),
									wkid: oSpatialReference.wkid.toString(),
									caseId: sCaseID
								}
							}
						});
						
					}
		
					oUTILModel.submitChanges();
				   
					//this.setBusy(true);
				},
		
		// //GIS Polygon addon
        // _savePolygonData: function(oUTILModel, oFeatures, sCaseID){
        //     let oSpatialReference = oFeatures.POLYGONS[0].geometry.spatialReference;
        //     let aRings = oFeatures.POLYGONS[0].geometry.rings[0];
            
        //     oUTILModel.setUseBatch(true);
        //     debugger;

           
        //     for(let i in aRings){
        //         oUTILModel.createEntry("/GisGeometrySet", {
        //             properties: {
        //                 X : aRings[i][0].toString(),
        //                 Y : aRings[i][1].toString(),
        //                 Spatialreference : {
        //                     latestWkid: oSpatialReference.latestWkid.toString(),
        //                     wkid: oSpatialReference.wkid.toString(),
        //                     caseId: sCaseID
        //                 }
        //             }
        //         });
                
        //     }

        //     oUTILModel.submitChanges();
           
        //     //this.setBusy(true);
        // },

        _getUTILModel : function(sAppId){
            return new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZCASE_UTIL_SRV/", {
				json: true,
				defaultOperationMode: "Server",
				refreshAfterChange: true,
				defaultUpdateMode: "GET",
				defaultCountMode: "None",
				useBatch: true,
				defaultBindingMode: sap.ui.model.BindingMode.OneWay
			});
        },

        _captureScreen: function(){
            //__xmlview1--app
              
            let oCanvas = html2canvas(document.querySelector("#__xmlview1--app")).then(canvas => {
                document.body.appendChild(canvas)
            });  
        },
		
		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		
		_getDistrictEmail: function(sDistrict){
			var sEmail ="";
			switch(sDistrict){
			case 'Blaauwberg':
				sEmail = "Blaauwberg.hub@capetown.gov.za";
				break;
			case 'Tygerberg':
				sEmail = "Tygerberg.Hub@capetown.gov.za";
				break;
			case 'Southern':
				sEmail = "Southern.hub@capetown.gov.za";
				break;
			case 'Capeflats':
				sEmail = "Capeflats.hub@capetown.gov.za";
				break;
			case 'Cape Flats':
				sEmail = "Capeflats.hub@capetown.gov.za";
				break;	
			case 'Helderberg':
				sEmail = "Helderberg.hub@capetown.gov.za";
				break;
			case 'Mitchells Plain/Khayelitsha':
				sEmail = "Khayemitch.hub@capetown.gov.za";
				break;
			case 'Northern':
				sEmail = "Northern.hub@capetown.gov.za";
				break;
			case 'Tablebay':
				sEmail = "Tablebay.hub@capetown.gov.za";
				break;
			case 'Table Bay':
				sEmail = "Tablebay.hub@capetown.gov.za";
				break;
			}
			return sEmail;
		},
		
		_getHelpURLS: function(){
			var oModel = sap.ui.getCore().getModel();
			oModel.callFunction("/getHelpUrl", {
				method: "GET",
				success: function(oData, oResponse){
						sap.ui.getCore().getModel("ConfigurationModel").setProperty("/HelpUrls",oData.results);
				}.bind(this)
			});
		},
		
		sendMail: function(sModelName, sPath){
			var sCaseID = this.getModel(sModelName).getProperty(sPath+"/EXT_KEY");
			var sCaseTitle = this.getModel(sModelName).getProperty(sPath+"/CASE_TITLE");
			var sDistrict = this.getModel(sModelName).getProperty(sPath+"/DISTOFF_NAME"); 
			var sSubject = sCaseID + ": " + sCaseTitle;
			URLHelper.triggerEmail(this._getDistrictEmail(sDistrict), sSubject , false, false, false, true);
		},
		
		handlePressHome:function(oEvent){
			//sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Launchpage", true);
		},
		
		goToApp: function(_app){
			var sUrl = window.location.ancestorOrigins[0];
			var appPath = "";
			switch(_app){
			case "1":
				sUrl = sUrl+"/irj/portal/fiori#EP--1325023360-Building_Development_Management";
				break;
			case "2":
				sUrl = sUrl+"/irj/portal/fiori#EP-1245617053-Land_Use_Management";
				break;
			case "3":
				sUrl = sUrl+"/irj/portal/fiori#EP-1066624724-Property_Information";
				
				break;
			case "4":
				sUrl = "https://www.capetown.gov.za/Work%20and%20business/Planning-portal/Tariffs-and-charges/Development-charges";
				break;
			case "5":
				sUrl = sUrl+"/irj/portal/fiori#EP--2038811430-Complaints";
				break;
			case "6":
				sUrl = "https://qaeservices.capetown.gov.za/irj/portal/fiori#EP--806849367-About_Us";
				break;
			}
			
			URLHelper.redirect(sUrl, true);
			
		},
		
		onItemPressed: function(oEvent){
			debugger;
			this.goToApp(oEvent.getParameter("item").getKey());
		},
		
	    isBusy: function(bBusy){
	    	this.getView().getModel("appView").setProperty("/busy", bBusy);
	    	this.getView().getModel("local").setProperty("/busy", bBusy);
	    },
		
		destroy : function(sId) {
			if(sap.ui.getCore().byId(sId)){
				sap.ui.getCore().byId(sId).destroy();
			}
			
			
		},
		
		onMessagesButtonPress: function (oEvent) {
			var oMessagesButton = oEvent.getSource();
			if (!this._messagePopover) {
				this._messagePopover = new sap.m.MessagePopover({
					items: {
						path: "message>/",
						template: new sap.m.MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});
				oMessagesButton.addDependent(this._messagePopover);
			}
			this._messagePopover.toggle(oMessagesButton);
		},
		
		addMessage: function (sText, sType) {
			var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			var oMessageManager = sap.ui.getCore().getMessageManager();
			oMessageManager.registerMessageProcessor(oMessageProcessor);

			//delete all messages before you add new
			oMessageManager.addMessages(
				new sap.ui.core.message.Message({
					message: sText,
					type: sType,
					processor: oMessageProcessor
				})
			);
		},
		
		_getValueList:function(sTableName, sKey, sValue1, sValue2, oFormModel,sField){
			var oModel = sap.ui.getCore().getModel();
			oModel.callFunction("/getNameValuePair", {
				method: "GET",
				urlParameters: {
					key_name: sKey,
					table_name: sTableName,
					value_1: sValue1,
					value_2: sValue2,
					value_3: ''
				},
				success: function(oData, oResponse){
					oFormModel.setProperty("/"+sField,oData.results);
				}.bind(this)
			});
		},
		_getValueListV2:function(sTableName, sKey, sValue1, sValue2,sValue3, oFormModel,sField){
			var oModel = sap.ui.getCore().getModel();
			oModel.callFunction("/getNameValuePair", {
				method: "GET",
				urlParameters: {
					key_name: sKey,
					table_name: sTableName,
					value_1: sValue1,
					value_2: sValue2,
					value_3: sValue3
				},
				success: function(oData, oResponse){
					oFormModel.setProperty("/"+sField,oData.results);
				}.bind(this)
			});
		},
		
		_getConfiguration: function(sItemCat, sItemType, sFormName){
			var that = this;
			var aFilter = [];
			aFilter.push(new Filter("ItemCategory", FilterOperator.EQ, sItemCat));
			aFilter.push(new Filter("ItemType", FilterOperator.EQ, sItemType ));
			var oModel = sap.ui.getCore().getModel();
			var oPromise = new Promise(
						function(resolve) {
							setTimeout(function() {
						        //resolve("result");
						        sap.ui.getCore().getModel().read("/Form_ConfigSet", {
									  filters: aFilter,
									  success: function(oData) {
									    resolve(oData);
									  },
				                      error: function(oResult) {
									    reject(oResult);
				                      }
					                });
						    }, 1000);
					        });
			return oPromise;
		},
		
		setLoadedData: function(sModel,oData){
			var iIndex = 20;
			for(var i = 1; i < iIndex; i++ ){
				var sProperty = "Field"+i;
				this.getModel(sModel).setProperty("/"+sProperty,oData[sProperty]);
			}
		},
		
		_getVal: function(evt) {
			return sap.ui.getCore().byId(evt.getParameter('id')).getValue();
		},
		
		onHandleHelpButton:function(oEvent){
			
		},
		
		isValid: function(sValue){
			if(sValue){
				return sValue;
			}else{
				return "";
			}
				
		},
	

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/** Returns an object with only the changed values**/
		getChangedObjects: function (oData) {
			var changedObject = {};
			Object.keys(oData).forEach(function (key, index) {
				if (oData[key] !== "") {
					changedObject[key] = oData[key];
				}
			});
			return changedObject;
		},

		fnGetModelIndex: function (aData, sProperty, sValue) {
			var iIndex = null;
			for (var i in aData) {
				var oObject = aData[i];
				Object.keys(oObject).forEach(function (key, index) {
					if (sProperty === key && oObject[key] === sValue) {
						iIndex = i;
					}
				});
				if (iIndex !== null) {
					return iIndex;
				}
			}
		},
		setMetaDataModel: function (oModel) {
			//var oModel = this.defaultODataModel();
			var oMetaData = new sap.ui.model.json.JSONModel(oModel.getServiceMetadata().dataServices.schema[0].entityType);
			this.getView().setModel(oMetaData, "oMetaData");
		},
		setEntityModels: function () {
			var oModelMeta = this.getView().getModel("oMetaData");
			for (var i in oModelMeta.oData) {
				var oNewModel = new sap.ui.model.json.JSONModel();
				var object = {};
				for (var j in oModelMeta.oData[i].property) {
					var key = oModelMeta.oData[i].property[j].name;
					object[key] = "";
				}
				oNewModel.setData(object);
				this.getOwnerComponent().setModel(oNewModel, oModelMeta.oData[i].name);
			}

		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			//sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Main", true);

//			if (sPreviousHash !== undefined) {
//				window.history.go(-1);
//			} else {
//				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//				oRouter.navTo("Main", true);
//			}
		},

		addFilter: function (oContext, sRole) {
			var aFilter = [];

			//aFilter.push(new Filter("MASTER_DATA_TEAM", FilterOperator.EQ, sRole));
			return new Filter("MASTER_DATA_TEAM", FilterOperator.EQ, sRole);
			//this._oList.getBinding("items").filter(aFilter);
		},
		
		_deleteDuplicates: function(a){
			 var seen = {};
			    var out = [];
			    var len = a.length;
			    var j = 0;
			    for(var i = 0; i < len; i++) {
			         var item = a[i];
			         if(seen[item] !== 1) {
			               seen[item] = 1;
			               out[j++] = item;
			         }
			    }
			    return out;
		},
		

		handleMastDataAuth: function (oContext, bHasPharmacy, bHasHealth, bHasFMCG, bHasBeauty, aFilter) {

			var oFilter = {};
			if (bHasPharmacy) {
				oFilter = oContext.addFilter(oContext, "PHARMACY");
				aFilter.push(oFilter);
			}
			if (bHasHealth) {
				oFilter = oContext.addFilter(oContext, "HEALTH");
				aFilter.push(oFilter);
			}
			if (bHasFMCG) {
				oFilter = oContext.addFilter(oContext, "FMCG");
				aFilter.push(oFilter);
			}
			if (bHasBeauty) {
				oFilter = oContext.addFilter(oContext, "BEAUTY");
				aFilter.push(oFilter);
			}
			return aFilter;
		},

		_isDebug: function () {
			var bIsDebug = false;
			return bIsDebug;
		},

		_isAutoSave: function () {
			var bIsAutoSave = false;
			return bIsAutoSave;
		},

		_getAppType: function () {
			//var bIsDebug = true;
			var sAppType;
			if (this._isDebug()) {
				sAppType = "MasterData";
			} else {
				var oParameters = this.getOwnerComponent().getComponentData().startupParameters;
				sAppType = oParameters.appType[0];
			}
			this.getOwnerComponent().getModel("BaseModel").setProperty("/AppType", sAppType);
			return sAppType;
		},
		
		onCallsAllowed: function(oEvent){
			if(oEvent.getParameter("selected")){
				var aSelectedKeys = oEvent.getSource().getProperty("selectedKeys");
				for(var i in aSelectedKeys){
					switch(aSelectedKeys[i]){
					case "International": 
						aSelectedKeys.push("National","Internal","Mobile","Local");
					 break;
					case "National":
						aSelectedKeys.push("Internal","Mobile","Local");
					 break;
					 case "Mobile":
						aSelectedKeys.push("Internal","Mobile","Local");
					 break;	
					 case "Local":
							aSelectedKeys.push("Internal");
				     break;
					
					}
				}
				sap.ui.getCore().byId(oEvent.getSource().getId()).setSelectedKeys(aSelectedKeys);
			}
			
			
		},

		_filterDataByAppType: function (sUserName) {
			var aFilter = [];
			var sAppType = this._getAppType();
			switch (sAppType) {
			case "MasterData":
				aFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "2"));
				aFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "20"));
				this.getModel("ViewModel").setProperty("/canCreate", false);
				if (this.getModel("BaseModel").getProperty("/hasDebugAccess")) {
					aFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "99"));
				}
				this.getModel("ViewModel").setProperty("/canApprove", false);
				this.getModel("ViewModel").setProperty("/canCreate", true);
				this.getModel("ViewModel").setProperty("/canReject", false);
				this.getModel("ViewModel").setProperty("/canDelete", true);

				break;
			case "Buyer":
				aFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "1"));
				aFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "11"));
				this.getModel("ViewModel").setProperty("/canCreate", false);
				if (sUserName) {
					aFilter.push(new Filter("BUYER_USERNAME", FilterOperator.EQ, sUserName));
				}
				this._oList.getBinding("items").filter(aFilter);
				//aFilter.push(new Filter("BUYER_USERNAME", FilterOperator.EQ, sUserUser));
				this.getModel("ViewModel").setProperty("/canApprove", true);
				this.getModel("ViewModel").setProperty("/canCreate", false);
				this.getModel("ViewModel").setProperty("/canReject", true);
				this.getModel("ViewModel").setProperty("/canDelete", false);
				break;
			case "Senior":
				aFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "3"));
				//	aFilter.push(new Filter("BUYER_USERNAME", FilterOperator.EQ, sUserUser2));
				//var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
				var sUserUser2 = this.getOwnerComponent().getModel("BaseModel").getProperty("/UserId");
				//this.getModel("detailView").getProperty("/user_id");
				this._oList.getBinding("items").filter(aFilter);
				this.getModel("ViewModel").setProperty("/canApprove", true);
				this.getModel("ViewModel").setProperty("/canCreate", false);
				this.getModel("ViewModel").setProperty("/canReject", true);
				this.getModel("ViewModel").setProperty("/canDelete", false);
				break;
			}
			this.getView().byId("list").getBinding("items").filter(aFilter);

			//Now update appTitle
			this.getOwnerComponent().getService("ShellUIService").then( // promise is returned
				function (oService) {
					oService.setTitle(this._getAppType()); // also could use .getTitle() first
				}.bind(this),
				function (oError) {
					jQuery.sap.log.error("Cannot get ShellUIService", oError, "my.app.Component");
				}
			);
		},

		handleBuyerAuth: function (oContext, bHasPharmacy, bHasHealth, bHasFMCG, bHasBeauty) {
			if (bHasPharmacy) {
				oContext.readAuthConfig(oContext, "Z_FIORI_PHARMACY");
			}
			if (bHasHealth) {
				oContext.readAuthConfig(oContext, "Z_FIORI_HEALTH");
			}
			if (bHasFMCG) {
				oContext.readAuthConfig(oContext, "Z_FIORI_FMCG");
			}
			if (bHasBeauty) {
				oContext.readAuthConfig(oContext, "Z_FIORI_BEAUTY");
			}
		},

		getBuyerReportingLines: function () {
			var oModel = this.getModel();
			var aFilter = [];
			var aFilterCurrentUser = [];
			aFilterCurrentUser.push(new Filter("SENIOR_BUYER", FilterOperator.EQ, this.getOwnerComponent().getModel("BaseModel").getProperty(
				"/UserId")));
			oModel.read("/Buyer_Reporting_lines", {
				filters: aFilterCurrentUser,
				success: function (oData, oResponse) {
					var isSeniorBuyer = false;
					for (var k in oData.results) {
						if (oData.results[k].SENIOR_BUYER === this.getOwnerComponent().getModel("BaseModel").getProperty("/UserId")) {
							isSeniorBuyer = true;
						}
					}
					if (isSeniorBuyer) {
						this.filterReportingLines(oData.results);
					} else {
						aFilter.push(new Filter("BUYER_ACTION_USERNAME", FilterOperator.EQ, ' '));
						this._oList.getBinding("items").filter(aFilter);
					}
				}.bind(this),
				error: function (oError) {}.bind(this)
			});
		},

		filterReportingLines: function (aBuyers) {
			var aFilter = [];
			for (var i in aBuyers) {
				aFilter.push(new Filter("BUYER_ACTION_USERNAME", FilterOperator.EQ, aBuyers[i].BUYER));
				aFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "3"));
			}
			this._oList.getBinding("items").filter(aFilter);
		},

		readAuthConfig: function (oContext, sRole) {
			var sPath = "/Team('" + sRole + "')";
			oContext.getModel().read(sPath, {
				success: function (oData, oResponse) {
					if (oData.CAN_CREATE === 'X1') {
						oContext.getModel("detailView").setProperty("/canCreate", true);
					} else {
						oContext.getModel("detailView").setProperty("/canCreate", false);
					}
				}.bind(oContext),
				error: function (oError) {}.bind(oContext)
			});
		},

		loadCurrentUser: function () {
			var isDebug = this._isDebug();
			var that = this;
			var bTemp = true;
			if (bTemp) {
				var oUserModel = this.getOwnerComponent().getModel("UserModel");

				var sUserName = "";
				if (this._isDebug()) {
					sUserName = "STSHABALALA";
					//sUserName = "104664";
				} else {
					sUserName = sap.ushell.Container.getService("UserInfo").getId();
				}

				this.getOwnerComponent().getModel("BaseModel").setProperty("/UserId", sUserName);

				var sPath2 = "/UserCollection('" + sUserName + "')/roles";
				oUserModel.setUseBatch(false);
				this._filterDataByAppType(sUserName);
				this.getModel("BaseModel").setProperty("/hasDebugAccess", false);
				this.getModel("BaseModel").setProperty("/hasChangeLogAccess", false);
				if (this._getAppType() === "MasterData" || this._getAppType() === "Buyer" || this._getAppType() === "Senior") {
					oUserModel.read(sPath2, {

						success: function (oData, oResponse) {
							//filter by user
							var aFilter = [];
							var bHasPharmacy = this.checkPharmacy(oData.results, "Z_FIORI_PHARMACY");

							this.getModel("ViewModel").setProperty("/bHasPharmacy", bHasPharmacy);
							var bHasHealth = this.checkHealth(oData.results, "Z_FIORI_HEALTH");
							this.getModel("ViewModel").setProperty("/bHasHealth", bHasHealth);
							var bHasFMCG = this.checkFMCG(oData.results, "Z_FIORI_FMCG");
							this.getModel("ViewModel").setProperty("/bHasFMCG", bHasFMCG);
							var bHasBeauty = this.checkBeauty(oData.results, "Z_FIORI_BEAUTY");
							this.getModel("ViewModel").setProperty("/bHasBeauty", bHasBeauty);
							var bHasSpringbok = this.checkBeauty(oData.results, "Z_FIORI_SPRINGBOK");
							this.getModel("ViewModel").setProperty("/bHasSpringbok", bHasSpringbok);
							if (bHasSpringbok) {
								this.getModel("ViewModel").setProperty("/isListingVisible", false);
							} else {
								this.getModel("ViewModel").setProperty("/isListingVisible", true);
							}
							var bHasDebugRole = this.checkBeauty(oData.results, "ZFIORI_VENDOR_PORTAL_DEBUG");
							this.getModel("BaseModel").setProperty("/hasDebugAccess", bHasDebugRole);
							var bhasChangeLogAccessRole = this.checkBeauty(oData.results, "ZFIORI_VENDOR_PORTAL_LOG");
							this.getModel("BaseModel").setProperty("/hasChangeLogAccess", bhasChangeLogAccessRole);
							if (this._getAppType() === "Senior") {
								this._filterDataByAppType();
								this.getBuyerReportingLines();
							}
							if (this._getAppType() === "MasterData") {
								var aMasterDataFilter = this.handleMastDataAuth(this, bHasPharmacy, bHasHealth, bHasFMCG, bHasBeauty, aFilter);
								aMasterDataFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "2"));
								aMasterDataFilter.push(new Filter("STATUS_ID", FilterOperator.EQ, "20"));
								this._oList.getBinding("items").filter(aMasterDataFilter);
							}
						}.bind(this),
						error: function (oError) {

						}.bind(this)
					});
				}
			} else {
				var sUrl = "/UserServices/sap/bc/ui2/start_up";

				$.get(sUrl)
					.done(function (results) {
						console.log("loadCurrentUser-results:" + results);
						console.log("loadCurrentUser-detailView:" + that.getModel("detailView"));
						//that.getModel("detailView").setProperty("/user_id", results.id);
						var oUserModel = that.getModel("UserModel");
						var sPath = "/UserCollection('" + results.id + "')/roles";
						that.getModel("ViewModel").setProperty("/UserId", results.id);
						oUserModel.setUseBatch(false);
						//that._filterDataByAppType();
						oUserModel.read(sPath, {
							success: function (oData, oResponse) {
								//filter by user
								
								var bHasPharmacy = that.checkPharmacy(oData.results, "Z_FIORI_PHARMACY");
								that.getModel("ViewModel").setProperty("/bHasPharmacy", bHasPharmacy);
								var bHasHealth = that.checkHealth(oData.results, "Z_FIORI_HEALTH");
								that.getModel("ViewModel").setProperty("/bHasHealth", bHasHealth);
								var bHasFMCG = that.checkFMCG(oData.results, "Z_FIORI_FMCG");
								that.getModel("ViewModel").setProperty("/bHasFMCG", bHasFMCG);
								var bHasBeauty = that.checkBeauty(oData.results, "Z_FIORI_BEAUTY");
								that.getModel("ViewModel").setProperty("/bHasBeauty", bHasBeauty);
								// if (that._getAppType() === "Buyer") {
								// 	that.handleBuyerAuth(that, bHasPharmacy, bHasHealth, bHasFMCG, bHasBeauty);
								// }
								// if (that._getAppType() === "MasterData") {
								// 	that.handleMastDataAuth(that, bHasPharmacy, bHasHealth, bHasFMCG, bHasBeauty);
								// }
								that._filterDataByAppType();

							}.bind(that),
							error: function (oError) {

							}.bind(that)
						});
					})
					.fail(function (err) {

					});
			}
		},

		checkPharmacy: function (aData, sRole) {
			var bHasPharmacy = false;
			for (var i in aData) {
				if (aData[i].agr_name === sRole) {
					bHasPharmacy = true;
				}
			}
			return bHasPharmacy;
		},

		checkHealth: function (aData, sRole) {
			var bHasHealth = false;
			for (var i in aData) {
				if (aData[i].agr_name === sRole) {
					bHasHealth = true;
				}
			}
			return bHasHealth;
		},

		checkFMCG: function (aData, sRole) {
			var bHasFMCG = false;
			for (var i in aData) {
				if (aData[i].agr_name === sRole) {
					bHasFMCG = true;
				}
			}
			return bHasFMCG;
		},

		checkBeauty: function (aData, sRole) {
			var bHasBeauty = false;
			for (var i in aData) {
				if (aData[i].agr_name === sRole) {
					bHasBeauty = true;
				}
			}
			return bHasBeauty;
		},

		fieldErrorUpdate: function (sState, sId, sText, sFormId, sIconColor) {
			sap.ui.getCore().byId(sId).setValueState(sState);
			sap.ui.getCore().byId(sId).setValueStateText(sText);
			this.getView().byId(sFormId).setIconColor(sIconColor);
		},

		stopAutoSave: function () {
			clearInterval(this._timer);
		},
		
		_dateFormatter: function(sValue){
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "c, MMM d, yyyy",
				style: "full"
			});
			return oDateFormat.format(new Date(sValue));
		},

		_save: function () {
			console.log("Autosave");

			this._globalThis.getModel("detailView").setProperty("/AutoSaveState", "Saving");
			if (this._globalThis.getModel().hasPendingChanges()) {
				this._globalThis.getModel().submitChanges({
					success: function (oData, oRepsonse) {
						this._globalThis.getModel().resetChanges();
						//this.getModel().resetChanges();
						this._globalThis.getModel("detailView").setProperty("/AutoSaveState", "Saved");
					}
				});
			}
		},

		splitString: function (string, size, multiline) {
			if (string) {
				var matchAllToken = (multiline === true) ? '[^]' : '.';
				var re = new RegExp(matchAllToken + '{1,' + size + '}', 'g');
				return string.match(re);
			}

		},

		checkChangeDocHeader: function (oModel) {
			var bHasChangeHeaderDoc = false;
			var sPath = this.getView().getBindingContext().getPath() + "/Header_To_ChangeDocHeader";
			if (oModel.getProperty(sPath).length > 0) {
				bHasChangeHeaderDoc = true;
			}
			return bHasChangeHeaderDoc;
		},

		createChangeLogs: function (oModel) {
			if (oModel.hasPendingChanges()) {
				// if (!this.checkChangeDocHeader(oModel)) {
				// 	this.buildChangeDocumnerHeader(oModel);
				// 	//Create Change DOC Header
				// }
				this.buildChangeDocumnerItem(oModel);

			}

			//Now create change doc line item
		},

		buildChangeDocumnerItem: function (oModel) {
			var oObject = {};
			var sPathMain = this.getView().getBindingContext().getPath();
			oObject.TRANSACTION_ID = oModel.getProperty(sPathMain + "/TRANSACTION_ID");
			oObject.USER = this.getOwnerComponent().getModel("BaseModel").getProperty("/UserId");

			var mapChangedProperties = oModel.getPendingChanges();
			var value;
			var oType = new sap.ui.model.odata.type.DateTime({
				pattern: "PThh'H'mm'M'ss'S'"
			});
			Object.keys(mapChangedProperties).forEach(function (key) {
				var sPath = "/" + key;
				//var sPath = "";
				value = mapChangedProperties[key];
				Object.keys(value).forEach(function (key2, index2) {
					if (key2 !== '__metadata') {
						//sPath = sPath + "/" + key2;
						var sPathPost = sPath + "/" + key2;
						//var sOriginal = oModel.getOriginalProperty(sPath);
						oObject.PROPERTY = key2;
						if (oModel.getOriginalProperty(sPathPost)) {
							oObject.OLD_VALUE = oModel.getOriginalProperty(sPathPost).toString();
						} else {
							oObject.OLD_VALUE = "";
						}
						oObject.NEW_VALUE = value[key2].toString();
						oObject.DOCUMENT_ID = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (Date.now()).toString();
						oObject.DATE = new Date();
						oObject.TIME = oType.formatValue(new Date(), 'string');
						oModel.createEntry("/ChangeDocItem", {
							properties: oObject
						});
					}
				});

			});
		},

		buildChangeDocumnerHeader: function (oModel) {
			var oObject = {};
			var sPath = this.getView().getBindingContext().getPath();
			oObject.TRANSACTION_ID = oModel.getProperty(sPath + "/TRANSACTION_ID");
			oObject.DATE_CREATED = new Date();
			oModel.createEntry("/ChangeDocHeader", {
				properties: oObject,
				sucess: function (oData, oRseponse) {
					this.getModel("detailView").setProperty("/");
				}.bind(this)
			});
		},
		handleLoadItems: function (oControlEvent) {
			oControlEvent.getSource().getBinding("items").resume();
		},
		onGenericLiveChangeSage: function (oEvent) {
			this._saveHANAChanages();
		},
		onGenericSelectedKey: function (oEvent) {
			this._saveHANAChanages();
		},
		_updateListingSites: function () {
			var sPathOnline = this.getView().byId("formListing").getBindingContext().getPath();
			if (this.getModel().getProperty(sPathOnline + "/SA_SITES") !== null) {
				if (this.getModel().getProperty(sPathOnline + "/SA_SITES").length > 0) {
					this.getModel().setProperty(sPathOnline + "/SA_SITES", this.getModel().getProperty(sPathOnline + "/SA_SITES").toString());
				} else {
					this.getModel().setProperty(sPathOnline + "/SA_SITES", "");
				}
			}

			//	DC Sites no no longer required : supplying site already caters for this
			if (this.getModel().getProperty(sPathOnline + "/DC_SITES") !== null) {
				if (this.getModel().getProperty(sPathOnline + "/DC_SITES").length > 0) {
					this.getModel().setProperty(sPathOnline + "/DC_SITES", this.getModel().getProperty(sPathOnline + "/DC_SITES").toString());
				} else {
					this.getModel().setProperty(sPathOnline + "/DC_SITES", "");
				}
			}

			if (this.getModel().getProperty(sPathOnline + "/NA_SITES") !== null) {
				if (this.getModel().getProperty(sPathOnline + "/NA_SITES").length > 0) {
					this.getModel().setProperty(sPathOnline + "/NA_SITES", this.getModel().getProperty(sPathOnline + "/NA_SITES").toString());
				} else {
					this.getModel().setProperty(sPathOnline + "/NA_SITES", "");
				}
			}

			if (this.getModel().getProperty(sPathOnline + "/BW_SITES") !== null) {
				if (this.getModel().getProperty(sPathOnline + "/BW_SITES").length > 0) {
					this.getModel().setProperty(sPathOnline + "/BW_SITES", this.getModel().getProperty(sPathOnline + "/BW_SITES").toString());
				} else {
					this.getModel().setProperty(sPathOnline + "/BW_SITES", "");
				}
			}

			if (this.getModel().getProperty(sPathOnline + "/SP_SITES") !== null) {
				if (this.getModel().getProperty(sPathOnline + "/SP_SITES").length > 0) {
					this.getModel().setProperty(sPathOnline + "/SP_SITES", this.getModel().getProperty(sPathOnline + "/SP_SITES").toString());
				} else {
					this.getModel().setProperty(sPathOnline + "/SP_SITES", "");
				}

			}
		},

		_setListingSelectedKeys: function () {
			var sPathOnline = this.getView().byId("formListing").getBindingContext().getPath();
			if (this.getModel().getProperty(sPathOnline + "/SA_SITES") !== null &&
				this.getModel().getProperty(sPathOnline + "/SA_SITES").toString().includes(",")) {
				var aSitesSA = this.getModel().getProperty(sPathOnline + "/SA_SITES").toString().split(",");
				this.getModel().setProperty(sPathOnline + "/SA_SITES", aSitesSA);
			}

			if (this.getModel().getProperty(sPathOnline + "/NA_SITES") !== null &&
				this.getModel().getProperty(sPathOnline + "/NA_SITES").toString().includes(",")) {
				var aSitesNA = this.getModel().getProperty(sPathOnline + "/NA_SITES").toString().split(",");
				this.getModel().setProperty(sPathOnline + "/NA_SITES", aSitesNA);
			}

			if (this.getModel().getProperty(sPathOnline + "/BW_SITES") !== null &&
				this.getModel().getProperty(sPathOnline + "/BW_SITES").toString().includes(",")) {
				var aSitesBW = this.getModel().getProperty(sPathOnline + "/BW_SITES").toString().split(",");
				this.getModel().setProperty(sPathOnline + "/BW_SITES", aSitesBW);
			}

			if (this.getModel().getProperty(sPathOnline + "/DC_SITES") !== null &&
				this.getModel().getProperty(sPathOnline + "/DC_SITES").toString().includes(",")) {
				var aSitesDC = this.getModel().getProperty(sPathOnline + "/DC_SITES").toString().split(",");
				this.getModel().setProperty(sPathOnline + "/DC_SITES", aSitesDC);
			}
		},
		
		clearMessages: function () {
			var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			var oMessageManager = sap.ui.getCore().getMessageManager();
			oMessageManager.registerMessageProcessor(oMessageProcessor);
			//oMessageManager.removeMessages();
			oMessageManager.removeAllMessages();
		},

		_saveHANAChanages: function (sNav, oEvent) {
			if (this._isAutoSave()) {
				var oModel = this.getView().getModel();
				this._updateListingSites();
				this.getModel("detailView").setProperty("/AutoSaveState", "Saving");
				if (oModel.hasPendingChanges()) {
					oModel.submitChanges({
						success: function (oData, oRepsonse) {
							oModel.resetChanges();
							this._setListingSelectedKeys();
							this.getModel("detailView").setProperty("/AutoSaveState", "Clear");
							if (sNav) {
								var sObjectId = this.getModel().getProperty(oEvent.getSource().getBindingContext().getPath() + "/TRANSACTION_ID");
								var sArticleCodes = this.getModel().getProperty(oEvent.getSource().getBindingContext().getPath() + "/ARTICLE_CODE");
								var sItemID = this.getModel().getProperty(oEvent.getSource().getBindingContext().getPath() + "/ITEM_ID");

								this.getRouter().navTo("variantDetail", {
									objectId: sObjectId,
									articleCode: sArticleCodes,
									itemId: sItemID
								}, true);
							}
						}.bind(this)
					});
				} else {
					this._setListingSelectedKeys();
				}
			}

		},
		
		_handleLock: function(){
			debugger;
			//handle based on lock
			if(this.getModel("PersonModel").getProperty("/HasLock") === "X" || this.getModel("PersonModel").getProperty("/HasLock") === undefined ){
				this.getModel("HeaderModel").setProperty("/canApprove",false);
				this.getModel("HeaderModel").setProperty("/canSubmit",false);
				this.getModel("HeaderModel").setProperty("/isProvTeam",false);
				this.getModel("HeaderModel").setProperty("/IsCostCenter",false);
				this.getModel("HeaderModel").setProperty("/approvalData",false);
			}
		},

		formMandotoryCheck: function (sFormId, sTabId) {
			var valid = false;
			var oForm = this.getView().byId(sFormId);
			var aValidity = [];
			if (oForm._aElements) {
				for (var i in oForm._aElements) {
					var index = parseInt(i);
					if (oForm._aElements[index].sParentAggregationName === "label" && oForm._aElements[index].getProperty("required")) {
						if (oForm._aElements[index + 1].getValue() === "") {
							//valid = false;
							aValidity.push(false);
							oForm._aElements[index + 1].setValueState("Error");
							if (!oForm._aElements[index + 1].sParentAggregationName === "fields") {
								oForm._aElements[index + 1].setValueStateText(oForm._aElements[index].getProperty("text") + "is Mandotory");
							}
						} else {
							//valid = true;
							aValidity.push(true);
							oForm._aElements[index + 1].setValueState("None");
						}
					}
				}
			}

			var bFoundFalse = false;
			for (var x in aValidity) {
				if (aValidity[x] == false) {
					bFoundFalse = true;
				}
			}
			if (bFoundFalse) {
				valid = false;
			} else {
				valid = true;
			}

			if (valid) {
				this.getView().byId(sTabId).setIconColor(sap.ui.core.IconColor.Neutral);
			} else {
				this.getView().byId(sTabId).setIconColor(sap.ui.core.IconColor.Negative);
			}

			return valid;
		},

		getGuid: function () {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (Date.now()).toString();
		},

		validationIput: function (sFormName, sId, sValue) {
			var aFormValidation = this.getView().getModel(sFormName).getData();
			for (var i in aFormValidation) {
				if (aFormValidation[i].getId().split("--")[1] === sId && aFormValidation[i].getProperty("required")) {
					if (sValue === "") {
						aFormValidation[i].setValueState("Error");
					} else {
						aFormValidation[i].setValueState("None");
					}
				}
			}
		},

		readDB2: function (oDataModel, query) {
			oDataModel.read(query, {
				method: "GET",
				success: function (data) {
					//
					
				},
				error: function (results) {
					var err = JSON.parse(results.response.body);
					//reject(err);
				}
			});
		},

		getRejectionStatus: function () {
			var sStatus_ID = "";
			switch (this._getAppType()) {
			case "Buyer":
				sStatus_ID = "10";
				break;
			case "Senior":
				sStatus_ID = "11";
				break;
			}
			return sStatus_ID;
		},

		readDB: function (oDataModel, query) {
			return new Promise(function (resolve, reject) {
				oDataModel.read(query, {
					method: "GET",
					success: function (data) {
						resolve(data);
					},
					error: function (results) {
						var err = JSON.parse(results.response.body);
						reject(err);
					}
				});
			});
		}

	});

});