sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageBox, MessageToast, BusyIndicator) {
	"use strict";

	return Controller.extend("capetown.gov.za_ZPN_OPEN_BURNING.controller.ApplicationDetails", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.view.ApplicationDetails
		 */
		onInit: function() {
			// this.selectedKey = "01";
			var oRegMember1 = this.getView().byId("RegMember1");
			oRegMember1.setSelectedIndex(-1);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.view.ApplicationDetails
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		onRadioButtonSelect: function(oEvent) {
			var selectedIndex = oEvent.getParameter("selectedIndex");
			// 
			var selectedValue = "";
			var oModelRegMember = this.getView().getModel("oModelRegMember");

			// Assigning keys based on index
			switch (selectedIndex) {
				case 0:
					this.selectedKey = "01";
					selectedValue = "01";
					break;
				case 1:
					this.selectedKey = "02";
					selectedValue = "02";
					break;
				case 2:
					this.selectedKey = "02";
					selectedValue = "03";
					break;

			}

			oModelRegMember.setProperty("/regMember", selectedValue);

		},

		onBurnType: function(oEvent) {
			var selectedIndex = oEvent.getParameter("selectedIndex");
			var oModelBurnType = this.getView().getModel("oModelBurnType");

			var selectedItem = oEvent.getSource().getSelectedItem();
			var selectedText = selectedItem.getText();

			oModelBurnType.setProperty("/BurntypeString", selectedText);
			oModelBurnType.setProperty("/BurnType", selectedIndex);

		},
		// },

		onBegin: function() {
			BusyIndicator.show(0);
			var cpfpaMember = "";

			if (this.selectedKey !== undefined) {
				cpfpaMember = this.selectedKey;
			}

			var selectedBurnTypeKey = this.getView().byId("cboATypeBurn").getSelectedKey();
			var selectedBurnAreaKey = this.getView().byId("cboBurnArea").getSelectedKey();
			var payload = {};
			payload.CaseType = 'ZE05';
			payload.ApplicationType = selectedBurnTypeKey;
			payload.CPFPA_MEMBER = cpfpaMember;
			payload.BURN_AREA_DESCRIPTION = selectedBurnAreaKey;
			var oCaseModel = this.getView().getModel("oCaseModel");
			var that = this;

			this.oDataModelfilts = this.getView().getModel();
			this.oDataModelfilts.create("/CaseHeaderSet", payload, {
				success: function(oData, oResponse) {

					oCaseModel.setProperty("/caseGuid", oData.CaseGuid);
					oCaseModel.setProperty("/caseID", oData.CaseId);

					oCaseModel.setProperty("/caseType", oData.CaseType);

					MessageToast.show("CASE ID: " + oData.CaseId + " was successfully created!");

					BusyIndicator.hide();
					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);

					oRouter.initialize();
					oRouter.navTo("wizard");

				},
				error: function(err, oResponse) {
					// busyIndicator.hide();
					BusyIndicator.hide();
					MessageBox.error(
						JSON.parse(err.response.body).error.message.value
					);

				}
			});
		},

		LoggedUser: function() {

			var oModel = this.getView().getModel();

			var sUrl = "/LoginPartySet";
			var that = this;
			oModel.read(sUrl, {
				success: function(oData, oResponse) {

					that._fullNameAppl = oData.results[0].NAME;
					that._addressAppl = oData.results[0].ADDRESS;
					that._idAppl = oData.results[0].ID_NUMBER;
					that._businessPartnerAppl = oData.results[0].PARTNER;
					that._emailAppl = oData.results[0].EMAILADDRESS;
					that._partnerBP = oData.results[0].PARTNER;
					that._telNoAppl = oData.results[0].WORKPHONENO;
					that._cellNoAppl = oData.results[0].CELLPHONENO;

				},
				error: function(oError) {
					// Handle the error response
					MessageBox.error("GET Request Failed:", oError);
				}
			});

		}

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.view.ApplicationDetails
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.view.ApplicationDetails
		 */
		//	onExit: function() {
		//
		//	}

	});

});