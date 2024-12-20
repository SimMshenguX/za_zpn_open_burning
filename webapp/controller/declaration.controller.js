sap.ui.define([
    "capetown/gov/za_ZPN_OPEN_BURNING/controller/BaseController",
	"sap/f/library",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library"
], function(BaseController, fioriLibrary, Panel, Text, MessageBox, Dialog, Button, mobileLibrary) {
	"use strict";

	// var DynamicPageTitleArea = fioriLibrary.DynamicPageTitleArea;

	return BaseController.extend("capetown.gov.za_ZPN_OPEN_BURNING.controller.declaration", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.declaration
		 */

		// toggleVisibility: function () {
		// 	this._Page.setShowFooter(!this._Page.getShowFooter());
		// },
		// toggleFooter: function () {
		// 	this._Page.setFloatingFooter(!this._Page.getFloatingFooter());
		// },

		onInit: function() {

			var oCaseModel = this.getOwnerComponent().getModel("oCaseModel");
			this.CaseGuid = oCaseModel.getProperty("/caseGuid");
			this.CaseId = oCaseModel.getProperty("/caseID");

			this.oUTILModel = this._getUTILModel("NONE");
		},
		onPrevious: function() {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.initialize();
			oRouter.navTo("wizard", {});
		},

		onConfirmDeclaration: function(oEvent) {
			var bCheckBox = oEvent.getSource();
			var obtnSubmit = this.getView().byId("btnSubmit");
			obtnSubmit.setEnabled(bCheckBox.getSelected());
		},

		onSubmit: function() {

			var requestData = {
				CaseGuid: this.CaseGuid
			};
			var caseID = this.CaseId;
			var oModel = this.getView().getModel();
			var that = this;
			oModel.create("/CaseStatusSet", requestData, {
				success: function(data) {
					let gisPolygon = JSON.parse(sessionStorage.getItem("featuresToPass"));
					this._savePolygonData(this.oUTILModel, gisPolygon,this.getView().getModel("oCaseModel").getProperty("/caseID"));
					// if (data.ConfirmInfoOK) {
						that.onShowMessage(caseID);

					// }
					// else {
					// 	MessageBox.error("Case: " + caseID + "  failed to submit.");
					// }

					// Handle success response here
				}.bind(this),
				error: function(error) {
					sap.m.MessageToast.error("Error in updating Case", error);
					// Handle error response here
				}
			});
		},

		onShowMessage: function(caseId) {

			// shortcut for sap.m.ButtonType
			var ButtonType = mobileLibrary.ButtonType;

			// shortcut for sap.m.DialogType
			var DialogType = mobileLibrary.DialogType;

			if (!this.oDefaultMessageDialog) {
				this.oDefaultMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Success Message",
					content: new Text({
						text: "Case: " + caseId + "  Successfully submitted."
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function() {
							this.oDefaultMessageDialog.close();

							var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
							var sDashboardURL = oResourceBundle.getText("dashboardURL");

							window.open(sDashboardURL, "_blank");
							window.close();
							this.getView().destroy();
						}.bind(this)
					})
				});
			}

			this.oDefaultMessageDialog.open();

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.declaration
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.declaration
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf capetown.gov.za_ZPN_OPEN_BURNING.view.declaration
		 */
		//	onExit: function() {
		//
		//	}

	});

});