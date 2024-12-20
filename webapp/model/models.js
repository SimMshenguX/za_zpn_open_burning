sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createPropertySearch: function() {
			return new JSONModel({
				searchProperty: [
					//  {
					// 	id: "1",
					// 	text: "My Property(s)"
					// }, {
					// 	id: "2",
					// 	text: "My Favourites"
					// },
					{
						id: "3",
						text: "ERF Number"
					}, {
						id: "4",
						text: "Parcel Number"
					}, {
						id: "5",
						text: "GIS Map"
					}, {
						id: "6",
						text: "Private Address"

					}, {
						id: "7",
						text: "Street Address"

					}
				],
				selectedProperty: null
			});
		},
		createCaseModel: function() {
			return new JSONModel({
				caseGuid: "",
				caseID: "",
				caseType: ""
			});
		},

		createRegisteredMember: function() {
			return new JSONModel({
				regMember: ""

			});
		},

		createModelBurningDetails: function() {
			return new JSONModel({
				SquareMeterage: "",
				FullDescription: "",
				MaterialOriginate: "",
				AltInvest: "",
				OpenBurning: "",
				InvestigReducing: "",
				isEditing: false // Initially, not in edit mode
			});
		},

		createModelBurningDetailStep: function() {
			return new JSONModel({
				squareMeterage: "",
				fullDescription: "",
				location: "",
				materialOriginate: "",
				estimatedCost: "",
				timePeriod: "",
				alternativeInvestigation: "",
				investigationReducing: "",
				proposedBurn: "",
				openBurning: "",
				listExpand: "",
				adjPropertyNotified:"",
				isEditing: false // Initially, not in edit mode
			});
		},
		createBurnType: function() {
			return new JSONModel({
				searchBurnType: [{
					id: "01",
					text: "Prescribed / Ecological / Biodiversity"
				}, {
					id: "02",
					text: "Stack & Fuel Reduction"
				}, {
					id: "03",
					text: "Agricultural"
				}, {
					id: "04",
					text: "Training"
				}, {
					id: "05",
					text: "Other"
				}],
				selectedProperty: null
			});
		},

		createBurnArea: function() {
			return new JSONModel({
				searchBurn: [{
					id: "01",
					text: "Farm"
				}, {
					id: "02",
					text: "Industrial Property"
				}, {
					id: "03",
					text: "Nature Conservation Area"
				}, {
					id: "04",
					text: "Commercial Property"
				}, {
					id: "05",
					text: "Small Holding"
				}, {
					id: "06",
					text: "Other"
				}],
				selectedProperty: null
			});
		},

		createModelFireService: function() {
			return new JSONModel({
				WaterSource: "",
				BurnLandOwnershipInfor:"",
				FireMeasures: "",
				NonResidential: "",
				SafeMaterial: "",
				SafeStack: "",
				CombustableMaterail: "",
				AltInvest: "",
				OpenBurning: "",
				InvestigReducing: "",
				UtilisedFireFighting: "",

				Other: "",
				isEditing: false
			});
		},

		createModelOwner: function() {
			return new JSONModel({
				OwnerName: "",
				Address: "",
				Cellphone: "",
				Telephone: "",
				Email: "",
				OwnerPremises: "",
				AlternateCell: "",
				AlternateEmail: "",
				isEditing: false // Initially, not in edit mode
			});
		},

		createModelProxy: function() {
			return new JSONModel({
				OwnerName: "",
				Address: "",
				Cellphone: "",
				Telephone: "",
				Email: "",
				OwnerPremises: "",
				AlternateCell: "",
				AlternateEmail: "",
				isEditing: false // Initially, not in edit mode
			});
		},

		createModelPersonResponsible: function() {
			return new JSONModel({
				Name: "",
				Address: "",
				Cellphone: "",
				Telephone: "",
				Email: "",
				OwnerPremises: "",
				AlternateCell: "",
				AlternateEmail: "",
				isEditing: false // Initially, not in edit mode
			});
		},

		createModelBurnType: function() {
			return new JSONModel({
				BurnType: "",
				BurntypeString: "",
				isEditing: false // Initially, not in edit mode
			});
		},

		createModelThirdPartyDetails: function() {
			return new JSONModel({
				SearchBy: "Business Partner"
			});
		},

		createModelAllotment: function() {
			return new JSONModel({
				searchAllotment: [{
					id: '1',
					text: 'ABBOTSDALE'
				}, {
					id: '2',
					text: 'ATLANTIC HILL'
				}, {
					id: '3',
					text: 'ATLANTIS INDUSTRIAL'
				}, {
					id: '4',
					text: 'BAINSKLOOF PASS'
				}, {
					id: '5',
					text: 'BAKKERSHOOGTE'
				}],
				selectedAllotment: null
			});
		},
		createModelBurnDescription: function() {
			return new JSONModel({
				BurnDescription: "",
				isEditing: false // Initially, not in edit mode
			});
		}

	};
});