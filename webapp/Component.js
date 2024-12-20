sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"capetown/gov/za_ZPN_OPEN_BURNING/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("capetown.gov.za_ZPN_OPEN_BURNING.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			jQuery.sap.registerModulePath("zcase_util", "/sap/bc/ui5_ui5/sap/zcase_util");
			var oRootPath = jQuery.sap.getModulePath("capetown.gov.za_ZPN_OPEN_BURNING"); // your resource root

			var oImageModel = new sap.ui.model.json.JSONModel({
				path: oRootPath
			});
			var oModelDate = new sap.ui.model.json.JSONModel({
				doa: new Date() // Set the default date to the current date
			});

			// Set the model at the component level
			this.setModel(oModelDate, "Date");

			this.setModel(oImageModel, "imageModel");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createCaseModel(), "oCaseModel");
			this.setModel(models.createPropertySearch(), "oModelProperty");
			this.setModel(models.createBurnType(), "oBurnTypeModel");
			this.setModel(models.createBurnArea(), "oBurningAreaModel");
			this.setModel(models.createModelBurningDetails(), "oModelBurningDetails");
			this.setModel(models.createModelBurningDetailStep(), "oModelBurningDetailsStep");
			this.setModel(models.createModelPersonResponsible(), "oModelPersonResponsible");

			this.setModel(models.createRegisteredMember(), "oModelRegMember");

			this.setModel(models.createModelFireService(), "oModelFireService");
			this.setModel(models.createModelOwner(), "oModelOwner");

			this.setModel(models.createModelProxy(), "oModelProxy");

			this.setModel(models.createModelThirdPartyDetails(), "oModelThirdPartyDetails");
			this.setModel(models.createModelBurnType(), "oModelBurnType");
			this.setModel(models.createModelAllotment(), "oModelAllotment");

			this.setModel(models.createModelBurnDescription(), "oModelBurnDescription");

		}
	});
});