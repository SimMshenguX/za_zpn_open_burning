sap.ui.define([
	"capetown/gov/za_ZPN_OPEN_BURNING/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/export/Spreadsheet",
	'sap/m/UploadCollectionParameter',
	"capetown/gov/za_ZPN_OPEN_BURNING/model/oDataHelper",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass"
], function(BaseController, MessageBox, JSONModel, MessageToast, Spreadsheet, UploadCollectionParameter, oDataHelper, Fragment,
	syncStyleClass) {
	"use strict";

	return BaseController.extend("capetown.gov.za_ZPN_OPEN_BURNING.controller.wizard", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.wizard
		 */
		onInit: function() {

			this.oWizard = this.getView().byId("wizMain");
			this.CurrentSep = "";
			this.oUTILModel = this._getUTILModel("NONE");
			this.CaseId = "";
			this.CaseType = "";
			this.oNameInput = this.getView().byId("inName");
			this.oCellInput = this.getView().byId("inCell");
			this.oEmailInput = this.getView().byId("inEmail");
			this.oAddressInput = this.getView().byId("inAddress");
			this.oTelInput = this.getView().byId("inTel");
			this.oOwnerInput = this.getView().byId("inOwner");
			this.oAltCellInput = this.getView().byId("inAltCell");
			this.oAltEmailInput = this.getView().byId("inAltEmail");
			this.oErfInput = this.getView().byId("inErf");

			this.oSuburbInput = this.getView().byId("inSuburb");
			this.oStrAddrInput = this.getView().byId("inStrAddr");
			this.oRateInput = this.getView().byId("inRate");

			this._wizard = this.getView().byId("wizMain");

			this.oFileUploader = this.byId("fuManagementPlan");
			this.oFSite = this.byId("fuSite");

			this.oTextAreaFDescrip = this.getView().byId("TextAreaFDescrip");
			this.oTextAreaMaterialOrig = this.getView().byId("TextAreaMaterialOrig");
			this.oTextAreaAltInvest = this.getView().byId("TextAreaAltInvest");
			this.oTextAreaALTIncl = this.getView().byId("TextAreaALTIncl");
			this.oTextAreaProposedSite = this.getView().byId("TextAreaProposedSite");
			this.oTextAreaBurningPose = this.getView().byId("TextAreaBurningPose");
			this.oTextAreaOwnerOccupiers = this.getView().byId("TextAreaOwnerOccupiers");
			this.oTextAreaOwnerOccupiers = this.getView().byId("TextAreaOwnerOccupiers");
			this.proofDelivery = this.byId("proofDelivery");
			this.inFndAddress = this.getView().byId("inFndAddress");

			this.oTextAreaFireFighting = this.getView().byId("TextAreaFireFighting");
			this.oTextAreaSpecifyWater = this.getView().byId("TextAreaSpecifyWater");
			this.BurnType = "";
			var oPdfModel = new JSONModel();
			this.getView().setModel(oPdfModel, "pdfModel");

			var that = this;

			var sampleModel = new sap.ui.model.json.JSONModel();
			that.getView().setModel(sampleModel, "sampleModel");

			var columnModel = new JSONModel();
			that.getView().setModel(columnModel, "columnModel");

			var oGroupProp = this.getView().byId("GroupProp");
			oGroupProp.setSelectedIndex(-1);

			var oGroupProposed = this.getView().byId("GroupProposed");
			oGroupProposed.setSelectedIndex(-1);

			var rdoWaterSourceGroup = this.getView().byId("rdoWaterSourceGroup");
			rdoWaterSourceGroup.setSelectedIndex(-1);

			var GroupAdjacentProposed = this.getView().byId("GroupAdjacentProposed");
			GroupAdjacentProposed.setSelectedIndex(-1);

			var GroupStack = this.getView().byId("GroupStack");
			GroupStack.setSelectedIndex(-1);

			var GroupPNotified = this.getView().byId("GroupPNotified");
			GroupPNotified.setSelectedIndex(-1);

			this.CaseGuid = "";

		},

		_Checklist: function() {

			var sapPath = "/ChecklistSet";

			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("CaseGuid", sap.ui.model.FilterOperator.EQ, this.CaseGuid));
			var that = this;
			var oModel = this.getView().getModel();
			oDataHelper.callGETOData(oModel, sapPath, aFilters)
				.then(function(data, oResponse) {

					var aFilteredResults = data.results.filter(function(item) {
						return item.Description !== "";
					});
					data.results = aFilteredResults;

					var oJSONModel = new sap.ui.model.json.JSONModel(data);
					that.getView().setModel(oJSONModel, "checklist");
				}.bind(this))
				.catch(function(oError, oResponse) {
					sap.ui.core.BusyIndicator.hide();

					MessageBox.error(JSON.parse(oError.response.body).error.message.value);
					// oTable.setVisible(false);
				});

		},
		onSelectedCheckList: function(oEvent) {
			var selectedItem = oEvent.getSource().getSelectedItem();
			this._selectedAnchorKey = selectedItem.getKey();

			// Get the text of the selected item
			this._selectedCheckText = selectedItem.getText();

		},

		onRadioButtonSelect: function(oEvent) {
			var oRadioButton = oEvent.getSource();
			var oBindingContext = oRadioButton.getBindingContext("erfModel");
			var oSelectedRecord = oBindingContext.getObject();
			this._selectedAddress = oSelectedRecord;
			this.onOwnerList(this._selectedAddress.PLNO);
			var sPlno = JSON.stringify(this._selectedAddress.PLNO);
			sessionStorage.setItem("plno",sPlno);
			// console.log("Selected Record:", oSelectedRecord);
		},

		onUploadHandle: function(oEvent) {

			var oContext = oEvent.getSource().getBindingContext("pdfModel");
			var oModelDoc = oContext.getModel();
			var oData = oModelDoc.getProperty(oContext.getPath());
			var oButton = oEvent.getSource();

			var oFormData = new FormData();
			oFormData.append("file", this.file, this.fileName);

			var oModel = this.getView().getModel();
			var url = oModel.sServiceUrl;
			var sUploadUrl = url + "/ContentSet";

			var sToken = this.getCSRFToken();
			var caseGuid = this.CaseGuid;
			// Perform AJAX request to upload the file
			var that = this;
			var anchor = this._selectedAnchorKey;
			$.ajax({
				url: sUploadUrl,
				type: "POST",
				data: oFormData,
				processData: false,
				contentType: false,
				headers: {
					"SLUG": caseGuid + "/" + this.fileName + "/" + anchor,
					"X-CSRF-Token": sToken
				},
				success: function(data) {
					// Handle success response
					sap.m.MessageToast.show("Successfully uploaded :" + that._selectedCheckText);
					oData.isUploaded = true;
					oData.docName = that._selectedCheckText;
					var oRow = oButton.getParent();

					var aButtons = oRow.$().find("button");
					aButtons.each(function(index, button) {
						button.disabled = true;
					});
					// oButton.getModel("pdfModel").refresh();
					oModelDoc.refresh();

				},
				error: function(err) {
					// Handle error response
					sap.m.MessageToast.show("PDF upload failed:" + err);

				}
			});
		},

		getCSRFToken: function() {
			// Fetch CSRF token from backend
			var oModel = this.getView().getModel();
			var url = oModel.sServiceUrl;
			var sToken;
			$.ajax({
				url: url,
				type: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function(data, textStatus, request) {
					sToken = request.getResponseHeader("X-CSRF-Token");
				}
			});
			return sToken;
		},

		onProperty: function() {
			sap.ui.core.BusyIndicator.show();

			this.getView().byId("zoneidErfTable").setVisible(true);

			this.ozoneDataHelper = this.getView().getModel("COAModel");
			// new sap.ui.model.odata.ODataModel(url, true);
			var sapPath = "/PropertySearchSet";
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("MY_PROPERTIES", sap.ui.model.FilterOperator.EQ, "X"));
			var oTable = this.getView().byId("zoneidErfTable");
			//---> using promise technique to avoid callback 
			oDataHelper.callGETOData(this.ozoneDataHelper, sapPath, aFilters)
				.then(function(data, oResponse) {
					var oModel = new sap.ui.model.json.JSONModel(data);
					oTable.setModel(oModel, "erfModel");
					sap.ui.core.BusyIndicator.hide();
					// that.erfSimulateServerRequest();
				}.bind(this))
				.catch(function(oError, oResponse) {
					sap.ui.core.BusyIndicator.hide();

					MessageBox.error(JSON.parse(oError.response.body).error.message.value);
					oTable.setVisible(false);
				});
		},

		onFavourate: function() {
			sap.ui.core.BusyIndicator.show();

			this.getView().byId("zoneidErfTable").setVisible(true);

			this.ozoneDataHelper = this.getView().getModel("COAModel");
			// new sap.ui.model.odata.ODataModel(url, true);
			var sapPath = "/PropertySearchSet";
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("MY_FAVOURITES", sap.ui.model.FilterOperator.EQ, "X"));
			var oTable = this.getView().byId("zoneidErfTable");
			//---> using promise technique to avoid callback 
			oDataHelper.callGETOData(this.ozoneDataHelper, sapPath, aFilters)
				.then(function(data, oResponse) {
					var oModel = new sap.ui.model.json.JSONModel(data);
					oTable.setModel(oModel, "erfModel");
					sap.ui.core.BusyIndicator.hide();
					// that.erfSimulateServerRequest();
				}.bind(this))
				.catch(function(oError, oResponse) {
					sap.ui.core.BusyIndicator.hide();

					MessageBox.error(JSON.parse(oError.response.body).error.message.value);
					oTable.setVisible(false);
				});

		},

		onSearch: function() {
			var oPropertyComboBox = this.getView().byId("propertyComboBox");

			this.sValue = oPropertyComboBox.getSelectedItem().getText();
			if (this.sValue === "ERF Number") {
				this.onSearchErf();
			} else if (this.sValue === "Parcel Number") {
				this.onSearchParcel();
			} else if (this.sValue === "Private Address") {
				this.onPrivateAddress();
			} else if (this.sValue === "Street Address") {
				this.onStreetAddress();
			} else if (this.sValue === "GIS Map") {
				this.onGISMap();
			}

		},

		onGISMap: function() {

			var esriAddress = sessionStorage.getItem("addressToPass");
			var esriDataAddr = JSON.parse(esriAddress);

			if (esriDataAddr === null) {
				this.getView().byId("zoneidErfTable").setVisible(false);
				MessageBox.error("Please select a Property on Map and Click view");
			}

			var esriStreetNo = "";
			var esriStreetName = "";
			var esriSuburb = "";
			if (esriDataAddr !== undefined) {
				esriStreetNo = esriDataAddr[0].streetNo;
				esriStreetName = esriDataAddr[0].streetName;
				esriSuburb = esriDataAddr[0].suburb;
			}

			if (esriStreetNo === "" & esriStreetName === "" & esriSuburb === "") {
				this.getView().byId("zoneidErfTable").setVisible(false);
				MessageBox.error("Please select a Property on Map and Click view");
			} else {

				// this.getView().byId("zoneidErfTable").getColumns()[0].setVisible(true);
				this.getView().byId("zoneidErfTable").setVisible(true);
				if (!this._oBusyDialog) {
					Fragment.load({
						name: "capetown.gov.za_ZPN_OPEN_BURNING.view.BusyDialog",
						controller: this
					}).then(function(oFragment) {
						this._oBusyDialog = oFragment;
						this.getView().addDependent(this._oBusyDialog);
						syncStyleClass("sapUiSizeCompact", this.getView(), this._oBusyDialog);

						this._oBusyDialog.setTitle("Property data");

						this._oBusyDialog.setText("Please wait... loading Properties ");

						this._oBusyDialog.open();

					}.bind(this));
				} else {
					this._oBusyDialog.open();
					// this.simulateServerRequest();
				}

				this.ozoneDataHelper = this.getView().getModel("COAModel");

				var sapPath = "/PropertySearchSet";
				var aFilters = [];
				if (esriStreetName) {
					aFilters.push(new sap.ui.model.Filter("STREET", sap.ui.model.FilterOperator.EQ, esriStreetName));
				}
				if (esriStreetNo) {
					aFilters.push(new sap.ui.model.Filter("HOUSE_NO", sap.ui.model.FilterOperator.EQ, esriStreetNo));
				}
				if (esriSuburb) {
					aFilters.push(new sap.ui.model.Filter("CITY", sap.ui.model.FilterOperator.EQ, esriSuburb));
				}
				//---> using promise technique to avoid callback 
				var that = this;
				oDataHelper.callGETOData(this.ozoneDataHelper, sapPath, aFilters)
					.then(function(data, oResponse) {
						var oModel = new sap.ui.model.json.JSONModel(data);
						that.getView().byId("zoneidErfTable").setModel(oModel, "erfModel");
						if (that._oBusyDialog) {
							that._oBusyDialog.destroy(true);
						}
						that._oBusyDialog.close();

					})
					.catch(function(oError, oResponse) {
						that._oBusyDialog.close();
						// this is to display the error message to user
						MessageBox.error(JSON.parse(oError.responseText).error.message.value);
						// MessageBox.error(JSON.parse(oError.response.body).error.message.value);
						sap.ui.getCore().byId("zoneidErfTable").setVisible(false);
					});
			}

		},

		onStreetAddress: function() {

			var lvStreetNo = this.getView().byId("zonestreetval").getValue();
			var lvStreetName = this.getView().byId("zoneStreetNamVal").getValue();
			if (lvStreetNo === "" & lvStreetName === "") {
				this.getView().byId("zoneidErfTable").setVisible(false);
				MessageBox.error("Please enter the Street Number or Street Name");
			} else {
				this.getView().byId("zoneidErfTable").setVisible(true);

				// load BusyDialog fragment asynchronously
				if (!this._oStreetBusyDialog) {
					Fragment.load({
						name: "capetown.gov.za_ZPN_OPEN_BURNING.view.BusyDialog",
						controller: this
					}).then(function(oFragment) {
						this._oStreetBusyDialog = oFragment;
						this.getView().addDependent(this._oStreetBusyDialog);
						syncStyleClass("sapUiSizeCompact", this.getView(), this._oStreetBusyDialog);
						this._oStreetBusyDialog.setTitle("Street address");
						this._oStreetBusyDialog.setText("Please wait... loading Street Data from server! ");
						this._oStreetBusyDialog.open();

					}.bind(this));
				} else {
					this._oStreetBusyDialog.open();
					this.streetSimulateServerRequest();
				}

				this.ozoneDataHelper = this.getView().getModel("COAModel");

				var sapPath = "/PropertySearchSet";
				var aFilters = [];
				if (lvStreetNo) {
					aFilters.push(new sap.ui.model.Filter("HOUSE_NO", sap.ui.model.FilterOperator.EQ, lvStreetNo));
				}
				if (lvStreetName) {
					aFilters.push(new sap.ui.model.Filter("STREET", sap.ui.model.FilterOperator.EQ, lvStreetName));
				}

				var oTableStreet = this.getView().byId("zoneidErfTable");
				//---> using promise technique to avoid callback 
				var that = this;
				oDataHelper.callGETOData(this.ozoneDataHelper, sapPath, aFilters)
					.then(function(data, oResponse) {
						var oModel = new sap.ui.model.json.JSONModel(data);
						oTableStreet.setModel(oModel, "erfModel");
						that.streetSimulateServerRequest();
					}.bind(this))
					.catch(function(oError, oResponse) {
						that.streetSimulateServerRequest();
						// this is to display the error message to user
						MessageBox.error(JSON.parse(oError.response.body).error.message.value);
						oTableStreet.setVisible(false);
					});

			}
		},

		onSearchParcel: function() {

			var lvParcelNo = this.getView().byId("zoneparcelval").getValue();
			this.PLNO = lvParcelNo;
			if (lvParcelNo === "") {
				this.getView().byId("zoneidErfTable").setVisible(false);
				MessageBox.error("Please enter the Parcel Number");
			} else {
				this.getView().byId("zoneidErfTable").setVisible(true);

				// load BusyDialog fragment asynchronously
				if (!this._oParcelBusyDialog) {
					Fragment.load({
						name: "capetown.gov.za_ZPN_OPEN_BURNING.view.BusyDialog",
						controller: this
					}).then(function(oFragment) {
						this._oParcelBusyDialog = oFragment;
						this.getView().addDependent(this._oParcelBusyDialog);
						syncStyleClass("sapUiSizeCompact", this.getView(), this._oParcelBusyDialog);

						this._oParcelBusyDialog.setTitle("Parcel Search Loading Data");

						this._oParcelBusyDialog.setText("Please wait loading Parcel Data from server! ");

						this._oParcelBusyDialog.open();

					}.bind(this));
				} else {
					this._oParcelBusyDialog.open();
					this.parcelSimulateServerRequest();
				}

				this.ozoneDataHelper = this.getView().getModel();
				var sapPath = "/PropertySearchSet";
				var aFilters = [];
				if (lvParcelNo) {
					aFilters.push(new sap.ui.model.Filter("PLNO", sap.ui.model.FilterOperator.EQ, lvParcelNo));
				}
				//---> using promise technique to avoid callback 
				var oTableParcel = this.getView().byId("zoneidErfTable");
				var that = this;
				oDataHelper.callGETOData(this.ozoneDataHelper, sapPath, aFilters)
					.then(function(data, oResponse) {
						var oModel = new sap.ui.model.json.JSONModel(data);
						oTableParcel.setModel(oModel, "erfModel");
						that.parcelSimulateServerRequest();
					})
					.catch(function(oError, oResponse) {
						that.parcelSimulateServerRequest();
						// this is to display the error message to user
						MessageBox.error(JSON.parse(oError.response.body).error.message.value);
						oTableParcel.setVisible(false);
					});

			}

		},

		onSearchErf: function() {

			var allotmentCB = this.getView().byId("idbdmAllotmentCombo");
			this.allotment = allotmentCB.getSelectedKey();
			// var url = "/sap/opu/odata/sap/ZEHM_COA_SRV";
			var lvErfNuber = this.getView().byId("inpuERFNumber").getValue();
			if (lvErfNuber === "") {
				this.getView().byId("zoneidErfTable").setVisible(false);
				MessageBox.error("Please enter the Erf Number");
			} else {
				this.getView().byId("zoneidErfTable").setVisible(true);

				// load BusyDialog fragment asynchronously
				if (!this._oBusyDialog) {
					Fragment.load({
						name: "capetown.gov.za_ZPN_OPEN_BURNING.view.BusyDialog",
						controller: this
					}).then(function(oFragment) {
						this._oBusyDialog = oFragment;
						this.getView().addDependent(this._oBusyDialog);
						syncStyleClass("sapUiSizeCompact", this.getView(), this._oBusyDialog);

						this._oBusyDialog.setTitle("Erf Search Loading Data");

						this._oBusyDialog.setText("Please wait loading Erf Data from server! ");

						this._oBusyDialog.open();

					}.bind(this));
				} else {
					this._oBusyDialog.open();
					this.erfSimulateServerRequest();
				}

				this.ozoneDataHelper = this.getView().getModel("COAModel");
				// new sap.ui.model.odata.ODataModel(url, true);
				var sapPath = "/PropertySearchSet";
				var aFilters = [];
				if (lvErfNuber) {
					aFilters.push(new sap.ui.model.Filter("ERFNO", sap.ui.model.FilterOperator.EQ, lvErfNuber));

					if (this.allotment !== undefined && this.allotment !== null && this.allotment !== "") {
						aFilters.push(new sap.ui.model.Filter("ALLOTMENT", sap.ui.model.FilterOperator.EQ, this.allotment));
					}
				}

				var oTable = this.getView().byId("zoneidErfTable");
				//---> using promise technique to avoid callback 
				var that = this;
				oDataHelper.callGETOData(this.ozoneDataHelper, sapPath, aFilters)
					.then(function(data, oResponse) {
						var oModel = new sap.ui.model.json.JSONModel(data);
						oTable.setModel(oModel, "erfModel");
						that.erfSimulateServerRequest();
					}.bind(this))
					.catch(function(oError, oResponse) {
						that.erfSimulateServerRequest();
						// oGlobalBusyDialog.close();
						// this is to display the error message to user
						MessageBox.error(JSON.parse(oError.response.body).error.message.value);
						oTable.setVisible(false);
					});

			}

		},

		onPrivateAddress: function() {
			// var url = "/sap/opu/odata/sap/ZEHM_COA_SRV";
			var oInputPrivateSuburb = this.getView().byId("inputPrivateSuburb").getValue();
			var deptpvtStreetval = this.getView().byId("deptpvtStreetval").getValue();
			if (oInputPrivateSuburb === "") {
				this.getView().byId("zoneidErfTable").setVisible(false);
				MessageBox.error("Please enter Suburb");
			} else {

				if (!this._oBusyDialog) {
					Fragment.load({
						name: "capetown.gov.za_ZPN_OPEN_BURNING.view.BusyDialog",
						controller: this
					}).then(function(oFragment) {
						this._oBusyDialog = oFragment;
						this.getView().addDependent(this._oBusyDialog);
						syncStyleClass("sapUiSizeCompact", this.getView(), this._oBusyDialog);
						this._oBusyDialog.setTitle("Property data");
						this._oBusyDialog.setText("Please wait... loading Private Address");
						this._oBusyDialog.open();

					}.bind(this));
				} else {
					this._oBusyDialog.open();
					this.erfSimulateServerRequest();
				}

				this.ozoneDataHelper = this.getView().getModel("COAModel");

				var sapPath = "/PropertySearchSet";

				var aFilters = [];
				if (oInputPrivateSuburb) {
					aFilters.push(new sap.ui.model.Filter("CITY", sap.ui.model.FilterOperator.EQ, oInputPrivateSuburb));
				}
				if (deptpvtStreetval) {
					aFilters.push(new sap.ui.model.Filter("HOUSE_NUM2", sap.ui.model.FilterOperator.EQ, deptpvtStreetval));
				}

				var deptpvtPostval = this.getView().byId("inputHouseNo").getValue();
				if (deptpvtPostval) {
					aFilters.push(new sap.ui.model.Filter("STR_SUPPL3", sap.ui.model.FilterOperator.EQ, deptpvtPostval));
				}

				var deptpvtComplexval = this.getView().byId("deptpvtComplexval").getValue();
				if (deptpvtComplexval) {
					aFilters.push(new sap.ui.model.Filter("LOCATION", sap.ui.model.FilterOperator.EQ, deptpvtComplexval));
				}

				//---> using promise technique to avoid callback 
				var oTablePrivate = this.getView().byId("zoneidErfTable");
				oDataHelper.callGETOData(this.ozoneDataHelper, sapPath, aFilters)
					.then(function(data, oResponse) {
						var oModel = new sap.ui.model.json.JSONModel(data);
						oTablePrivate.setModel(oModel, "erfModel");
						oTablePrivate.setVisible(true);
						this.erfSimulateServerRequest();
					}.bind(this))
					.catch(function(oError, oResponse) {
						this.erfSimulateServerRequest();
						// this is to display the error message to user
						MessageBox.error(JSON.parse(oError.responseText).error.message.value);
						sap.ui.getCore().byId("zoneidErfTable").setVisible(false);
						oTablePrivate.setVisible(false);
					});

			}
		},

		onPartySearch: function(oEvent) {

			var oComboBox = oEvent.getSource();

			// Get the selected item from the ComboBox
			var oSelectedItem = oComboBox.getSelectedItem();
			var sSelectedKey = "";
			// Check if an item is selected
			if (oSelectedItem) {
				sSelectedKey = oSelectedItem.getKey();
			}

			var oModel = this.getView().getModel();
			this._ownerBP = sSelectedKey;
			var bpNumber = sSelectedKey;
			var sUrl = "/PartySet('" + bpNumber + "')";
			var that = this;
			oModel.read(sUrl, {
				success: function(oData, oResponse) {
					that.getView().byId("inName").setValue(oData.NAME);
					that.getView().byId("inAddress").setValue(oData.ADDRESS);
					that.getView().byId("inTel").setValue(oData.WORKPHONENO);
					that.getView().byId("inEmail").setValue(oData.EMAILADDRESS);
					that.getView().byId("inCell").setValue(oData.CELLPHONENO);
					that._owner = true;

				},
				error: function(oError) {
					// Handle the error response
					MessageBox.error("GET Request Failed:", oError);
				}
			});

		},
		onShowSearch: function() {

			var oModel = this.getView().getModel("COAModel");

			var sUrl = "/LoginPartySet";
			var that = this;
			oModel.read(sUrl, {
				success: function(oData, oResponse) {

					if (that._applicantBP === undefined || that._applicantBP === "") {
						that._applicantBP = oData.results[0].PARTNER;
					}

				},
				error: function(oError) {}
			});
		},

		onSearchThird: function() {

			var oViewThirdPartyDetails = this.getView();
			var oModelThirdPartyDetails = oViewThirdPartyDetails.getModel("oModelThirdPartyDetails");
			var selectedText = oModelThirdPartyDetails.getProperty("/SearchBy");
			selectedText = selectedText.replace(' ', '');

			if (selectedText === "ID") {
				this.onSearchPartyData();
			} else {

				var oModel = this.getView().getModel();
				var sBusinessNumber = this.getView().byId("inputBusinessNumber").getValue();

				this.onPayerResponse(sBusinessNumber);
				var sUrl = "/PartySet('" + sBusinessNumber + "')";
				var that = this;
				oModel.read(sUrl, {
					success: function(oData, oResponse) {
						// Handle the success response
						// console.log("GET Request Successful:", oData);

						var oModelPartiesInvolved = new sap.ui.model.json.JSONModel(oData);
						that.getView().setModel(oModelPartiesInvolved, "oModelPartiesInvolved");
						that._partnerBP = oData.PARTNER;
						// Map fields to input boxes
						var fullName = oData.NAME;
						var maskedName = that.maskFullName(fullName);
						that.getView().byId("inputNameAppl").setValue(maskedName);

						var address = oData.ADDRESS;
						var maskedAddress = that.maskAddress(address);
						that.getView().byId("inputAddressAppl").setValue(maskedAddress);

						var telNo = oData.WORKPHONENO;
						var maskedTelNo = that.maskContactNumber(telNo);
						that.getView().byId("inputTelAppl").setValue(maskedTelNo);

						var email = oData.EMAILADDRESS;
						var maskedMail = that.maskEmail(email);
						that.getView().byId("inputEmailAppl").setValue(maskedMail);

						var cellphone = oData.CELLPHONENO;
						var maskedCelNo = that.maskContactNumber(cellphone);
						that.getView().byId("inputCellAppl").setValue(maskedCelNo);

					},
					error: function(oError) {
						// Handle the error response
						// console.error("GET Request Failed:", oError);
					}
				});
			}
		},

		onSearchPartyData: function() {
			// var oModel = this.getView().getModel();
			// Define your filters
			var url = "/sap/opu/odata/sap/ZEHM_EXPORT_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var sPath = "/PartySet";
			var sBusinessNumber = this.getView().byId("inputBusinessNumber").getValue();
			var that = this;
			var aFilters = [];
			// if (this._PICSearch === "2" || this._PICSearch === "3") {
			aFilters.push(new sap.ui.model.Filter("ID_NUMBER", sap.ui.model.FilterOperator.EQ, sBusinessNumber));
			// }

			// Define success and error handlers
			var fnSuccess = function(oData) {
				// Handle the successful response here
				var fullName = oData.results[0].NAME;
				that._PersonInChargeBP = oData.results[0].PARTNER;

				var maskedName = that.maskFullName(fullName);
				var address = oData.results[0].ADDRESS;
				var maskedAddress = that.maskAddress(address);
				var id = oData.results[0].ID_NUMBER;

				that.getView().byId("inputNameAppl").setValue(maskedName);

				var maskedEmail = that.maskEmail(oData.results[0].EMAILADDRESS);
				that.getView().byId("inputAddressAppl").setValue(maskedAddress);

				var maskedTelNo = that.maskContactNumber(oData.results[0].WORKPHONENO);
				that.getView().byId("inputTelAppl").setValue(maskedTelNo);
				that.getView().byId("inputEmailAppl").setValue(maskedEmail);
				var maskedCelNo = that.maskContactNumber(oData.results[0].CELLPHONENO);
				that.getView().byId("inputCellAppl").setValue(maskedCelNo);

				that._fullNamePer = fullName;
				that._addressPer = address;
				that._idPer = id;
				that._businessPartnerPer = oData.results[0].PARTNER;
				that._emailPer = oData.results[0].EMAILADDRESS;
				that._telNoPer = oData.results[0].WORKPHONENO;
				that._cellNo = oData.results[0].CELLPHONENO;
				// MessageToast.show("Data retrieved successfully!",  oData.results[0].PARTNER);
				// console.log(oData);
			};

			var fnError = function(oError) {
				// Handle the error response here
				MessageToast.show("Error retrieving data.");
				// console.error(oError);
			};

			// Make the OData call
			oModel.read(sPath, {
				filters: aFilters,
				success: fnSuccess,
				error: fnError
			});

		},

		maskFullName: function(fullName) {
			var maskedChunks = [];
			if (fullName !== "") {
				var chunks = fullName.split(" ");
				chunks.forEach(function(chunk) {
					var maskLength = Math.floor(chunk.length / 2);
					var maskedChunk = "*".repeat(maskLength) + chunk.slice(maskLength);
					maskedChunks.push(maskedChunk);
				});
			}

			return maskedChunks.join(" ");
		},
		maskAddress: function(address) {
			var maskedChunks = [];
			if (address !== "") {
				var chunks = address.split(" ");
				chunks.forEach(function(chunk) {
					var maskLength = Math.floor(chunk.length / 2);
					var maskedChunk = "*".repeat(maskLength) + chunk.slice(maskLength);
					maskedChunks.push(maskedChunk);
				});
			}

			return maskedChunks.join(" ");
		},
		maskEmail: function(email) {
			// Split email into two parts

			var maskedEmail = "";
			if (email !== "") {

				var chunks = email.split('@');

				// Apply transformations to each part
				var firstChunk = chunks[0][0] + '******';
				var secondChunk = '***' + chunks[1].slice(-5);

				// Concatenate the masked email
				maskedEmail = firstChunk + '@' + secondChunk;
			}

			return maskedEmail;
		},
		maskContactNumber: function(contactNumber) {
			// Remove non-numeric characters
			var maskedContactNumber = "";
			if (contactNumber !== "") {
				var numericContactNumber = contactNumber.replace(/\D/g, '');

				if (numericContactNumber !== "") {
					// Extract first three digits and last two digits
					var firstThreeDigits = numericContactNumber.substring(0, 3);
					var lastTwoDigits = numericContactNumber.slice(-2);

					// Mask the middle digits with asterisks
					var maskedMiddleDigits = '*'.repeat(numericContactNumber.length - 5);

					// Concatenate masked contact number
					maskedContactNumber = firstThreeDigits + maskedMiddleDigits + lastTwoDigits;
				}
			}

			return maskedContactNumber;
		},

		erfSimulateServerRequest: function() {
			// simulate a longer running operation
			this._oBusyDialog.close();
			this._oBusyDialog.destroy();
			this._oBusyDialog = null;
		},

		parcelSimulateServerRequest: function() {
			// simulate a longer running operation
			this._oParcelBusyDialog.close();
			this._oParcelBusyDialog.destroy();
			this._oParcelBusyDialog = null;
		},
		streetSimulateServerRequest: function() {
			// simulate a longer running operation

			this._oStreetBusyDialog.destroy();
			this._oStreetBusyDialog = null;
		},
		onSearchERFNumber: function() {
			var oERFNumber = this.getView().byId("inpuERFNumber").getValue();
			// var oFilters = [];

			var searchByValue = "ERF Number";
			var lochierValue = "C0160007";
			var plnoValue = "00000000000007981214";
			// var zzerfNrValue = "00169321";

			var oModel = this.getView().getModel();
			// var oFilter = new sap.ui.model.Filter("ERFNumber", sap.ui.model.FilterOperator.EQ, oERFNumber);
			var aFilters = [
				new sap.ui.model.Filter("SearchBy", sap.ui.model.FilterOperator.EQ, searchByValue),
				new sap.ui.model.Filter("Lochier", sap.ui.model.FilterOperator.EQ, lochierValue),
				new sap.ui.model.Filter("Plno", sap.ui.model.FilterOperator.EQ, plnoValue),
				new sap.ui.model.Filter("ZzerfNr", sap.ui.model.FilterOperator.EQ, oERFNumber)
			];

			// var oModel = this.getOwnerComponent().getModel();
			var oTable = this.getView().byId("tableProperty");
			oTable.setVisible(true);

			var oBinding = {
				path: '/CasePropertySet',
				filters: aFilters
			};

			this.getView().setModel(oModel);
			oTable.bindRows(oBinding);

		},

		onEditParties: function() {
			var oModelOwner = this.getView().getModel("oModelOwner");
			var currentIsEditing = oModelOwner.getProperty("/isEditing");
			oModelOwner.setProperty("/isEditing", !currentIsEditing);
		},

		onEditProxy: function() {
			var oModelProxy = this.getView().getModel("oModelProxy");
			var currentIsEditing = oModelProxy.getProperty("/isEditing");
			oModelProxy.setProperty("/isEditing", !currentIsEditing);
		},

		onEditPersonResponsible: function() {
			var oModelPersonResponsible = this.getView().getModel("oModelPersonResponsible");
			var currentIsEditing = oModelPersonResponsible.getProperty("/isEditing");
			oModelPersonResponsible.setProperty("/isEditing", !currentIsEditing);
		},

		onEditBurnType: function() {
			var oModelBurnType = this.getView().getModel("oModelBurnType");
			var currentIsEditing = oModelBurnType.getProperty("/isEditing");
			oModelBurnType.setProperty("/isEditing", !currentIsEditing);
		},

		onEditBurnDescription: function() {
			var oModelBurnDescription = this.getView().getModel("oModelBurnDescription");
			var currentIsEditing = oModelBurnDescription.getProperty("/isEditing");
			oModelBurnDescription.setProperty("/isEditing", !currentIsEditing);
		},

		onEditBurnDetails: function() {
			var oModelBurningDetailsStep = this.getView().getModel("oModelBurningDetailsStep");
			var currentIsEditing = oModelBurningDetailsStep.getProperty("/isEditing");
			oModelBurningDetailsStep.setProperty("/isEditing", !currentIsEditing);
		},

		onEditPress: function() {
			var oView = this.getView();
			var oModel = oView.getModel("oModelOwner");
			oModel.setProperty("/isEditing", true); // Enable editing

			var oViewModelProxy = this.getView();
			var oModelModelProxy = oViewModelProxy.getModel("oModelProxy");
			oModelModelProxy.setProperty("/isEditing", true);

			var oViewoModelBurnType = this.getView();
			var oModelBurnType = oViewoModelBurnType.getModel("oModelBurnType");
			oModelBurnType.setProperty("/isEditing", true);
			var oSave = this.getView().byId("save");
			oSave.setVisible(true);

			var oViewModelBurningDetails = this.getView();
			var oModelBurningDetails = oViewModelBurningDetails.getModel("oModelBurningDetails");
			oModelBurningDetails.setProperty("/isEditing", true);
			var oViewModelFireSevice = this.getView();
			var oModelFireSevice = oViewModelFireSevice.getModel("oModelFireService");
			oModelFireSevice.setProperty("/isEditing", true);
			var oViewModelBurnDescription = this.getView();
			var oModelBurnDescription = oViewModelBurnDescription.getModel("oModelBurnDescription");
			oModelBurnDescription.setProperty("/isEditing", true);

		},

		onSavePress: function() {
			var oView = this.getView();
			var oModel = oView.getModel("oModelOwner");
			oModel.setProperty("/isEditing", false); // Enable editing

			var oViewModelProxy = this.getView();
			var oModelModelProxy = oViewModelProxy.getModel("oModelProxy");
			oModelModelProxy.setProperty("/isEditing", false);

			var oViewoModelBurnType = this.getView();
			var oModelBurnType = oViewoModelBurnType.getModel("oModelBurnType");
			oModelBurnType.setProperty("/isEditing", false);
			var oSave = this.getView().byId("save");
			var oModelBurningDetails = oViewoModelBurnType.getModel("oModelBurningDetails");
			oModelBurningDetails.setProperty("/isEditing", false);

			var oViewFireSevice = this.getView();
			var oModelFireSevice = oViewFireSevice.getModel("oModelFireService");
			oModelFireSevice.setProperty("/isEditing", false);
			oSave.setVisible(false);

			var oViewBurnDescription = this.getView();
			var oModelBurnDescription = oViewBurnDescription.getModel("oModelBurnDescription");
			oModelBurnDescription.setProperty("/isEditing", false);

		},

		onAttachClick: function() {
			var uploadCollection = this.getView().byId("uploadCollection");
			// var fileInput = uploadCollection.$().find("input")[0];
			// fileInput.click();
			var uploader = uploadCollection.getUploader();
			// console.log(uploadCollection.fireSelect  + " upload");
			uploader.click();
		},

		handleEditPress: function() {

			//Clone the data
			this._oSupplier = Object.assign({}, this.getView().getModel().getData().SupplierCollection[0]);
			this._toggleButtonsAndView(true);

		},

		onFileSelect: function(event) {
			// var oModel = this.getView().getModel();
			var file = event.getParameter("files")[0];
			var uploadCollection = this.getView().byId("uploadCollection");
			var fileData = {
				documentId: "1", // Generate a unique ID
				fileName: file.name,
				mimeType: file.type,
				uploadedDate: new Date(),
				url: URL.createObjectURL(file)
			};
			uploadCollection.addItem(new UploadCollectionItem(fileData));

			// Upload the file to the server using AJAX or any other method
			// using the uploadUrl specified in the upload collection definition

			// Once the file is uploaded, update the fileData with the URL returned by the server
			fileData.url = "uploaded-file-url-from-server";
			uploadCollection.updateItem(fileData.documentId, fileData);
		},

		onFileDeleted: function(event) {
			var deletedItemId = event.getParameter("documentId");
			// Delete the file from the server using AJAX or any other method
			// based on the documentId

			// Once the deletion is successful, remove the item from the UploadCollection
			var uploadCollection = this.getView().byId("uploadCollection");
			uploadCollection.removeItem(uploadCollection.getItemById(deletedItemId));
		},

		onOwnerList: function(plNumber) {
			var that = this;
			// var fullNames = [];

			var oFilter = new sap.ui.model.Filter("PLNO", sap.ui.model.FilterOperator.EQ, plNumber);

			this.oDataModelfilts = this.getView().getModel();
			this.oDataModelfilts.read("/PartySet", {
				filters: [oFilter],
				success: function(oData) {

					var oJSONModel = new sap.ui.model.json.JSONModel(oData);
					that.getView().setModel(oJSONModel, "oModelParty");
				},
				error: function(oError) {
					// Handle error
					MessageBox.error(" oError ", oError);
				}
			});
		},
		onSearchInstaller: function() {
			// var url = "/sap/opu/odata/sap/ZEHM_FUEL_BURNING_SRV";
			// var oModel = new sap.ui.model.odata.ODataModel(url, true);
			var oModel = this.getView().getModel();
			var sBusinessNumber = this.getView().byId("inputBusinessNumber").getValue();
			var sUrl = "/PartySet('" + sBusinessNumber + "')";
			var that = this;
			oModel.read(sUrl, {
				success: function(oData, oResponse) {

					var fullName = oData.NAME;
					var address = oData.ADDRESS;
					var email = oData.EMAILADDRESS;
					var cellNumber = oData.CELLPHONENO;
					var telNumber = oData.WORKPHONENO;
					that._InstallerBP = oData.PARTNER;
					// var id = oData.ID_NUMBER;

					//  data masking
					var maskedName = that.maskFullName(fullName);
					var maskedAddress = that.maskAddress(address);
					var maskedCelNo = that.maskContactNumber(cellNumber);
					var maskedEmail = that.maskEmail(email);
					var maskedTelNo = that.maskContactNumber(telNumber);
					// var maskedID = that.maskID(id);

					that.getView().byId("inputNameAppl").setValue(maskedName);
					that.getView().byId("inputAddressAppl").setValue(maskedAddress);
					that.getView().byId("inputCellAppl").setValue(maskedCelNo);
					that.getView().byId("inputEmailAppl").setValue(maskedEmail);
					that.getView().byId("inputTelAppl").setValue(maskedTelNo);

					// Global initialization
					that._fullNameInstall = fullName;
					that._addressInstall = address;
					that._emailInstall = email;
					that._telNoPer = telNumber;
					that._cellNo = cellNumber;
					// that._idInstall = id;
				},
				error: function(oError) {

					MessageBox.error("GET Request Failed:", oError);
				}
			});

		},

		onBurningDetails: function() {

			var payload = {};

			payload.CaseGuid = this.CaseGuid;

			payload.CaseId = this.CaseId;
			payload.CaseType = 'ZE05';
			var oModelBurnType = this.getView().getModel("oModelBurnType");
			payload.BurnType = oModelBurnType.getProperty("/BurnType");

			var sFullDescription = this.getView().getModel("oModelBurningDetailsStep").getProperty("/fullDescription");

			var sLocation = this.getView().getModel("oModelBurningDetailsStep").getProperty("/location");

			var sEstimatedCost = this.getView().getModel("oModelBurningDetailsStep").getProperty("/estimatedCost");

			var sTimePeriod = this.getView().getModel("oModelBurningDetailsStep").getProperty("/timePeriod");

			payload.TypeEstmQtyLocationOfBurnMaterials = sFullDescription + ", " + sLocation + ", " + sEstimatedCost + ", " + sTimePeriod;

			var MaterialOriginate = this.getView().getModel("oModelBurningDetailsStep").getProperty("/materialOriginate");
			var bIsMaterialOriginate = MaterialOriginate === "Yes";

			if (bIsMaterialOriginate) {
				payload.FlagMaterialOriginatesAtBurnPlace = "X";
			} else {
				payload.FlagMaterialOriginatesAtBurnPlace = "";
			}

			var sInvestigationReducing = this.getView().getModel("oModelBurningDetailsStep").getProperty("/investigationReducing");

			payload.DetailInvestigationAltRRRR = sInvestigationReducing;
			var sAlternativeInvestigation = this.getView().getModel("oModelBurningDetailsStep").getProperty("/alternativeInvestigation");

			payload.DetailInvestigationAltCost = sAlternativeInvestigation;
			var proposedBurn = this.getView().getModel("oModelBurningDetailsStep").getProperty("/proposedBurn");

			var bProposedBurn = proposedBurn === "Yes";

			if (bProposedBurn) {
				payload.FlagBurnSite100mAway = "X";
			} else {
				payload.FlagBurnSite100mAway = "";
			}

			var openBurning = this.getView().getModel("oModelBurningDetailsStep").getProperty("/openBurning");
			var listExpand = this.getView().getModel("oModelBurningDetailsStep").getProperty("/listExpand");
			payload.HarzardNuisanceInfoAndMitigation = openBurning + ", " + listExpand;

			var adjPropertyNotified = this.getView().getModel("oModelBurningDetailsStep").getProperty("/adjPropertyNotified");

			var bAdjPropertyNotified = adjPropertyNotified === "Yes";
			if (bAdjPropertyNotified) {
				payload.FlagAdjacentPropertyNotified = "X";
			} else {
				payload.FlagAdjacentPropertyNotified = "";
			}

			// payload.D8FireFightingWaterSource = "";

			var waterSource = this.getView().getModel("oModelFireService").getProperty("/WaterSource");

			payload.E1FireFightingWaterSource = waterSource;

			var burnLandOwnership = this.getView().getModel("oModelFireService").getProperty("/NonResidential");
			payload.BurnLandOwnershipInfo = burnLandOwnership;

			var fireFightingMeasures = this.getView().getModel("oModelFireService").getProperty("/SafeMaterial");
			payload.FireFightingMeasuresInPlace = fireFightingMeasures;

			var combustableMaterail = this.getView().getModel("oModelFireService").getProperty("/CombustableMaterail");
			var bCombustableMaterail = combustableMaterail === "Yes";

			if (bCombustableMaterail) {
				payload.FlagAdjucentAreaFreeOfMaterial = "X";
			} else {
				payload.FlagAdjucentAreaFreeOfMaterial = "";
			}

			var safeStack = this.getView().getModel("oModelFireService").getProperty("/SafeStack");
			var bSafeStack = safeStack === "Yes";

			if (bSafeStack) {
				payload.FlagStackSizeManagable = "X";
			} else {
				payload.FlagStackSizeManagable = "";
			}

			var oModelRegMember = this.getView().getModel("oModelRegMember");

			var memberOfAnother = oModelRegMember.getProperty("/regMember");

			var bMemberOfAnother = memberOfAnother === "03";

			if (bMemberOfAnother) {
				payload.Flag_MemberOfAnotherExmpOrg = "X";
			} else {

				payload.Flag_MemberOfAnotherExmpOrg = "";
			}

			this.oDataModelfilts = this.getView().getModel();
			this.oDataModelfilts.create("/BurningDetailsSet", payload, {
				success: function(oData, oResponse) {
					// console.log("response oData", oData);
					MessageToast.show("Burning Details successfully created! with Case Id:" + oData.CaseId);
					// MessageBox.success("Burning Details successfully created! with Case Id:" + oData.CaseId, {
					// 	title: "Success",
					// 	onClose: function() {}
					// });
				},
				error: function(err, oResponse) {
					// busyIndicator.hide();
					MessageBox.error(
						(err.response.body).error.message.value
					);

				}
			});

		},

		onBurningArea: function() {
			var oData = {};

			var squareMeterage = this.getView().getModel("oModelBurningDetailsStep").getProperty("/squareMeterage");
			oData.BurnArea = squareMeterage;

			var oCaseModel = this.getView().getModel("oCaseModel");

			oData.CaseGuid = oCaseModel.getProperty("/caseGuid");

			var caseId = oCaseModel.getProperty("/caseID");

			var oModel = this.getView().getModel();

			oModel.create("/CaseHeaderSet", oData, {
				success: function(data) {
					// Handle success
					MessageToast.show("Case " + caseId + "  succesfully updated!");

				},
				error: function(error) {
					// Handle error
					MessageBox.error("Error creating data:", error);

				}
			});

		},

		onFireService: function() {
			var payload = {};

			var sWaterSource = this.getView().getModel("oModelFireService").getProperty("/WaterSource");

			var sNonResidential = this.getView().getModel("oModelFireService").getProperty("/NonResidential");
			var sSafeMaterial = this.getView().getModel("oModelFireService").getProperty("/SafeMaterial");
			var sFireMeasures = this.getView().getModel("oModelFireService").getProperty("/FireMeasures");
			var sSafeStack = this.getView().getModel("oModelFireService").getProperty("/SafeStack");
			var sOther = this.getView().getModel("oModelFireService").getProperty("/Other");

			var sSelectedSafeMaterial = sSafeMaterial || "Yes";

			var sSelectedSafeStack = sSafeStack || "Yes";

			var sSelectedNonResidential = sNonResidential || "Yes";

			payload.WaterSource = sWaterSource;

			if (sSelectedSafeMaterial) {
				payload.SafeMaterial = "X";
			}

			if (sSelectedSafeStack) {
				payload.SafeStack = "X";
			}

			if (sSelectedNonResidential) {
				payload.NonResidential = "X";
			}

			payload.FireMeasures = sFireMeasures;

			payload.CaseGuid = this.CaseGuid;
			payload.CaseId = this.CaseId;
			payload.CaseType = this.CaseType;

			this.oDataModelfilts = this.getView().getModel();
			this.oDataModelfilts.create("/FireServiceSet", payload, {
				success: function(oData, oResponse) {
					// console.log("response oData", oData);

					MessageBox.success("Fire Service Details successfully created! with Case Id:" + oData.CaseId, {
						title: "Success",
						onClose: function() {}
					});
				},
				error: function(err, oResponse) {
					// busyIndicator.hide();
					MessageBox.error(
						JSON.parse(err.response.body).error.message.value
					);

				}
			});

		},

		// Implement your UploadCollection event handlers here
		onChangeOwner: function(oEvent) {

			var oChooseOwner = this.getView().byId("ChooseOwnerComboBox");

			var oSelectedItem = oEvent.getSource().getSelectedItem();
			var selectedText = oSelectedItem.getText();
			var that = this;
			// var BPNumber = "1EE09A9156041EDEA1A75DF2E17D5162";
			var CaseGuid = this.CaseGuid;
			// console.log("checking case guid", BPNumber);
			var oFilter = new sap.ui.model.Filter("CaseGuid", sap.ui.model.FilterOperator.EQ, CaseGuid);

			var oModel = this.getView().getModel();
			// console.log("filter " + oFilter);
			oModel.read("/ApplicantSet", {
				filters: [oFilter],
				success: function(oData) {
					// Handle success, oData contains the response data
					var oDataResult = oData.results;
					var fullName = "";
					var address = "";
					var cellphone = "";
					var telephone = "";
					var email = "";
					oDataResult.forEach(function(item) {
						if (item.Fullname === selectedText) {

							fullName = item.Fullname;
							address = item.Address;
							cellphone = item.CellNumber;
							telephone = item.TelephoneNumber;
							email = item.Email;
						}

					});

					var oModelOwner = new JSONModel({
						OwnerName: fullName,
						Address: address,
						Cellphone: cellphone,
						Telephone: telephone,
						Email: email,

						isEditing: false // Initially, not in edit mode
					});
					that.getView().setModel(oModelOwner, "oModelOwner");

				},
				error: function(oError) {
					// Handle error
					MessageBox.error(" oError ", oError);
				}
			});

			// console.log(selectedText, " text");
		},

		onPropertySubcomponent: function() {

			var plNo = this._selectedAddress.PLNO;
			var oModel = this.getView().getModel();
			var oData = {};
			oData.PropertyParcelNo = plNo;
			var that = this;
			var oCaseModel = this.getView().getModel("oCaseModel");
			this.CaseGuid = oCaseModel.getProperty("/caseGuid");
			oData.CaseGuid = this.CaseGuid;
			oModel.create("/CaseHeaderSet", oData, {
				success: function(data) {
					// Handle success
					MessageToast.show("Address successfully saved");
					that._propertyResponse = data;
					that._bAddress = true;
				},
				error: function(error) {
					// Handle error
					MessageBox.error("Error creating data:", error);
					that._bAddress = false;
				}
			});

		},
		onPartiesSubcomponent: function() {

			var oModel = this.getView().getModel();
			var oData = {};
			oData.OwnerBP = this._ownerBP;
			oData.InstallerBP = this._InstallerBP;
			oData.ApplicantBP = this._applicantBP;
			var that = this;
			var oCaseModel = this.getView().getModel("oCaseModel");
			this.CaseGuid = oCaseModel.getProperty("/caseGuid");
			oData.CaseGuid = this.CaseGuid;
			oModel.create("/CaseHeaderSet", oData, {
				success: function(data) {
					// Handle success
					MessageToast.show("Parties successfully save:");
					that._bAddress = true;
				},
				error: function(error) {
					// Handle error
					MessageBox.error("Error creating data:", error);
					that._bAddress = false;
				}
			});

		},
		onChange: function(oEvent) {
			// Handle file selection
		},

		handleChangeDetails: function(oEvent) {
			var oModel = this.getView().getModel("oModelBurningDetails");
			var sTextAreaId = oEvent.getSource().getId().toString();
			console.log("id for textarea:" + sTextAreaId);
			var id = sTextAreaId.split("--");
			var inputCurrent = id[id.length - 1];
			var sTextAreaValue = oEvent.getParameter("value");
			if (inputCurrent === "txtAreaFullDescrip") {
				oModel.setProperty("/FullDescription", sTextAreaValue);

			} else if (inputCurrent === "txtAreaInvestigation") {
				oModel.setProperty("/InvestigReducing", sTextAreaValue);

			} else if (inputCurrent === "txtAreaDetailAlt") {
				oModel.setProperty("/AltInvest", sTextAreaValue);
			}
			// else if (inputCurrent ="txtAreaDetailAlt")
			// {

			// }

		},

		_updateModel: function(sValue) {
			// Get the model

			// Set the value in the model

		},

		onFilenameLengthExceed: function(oEvent) {
			// Handle filename length exceed
		},

		onFileSizeExceed: function(oEvent) {
			// Handle file size exceed
		},

		onTypeMissmatch: function(oEvent) {
			// Handle file type mismatch
		},

		onUploadComplete: function(oEvent) {
			// Handle upload completion
		},

		onBeforeUploadStarts: function(oEvent) {
			// Handle before upload starts
		},
		onAfterRendering: function() {
			// var oCheckBox = this.getView().byId("other");
			// oCheckBox.fireSelect();

			var wizard = this.byId("wizMain");
			var currentStep = wizard.getCurrentStep();

			// var steps = this.wizard.getSteps();
			// var inputString = currentStep;
			var steps = currentStep.split("--");
			var inputCurrent = steps[steps.length - 1];
			if (inputCurrent !== "stepAppPropertySearch") {
				var obtnBack = this.getView().byId("btnBack");
				obtnBack.setVisible(true);
			}

			var GroupMaterial = this.getView().byId("GroupMaterial");
			GroupMaterial.setSelectedIndex(-1);

			var oGroupOpenBurn = this.getView().byId("GroupOpenBurn");
			oGroupOpenBurn.setSelectedIndex(-1);

		},

		onBack: function() {
			this._wizard.previousStep();
		},

		onPrevious: function() {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.initialize();
			oRouter.navTo("Main", {});
		},

		onSearchChange: function(oEvent) {
			var oComboBox = oEvent.getSource();
			var sSelectedKey = oComboBox.getSelectedKey();
			var oflexERFNumber = this.getView().byId("flexERFNumber");
			var oflexAllotment = this.getView().byId("flexAllotment");
			var oflexPrivateAddress = this.getView().byId("flexPrivateAddress");
			var oflexEParcelNumber = this.getView().byId("flexEParcelNumber");
			var oflexStreetAddress = this.getView().byId("flexStreetAddress");
			var oflexGISMap = this.getView().byId("flexGISMap");
			var oTable = this.getView().byId("zoneidErfTable");

			if (sSelectedKey === "1") {
				oflexERFNumber.setVisible(false);
				oflexAllotment.setVisible(false);
				oflexEParcelNumber.setVisible(false);
				oflexPrivateAddress.setVisible(false);
				oflexStreetAddress.setVisible(false);
				oflexGISMap.setVisible(false);
				this.onProperty();
			} else if (sSelectedKey === "2") {
				oflexERFNumber.setVisible(false);
				oflexAllotment.setVisible(false);
				oflexEParcelNumber.setVisible(false);
				oflexPrivateAddress.setVisible(false);
				oflexStreetAddress.setVisible(false);
				oflexGISMap.setVisible(false);
				this.onFavourate();
			} else if (sSelectedKey === "3") {
				oflexERFNumber.setVisible(true);
				oflexAllotment.setVisible(true);
				oflexEParcelNumber.setVisible(false);
				oflexPrivateAddress.setVisible(false);
				oflexStreetAddress.setVisible(false);

				oflexGISMap.setVisible(false);
				oTable.setVisible(false);
			} else if (sSelectedKey === "4") {
				oflexERFNumber.setVisible(false);
				oflexAllotment.setVisible(false);
				oflexPrivateAddress.setVisible(false);
				oflexStreetAddress.setVisible(false);
				oflexEParcelNumber.setVisible(true);
				oflexGISMap.setVisible(false);
				oTable.setVisible(false);
			} else if (sSelectedKey === "5") {

				oflexERFNumber.setVisible(false);
				oflexAllotment.setVisible(false);
				oflexPrivateAddress.setVisible(false);
				oflexStreetAddress.setVisible(false);
				oflexEParcelNumber.setVisible(false);
				oflexGISMap.setVisible(true);
				oTable.setVisible(false);
			} else if (sSelectedKey === "6") {

				oflexERFNumber.setVisible(false);
				oflexAllotment.setVisible(false);
				oflexEParcelNumber.setVisible(false);
				oflexStreetAddress.setVisible(false);
				oflexPrivateAddress.setVisible(true);
				oflexGISMap.setVisible(false);
				oTable.setVisible(false);

			} else if (sSelectedKey === "7") {
				oflexERFNumber.setVisible(false);
				oflexAllotment.setVisible(false);
				oflexPrivateAddress.setVisible(false);

				oflexEParcelNumber.setVisible(false);
				oflexStreetAddress.setVisible(true);
				oflexGISMap.setVisible(false);
				oTable.setVisible(false);

			}

		},

		// onSearchChange: function(oEvent) {
		// 	var oComboBox = oEvent.getSource();
		// 	var sSelectedKey = oComboBox.getSelectedKey();
		// 	var oflexERFNumber = this.getView().byId("flexERFNumber");
		// 	var oflexAllotment = this.getView().byId("flexAllotment");
		// 	var oflexPrivateAddress = this.getView().byId("flexPrivateAddress");
		// 	var oflexEParcelNumber = this.getView().byId("flexEParcelNumber");
		// 	var oflexStreetAddress = this.getView().byId("flexStreetAddress");

		// 	if (sSelectedKey === "1") {
		// 		oflexERFNumber.setVisible(true);
		// 		oflexAllotment.setVisible(true);
		// 		oflexEParcelNumber.setVisible(false);
		// 		oflexPrivateAddress.setVisible(false);
		// 		oflexStreetAddress.setVisible(false);
		// 	} else if (sSelectedKey === "2") {
		// 		oflexERFNumber.setVisible(false);
		// 		oflexAllotment.setVisible(false);
		// 		oflexEParcelNumber.setVisible(false);
		// 		oflexStreetAddress.setVisible(false);
		// 		oflexPrivateAddress.setVisible(true);
		// 	} else if (sSelectedKey === "3") {
		// 		oflexERFNumber.setVisible(false);
		// 		oflexAllotment.setVisible(false);
		// 		oflexPrivateAddress.setVisible(false);
		// 		oflexStreetAddress.setVisible(false);
		// 		oflexEParcelNumber.setVisible(true);
		// 	} else if (sSelectedKey === "4") {
		// 		oflexERFNumber.setVisible(false);
		// 		oflexAllotment.setVisible(false);
		// 		oflexPrivateAddress.setVisible(false);
		// 		oflexStreetAddress.setVisible(false);
		// 		oflexEParcelNumber.setVisible(false);
		// 	} else if (sSelectedKey === "5") {
		// 		oflexERFNumber.setVisible(false);
		// 		oflexAllotment.setVisible(false);
		// 		oflexPrivateAddress.setVisible(false);

		// 		oflexEParcelNumber.setVisible(false);
		// 		oflexStreetAddress.setVisible(true);

		// 	}

		// },

		onDeclaration: function() {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.initialize();
			oRouter.navTo("declaration", {});

		},
		onPersonResponse: function(oEvent) {
			var oComboBox = oEvent.getSource();
			var sSelectedKey = oComboBox.getSelectedKey();
			var ofrmAppPersonResponsible = this.getView().byId("frmAppPersonResponsible");
			// var ofrmAppRegMember = this.getView().byId("frmAppRegMember");
			if (sSelectedKey === "1") {
				ofrmAppPersonResponsible.setVisible(false);
				this._thirdParty = "owner";

				this._partnerBP = this._ownerBP;
				this.onPayerResponse(this._partnerBP);
			} else if (sSelectedKey === "2") {
				ofrmAppPersonResponsible.setVisible(false);
				this._thirdParty = "applicant";

				this._partnerBP = this._applicantBP;
				this.onPayerResponse(this._partnerBP);
			} else if (sSelectedKey === "3") {
				ofrmAppPersonResponsible.setVisible(true);
				this._thirdParty = "thirdParty";

			}
		},

		onPayerResponse: function(bpNumber) {
			var oModel = this.getView().getModel();
			var oModelPersonResponsible = this.getView().getModel("oModelPersonResponsible");

			var sUrl = "/PartySet('" + bpNumber + "')";

			oModel.read(sUrl, {
				success: function(oData, oResponse) {
					oModelPersonResponsible.setProperty("/Name", oData.NAME);

					oModelPersonResponsible.setProperty("/Address", oData.ADDRESS);
					oModelPersonResponsible.setProperty("/Telephone", oData.WORKPHONENO);
					oModelPersonResponsible.setProperty("/Email", oData.EMAILADDRESS);
					oModelPersonResponsible.setProperty("/Cellphone", oData.CELLPHONENO);

				},
				error: function(oError) {
					// Handle the error response
					MessageBox.error("GET Request Failed:", oError);
				}
			});
		},

		onFileUploadChange: function(oEvent) {
			var oFileUploader = oEvent.getSource();
			var oFile = oFileUploader.oFileUpload.files[0];

			if (oFile) {
				var uniqueId = this.generateUniqueId();
				// Assuming you have a model named "pdfModel"
				var oPdfModel = this.getView().getModel("pdfModel");
				var aPdfData = oPdfModel.getProperty("/pdfData") || [];
				// var oDate = new Date

				var currentDate = new Date();

				// Extract the date components
				var day = currentDate.getDate();
				var month = currentDate.getMonth() + 1; // Adding 1 because months are zero-based
				var year = currentDate.getFullYear();

				// Create a formatted date string
				var formattedDate = day + "/" + month + "/" + year;
				// Create an object to hold file information
				var oPdfFileInfo = {
					name: oFile.name,
					size: oFile.size,
					type: oFile.type,
					file: oFile,
					id: uniqueId,
					date: formattedDate,
					docName: "",
					isUploaded: false
				};
				this.fileName = oFile.name;
				this.file = oFile;
				// Add the file info to the model
				aPdfData.push(oPdfFileInfo);
				oPdfModel.setProperty("/pdfData", aPdfData);
				this._Checklist();

				oPdfModel.refresh(true);
			}
		},
		onDeleteFilePress: function(oEvent) {
			// Get the selected item (button's parent)

			var oContextModel = oEvent.getSource().getBindingContext("pdfModel");
			var oModelDoc = oContextModel.getModel();
			var oData = oModelDoc.getProperty(oContextModel.getPath());

			var oSelectedItem = oEvent.getSource().getParent();

			// Get the context of the selected item
			var oContext = oSelectedItem.getBindingContext("pdfModel");

			// Get the path of the selected item
			var sPath = oContext.getPath();

			// Extract the index from the path
			var nIndex = parseInt(sPath.split("/").pop(), 10);

			// Get the model and its data
			var oPdfModel = oContext.getModel();
			var aPdfData = oPdfModel.getProperty("/pdfData");

			// Remove the item from the data array
			if (nIndex > -1) {
				aPdfData.splice(nIndex, 1);
			}

			// Update the model with the new data
			oPdfModel.setProperty("/pdfData", aPdfData);
			oPdfModel.refresh(true);
		},

		// onDeleteFilePress: function(oEvent) {
		// 	var oTable = this.getView().byId("tableId");
		// 	oTable.removeItem(oEvent.getSource().getParent());
		// },

		generateUniqueId: function() {

			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0,
					v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
			return uuid;
		},

		// Function to validate the fields in the Parties Involved step
		validateApplicantDetailsStep: function() {

			var bValid = true;

			if (this._thirdParty === undefined) {
				// MessageBox.error("Please select Person Responsible for Payment");
				// bValid = false;
			} else {
				if (this._thirdParty === "thirdParty") {

					// var oModelPartiesInvolved = this.getView().getModel("oModelPartiesInvolved");

					// Check if the model exists
					// if (oModelPartiesInvolved) {

					// 	if (oModelPartiesInvolved.getData()) {
					// 		bValid = true;
					// 	} 
					// else {
					// 	MessageBox.error("Please search for the third party");
					// 	bValid = false;
					// }
					// } 
					// else {
					// 	MessageBox.error("Please search for the third party");
					// 	bValid = false;
					// }

				} else if (this._thirdParty === "owner") {
					if (this._owner === undefined) {
						MessageBox.error("Please Select Details of Owner first! ");
						bValid = false;
					}

				} else if (this._thirdParty === "applicant") {

					this._partnerBP = this._applicantBP;
					bValid = true;
				}
			}

			return bValid;
		},
		LoggedUser: function() {

			var sUrl = "/LoginPartySet";
			var that = this;
			var oModel = this.getView().getModel();
			oModel.read(sUrl, {
				success: function(oData, oResponse) {

					that._fullNameAppl = oData.results[0].NAME;

					that._addressAppl = oData.results[0].ADDRESS;

					that._idAppl = oData.results[0].ID_NUMBER;

					that._businessPartnerAppl = oData.results[0].PARTNER;

					that._emailAppl = oData.results[0].EMAILADDRESS;
					that._applicantBP = oData.results[0].PARTNER;
					that._telNoAppl = oData.results[0].WORKPHONENO;
					that._cellNoAppl = oData.results[0].CELLPHONENO;

				},
				error: function(oError) {
					// Handle the error response
					MessageBox.error("GET Request Failed:", oError);
				}
			});

		},

		validateStepAppBurning: function() {
			var sValid = true;

			return sValid;
		},

		validateStepAppAirPoll: function() {

			var aValid = true;

			return aValid;
		},

		validateStepAppFireService: function() {
			var sValid = true;

			return sValid;
		},
		onPhoneNumberChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();

			// Remove any non-digit characters
			sValue = sValue.replace(/\D/g, '');
			// console.log(sValue.length);
			// Limit to 10 digits
			if (sValue.length > 10) {
				sValue = sValue.slice(0, 10);
				var oInputReplace = this.getView().byId("inputAltCellAppl");
				oInputReplace.setValue(sValue);
				// console.log(sValue);
			}

			// Update the bound model property if needed
			var oModel = this.getView().getModel();
			oModel.setProperty("/phoneNumber", sValue);
		},

		onEmailChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();

			// Regular expression to validate email format
			var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

			if (!emailRegex.test(sValue)) {
				oInput.setValueState(sap.ui.core.ValueState.Error); // Set error state
			} else {
				oInput.setValueState(sap.ui.core.ValueState.None); // Clear error state
			}
		},

		onSaveOwnerContacts: function() {
			// oModelOwner>/AlternateCell
			var oModelOwner = this.getView().getModel("oModelOwner");

			var Payload = {};

			Payload.CaseGuid = this.CaseGuid;
			Payload.FirstName = oModelOwner.getProperty("/OwnerName");
			// Payload.HouseNumber = "";

			var mobileNumberAlt = oModelOwner.getProperty("/AlternateCell");
			if (mobileNumberAlt !== null || mobileNumberAlt !== "") {
				Payload.MobileNumber = mobileNumberAlt;
			}

			var emailAlt = oModelOwner.getProperty("/AlternateEmail");

			if (emailAlt !== null || emailAlt !== "") {
				Payload.EmailAddress = emailAlt;
			}

			Payload.Role = "OWNR";
			Payload.Street = oModelOwner.getProperty("/Address");
			// Payload.City = "";
			// Payload.PostalCode = "";

			Payload.TelephoneNumber = oModelOwner.getProperty("/Telephone");
			this.onSaveContact(Payload);
		},

		onSavePayerContacts: function() {
			// oModelOwner>/AlternateCell
			var oModelPersonResponsible = this.getView().getModel("oModelPersonResponsible");

			var Payload = {};

			Payload.CaseGuid = this.CaseGuid;
			Payload.FirstName = oModelPersonResponsible.getProperty("/Name");
			// Payload.HouseNumber = "";

			var mobileNumber = oModelPersonResponsible.getProperty("/Cellphone");
			if (mobileNumber !== null || mobileNumber !== "") {
				Payload.MobileNumber = mobileNumber;
			}

			var email = oModelPersonResponsible.getProperty("/Email");

			if (email !== null || email !== "") {
				Payload.EmailAddress = email;
			}

			Payload.Role = "PAYR";
			Payload.Street = oModelPersonResponsible.getProperty("/Address");
			// Payload.City = "";
			// Payload.PostalCode = "";

			Payload.TelephoneNumber = oModelPersonResponsible.getProperty("/Telephone");
			this.onSaveContact(Payload);
		},
		onSaveContact: function(payload) {

			this.oDataModelfilts = this.getView().getModel();
			this.oDataModelfilts.create("/ContactSet ", payload, {
				success: function(oData, oResponse) {
					sap.m.MessageToast.show("Contact successfully submitted!");
				},
				error: function(err, oResponse) {
					sap.m.MessageToast.show(
						" failed!" + err
					);
				}
			});

		},

		onSaveDraft: function() {
			var wizard = this.byId("wizMain");
			var currentStep = wizard.getCurrentStep();
			var steps = currentStep.split("--");
			this.CurrentSep = steps[steps.length - 1];
			if (this.CurrentSep === "stepAppPropertySearch") {
				if (this._selectedAddress === undefined || this._selectedAddress === "") {
					MessageBox.error("Please select address to save!");
					return;
				}

				this.onPropertySubcomponent();
			} else if (this.CurrentSep === "stepAppDetails") {

				this.onSaveOwnerContacts();
				this.onSavePayerContacts();
				var bValid = this.validateApplicantDetailsStep();
				if (!bValid) {
					return;

				}
				if (this._ownerBP === undefined) {
					this._ownerBP = "";
				}

				if (this._applicantBP === undefined) {
					this._applicantBP = "";
				}

				if (this._partnerBP === undefined) {
					this._partnerBP = "";
				}
				this.onPartyCreate(this._ownerBP, "", "");
				this.onPartyCreate("", this._applicantBP, "");
				this.onPartyCreate("", "", this._partnerBP);

			} else if (this.CurrentSep === "stepAppBurningType" || this.CurrentSep === "stepAppFireService") {
				this.onBurningDetails();

				// } else if (this.CurrentSep === "stepAppFireService") {
				// this.onFireService();
			}
			if (this.CurrentSep === "stepAppBurningType") {
				this.onBurningArea();

			}

		},

		onNext: function() {
			var wizard = this.byId("wizMain");
			var currentStep = wizard.getCurrentStep();
			var bValid = true;
			var steps = currentStep.split("--");
			this.CurrentSep = steps[steps.length - 1];
			var oModelRegMember = this.getView().getModel("oModelRegMember");
			var selectedRegMember = oModelRegMember.getProperty("/regMember");

			if(this.CurrentSep === "stepAppPolyGon"){
				//let stream = this._captureScreen();
				//console.log(stream);
				//let gisPolygon = JSON.parse(sessionStorage.getItem("featuresToPass"));
				//this._savePolygonData(this.oUTILModel, gisPolygon,this.getView().getModel("oCaseModel").getProperty("/caseID"));
			}

			if (this.CurrentSep === "stepAppPropertySearch") {
				this.LoggedUser();
				if (this._selectedAddress === undefined || this._selectedAddress === "") {
					MessageBox.error("Please select address to proceed!");
					return;
				}

				if (this._bAddress === undefined || !this._bAddress) {
					this.onPropertySubcomponent();
				}

				var obtnBack = this.getView().byId("btnBack");
				this.onShowSearch();
				obtnBack.setVisible(true);

				var oModel = this.getView().getModel("oCaseModel");
				this.CaseGuid = oModel.getProperty("/caseGuid");
				this.CaseId = oModel.getProperty("/caseID");
				this.CaseType = oModel.getProperty("/caseType");

				var ofrmChoosePersRespon = this.getView().byId("frmChoosePersRespon");
				if (selectedRegMember === "03") {
					ofrmChoosePersRespon.setVisible(false);
				}

			}

			if (this.CurrentSep === "stepAppGIS") {
				var obtnNext = this.getView().byId("btnNext");
				var obtnComplete = this.getView().byId("btnComplete");
				obtnComplete.setVisible(true);
				obtnNext.setVisible(false);
			}

			if (this.CurrentSep === "stepAppDetails") {
				this.onSaveOwnerContacts();
				this.onSavePayerContacts();
				bValid = this.validateApplicantDetailsStep();
				if (!bValid) {
					return;

				}

				if (selectedRegMember !== "03") {
					if (this._thirdParty === undefined) {
						MessageBox.error("Please select Person Responsible for Payment");
						return;
					}
				}

				if (this._ownerBP === undefined) {
					this._ownerBP = "";
				}

				if (this._applicantBP === undefined) {
					this._applicantBP = "";
				}

				if (this._partnerBP === undefined) {
					this._partnerBP = "";
				}
				this.onPartyCreate(this._ownerBP, "", "");
				this.onPartyCreate("", this._applicantBP, "");
				this.onPartyCreate("", "", this._partnerBP);

			} else if (this.CurrentSep === "stepAppBurningType" || this.CurrentSep === "stepAppFireService") {
				this.onBurningDetails();

				bValid = this.validateStepAppBurning();
			}
			// bValid = true;
			else if (this.CurrentSep === "stepAppAirPollution") {
				bValid = this.validateStepAppAirPoll();
				// } else if ((this.CurrentSep === "stepAppFireService")) {
				// var sValid = this.validateStepAppFireService();
			}

			if (this.CurrentSep === "stepAppReview") {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

				oRouter.initialize();
				oRouter.navTo("declaration");
				// bValid = true;

			}
			if (this.CurrentSep === "stepAppBurningType") {
				this.onBurningArea();
				// bValid = true;
			}
			if (this.CurrentSep === "stepAppDocuments") {
				bValid = this.onValidateMandantory(selectedRegMember);
			}

			// 
			if (bValid) {
				// if (this._wizard.validateStep(this._wizard.getProgress())) {
				this._wizard.nextStep();
				// }	
			}

		},

		onValidateMandantory: function(selectedRegMember) {
			var bProceed = true;
			var oPdfModel = this.getView().getModel("pdfModel");
			var aPdfData = oPdfModel.getProperty("/pdfData");
			var aMandatoryDocuments = [];

			if (selectedRegMember === "01") {
				aMandatoryDocuments = ["Area Map", "Fire Plan", "Public Participation Report", "CPFPA Membership"];
			} else {
				aMandatoryDocuments = ["Area Map", "Fire Plan", "Public Participation Report"];
			}

			var bAllMandatoryUploaded = aMandatoryDocuments.every(function(docName) {
				return aPdfData.some(function(doc) {
					return doc.docName === docName && doc.isUploaded;
				});
			});

			if (!bAllMandatoryUploaded) {
				if (selectedRegMember === "01") {
					sap.m.MessageBox.error(
						"All mandatory documents (Area Map, Fire Plan, Public Participation Report and CPFPA Membership) must be uploaded.");
					bProceed = false;
				} else {
					sap.m.MessageBox.error("All mandatory documents (Area Map, Fire Plan, Public Participation Report) must be uploaded.");
					bProceed = false;
				}

			}

			return bProceed;
		},

		onCellChange: function(oEvent) {

			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();
			var oInputReplace = this.getView().byId("inAltCell");
			// Remove any non-digit characters
			sValue = sValue.replace(/\D/g, '');

			if (sValue.length > 10) {
				sValue = sValue.slice(0, 10);

				oInputReplace.setValue("");
				// console.log(sValue);
			}

			oInputReplace.setValue(sValue);

		},

		onPartyCreate: function(ownerBP, applicantBP, payerBP) {

			var oData = {};
			// this._ownerBP this._applicantBP this._partnerBP
			if (ownerBP !== "") {
				oData.OwnerBP = ownerBP;
			}
			if (applicantBP !== "") {
				oData.ApplicantBP = applicantBP;
			}
			if (payerBP !== "") {
				oData.PayerBP = payerBP;
			}

			if (this._ownerBP !== undefined) {

				var oCaseModel = this.getView().getModel("oCaseModel");
				this.CaseGuid = oCaseModel.getProperty("/caseGuid");
				oData.CaseGuid = this.CaseGuid;
				var that = this;

				var oModel = this.getView().getModel();
				oModel.create("/CaseHeaderSet", oData, {
					success: function(data) {
						// Handle success
						that._propertyResponse = data;
						that._bPartiesInvolved = true;
						MessageToast.show("Party Involved successfully saved");

					},
					error: function(error) {
						// Handle error
						MessageBox.error("Error creating data:", error);
						this._bPartiesInvolved = false;
					}
				});

			} else {
				MessageBox.error("Please Select Owner Details");
			}
		},

		oBurnTypeReview: function(oEvent) {
			var radio = oEvent.getSource();
			var selectedText = radio.getText();
			var oModelBurnType = new JSONModel({
				BurnType: selectedText,

				isEditing: true // Initially, not in edit mode
			});
			this.getView().setModel(oModelBurnType, "oModelBurnType");
		},
		radioBurnDescription: function(oEvent) {
			// var oSelectedRadioButton = oEvent.getParameter("selectedButton");
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();

			var oModelBurnDescription = new sap.ui.model.json.JSONModel({
				BurnDescription: sSelectedText,
				isEditing: false // Initially, not in edit mode
			});

			this.getView().setModel(oModelBurnDescription, "oModelBurnDescription");

		},

		radioButtonSupply: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var oModelBurningDetails = this.getView().getModel("oModelBurningDetailsStep");

			oModelBurningDetails.setProperty("/materialOriginate", sSelectedText);
			// var oModelBurningDetails = new sap.ui.model.json.JSONModel({
			// 	MaterialOriginate: sSelectedText,
			// 	isEditing: false // Initially, not in edit mode
			// });

			// this.getView().setModel(oModelBurningDetails, "oModelBurningDetails");
		},

		onProposedSite: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var oModelBurningDetails = this.getView().getModel("oModelBurningDetailsStep");

			oModelBurningDetails.setProperty("/proposedBurn", sSelectedText);

		},

		radioButtonPNotified: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var oModelBurningDetails = this.getView().getModel("oModelBurningDetailsStep");

			oModelBurningDetails.setProperty("/adjPropertyNotified", sSelectedText);
		},

		onBurningPose: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var oModelBurningDetails = this.getView().getModel("oModelBurningDetailsStep");

			oModelBurningDetails.setProperty("/openBurning", sSelectedText);
		},

		rdoOpenBurning: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var oModelBurningDetails = new sap.ui.model.json.JSONModel({
				OpenBurning: sSelectedText,
				isEditing: false // Initially, not in edit mode
			});
			this.getView().setModel(oModelBurningDetails, "oModelBurningDetails");

		},

		oTypesRadio: function(oEvent) {
			var radio = oEvent.getSource();
			// oCheckBox.getSelected()
			var elementString = oEvent.getSource().toString();

			var parts = elementString.split("--");
			var radioId = parts[parts.length - 1];

			// var oTextArea = this.getView().byId("TextAreaOther");
			// var otxtSizeArea = this.getView().byId("txtSizeArea");
			// var oinputAreaSize = this.getView().byId("inputAreaSize");
			var selectedText = radio.getText();
			this.BurnType = selectedText;
			// var radioButton = radio.split("--");
			// var radioId = radioButton[radioButton.length - 1];
			if (radioId !== "other") {
				if (radioId === "rdoPrescribed") {
					// otxtSizeArea.setVisible(true)
					// oinputAreaSize.setVisible(true)

				} else {

					// otxtSizeArea.setVisible(false)
					// oinputAreaSize.setVisible(false)
				}
				// oTextArea.setVisible(false);

			}
			var oModelBurnType = new JSONModel({
				BurnType: selectedText,

				isEditing: false // Initially, not in edit mode
			});
			this.getView().setModel(oModelBurnType, "oModelBurnType");
		},

		onOther: function(oEvent) {
			var oCheckBox = oEvent.getSource();
			// var oTextArea = this.getView().byId("TextAreaOther");
			var otxtSizeArea = this.getView().byId("txtSizeArea");
			var oinputAreaSize = this.getView().byId("inputAreaSize");
			// console.log("msg");
			if (oCheckBox.getSelected()) {
				// oTextArea.setVisible(true);
				otxtSizeArea.setVisible(false);
				oinputAreaSize.setVisible(false);
			}
		},

		onThirdParty: function(oEvent) {
			var oComboBox = oEvent.getSource();
			var oSelectedItem = oComboBox.getSelectedItem();
			var selectedText = oSelectedItem.getText();

			var oViewThirdPartyDetails = this.getView();
			var oModelThirdPartyDetails = oViewThirdPartyDetails.getModel("oModelThirdPartyDetails");
			this.getView().byId("inputBusinessNumber").setValue("");
			oModelThirdPartyDetails.setProperty("/SearchBy", selectedText);
		},

		onWaterSource: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();

			var oTextAreaWaterSource = this.getView().byId("TextAreaWaterSource");
			if (sSelectedText === "Other") {
				oTextAreaWaterSource.setVisible(true);
			} else {
				oTextAreaWaterSource.setVisible(false);
			}

			var oModelFireSevice = this.getView().getModel("oModelFireService");
			oModelFireSevice.setProperty("/WaterSource", sSelectedText);
			// this.getView().setModel(oModelFireSevice, "oModelFireSevice");
		},
		onBurnLandOwnershipInfor: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();

			var oModelFireSevice = this.getView().getModel("oModelFireService");
			oModelFireSevice.setProperty("/NonResidential", sSelectedText);

		},

		onCombustibleMaterial: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();

			var oModelFireSevice = this.getView().getModel("oModelFireService");
			oModelFireSevice.setProperty("/CombustableMaterail", sSelectedText);
		},

		onSafeStack: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			this.getView().getModel("oModelFireService").setProperty("/SafeStack", sSelectedText);
		},
		onWaterSourceReview: function(oEvent) {
			var sSelectedText = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			// var selectedText = oSelectedItem.getText();

			var oModelFireSevice = this.getView().getModel("oModelFireService");
			oModelFireSevice.setProperty("/WaterSource", sSelectedText);
			oModelFireSevice.setProperty("/isEditing", true);
			// var oModelFireSevice = new JSONModel({
			// 	WaterSource: sSelectedText,

			// 	isEditing: true // Initially, not in edit mode
			// });
			// this.getView().setModel(oModelFireSevice, "oModelFireSevice");
		},

		onSubmit: function() {

			// if (sValid) {
			// 	// implement the submit logic here
			// 	MessageBox.show("Application has been  succesfully  submitted.");

			// 	// }	
			// } else {
			// 	MessageBox.error("Please fill in all required fields.");

			// 	// sap.m.MessageToast.show("Please fill in all required fields.");
			// }
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.wizard
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.wizard
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.wizard
		 */
		//	onExit: function() {
		//
		//	}

	});

});