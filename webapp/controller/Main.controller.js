sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("capetown.gov.za_ZPN_OPEN_BURNING.controller.Main", {

		onInit: function () {

		},

		onRadioButtonSelect: function (oEvent) {
			var bVisible = oEvent.getParameters().selectedIndex === 0;
			this.getView().byId("proofLabel").setVisible(bVisible);
			// this.getView().byId("fileUploader").setVisible(bVisible);

			var tVisible = oEvent.getParameters().selectedIndex === 1;
			this.getView().byId("tarrifLabel").setVisible(tVisible);

			// var orgVisible = oEvent.getParameters().selectedIndex === 2;
			this.getView().byId("orgLabel").setVisible(false);
			this.getView().byId("orgItems").setVisible(false);
			var oRadioButton = this.byId("feeNotApplicable");
			oRadioButton.setSelected(false);
		},

		onFeeNotApplicableSelect: function () {

			var oRadioButtonGroup = this.byId("GroupC");
			var aRadioButtons = oRadioButtonGroup.getButtons();

			for (var i = 0; i < aRadioButtons.length; i++) {
				aRadioButtons[i].setSelected(false);
			}
			this.getView().byId("orgLabel").setVisible(true);
			this.getView().byId("orgItems").setVisible(true);
			this.getView().byId("tarrifLabel").setVisible(false);
				this.getView().byId("proofLabel").setVisible(false);
		
		},

			onViewAQM: function (oEvent) {

			var aData = oEvent.getParameter("data");


			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.initialize();
			oRouter.navTo("wizard", {});
			// }
		},

	});
});