var config = {
    pushPortalUrlTrustedServers: false,
    portalUrl: "https://citymaps.capetown.gov.za/agsport",
    webmapID: "74f5e1129b0c48dca92d30c1046431bb",
    appUrls: {
        propertyServiceUrl: "https://citymaps.capetown.gov.za/agsext/rest/services/Search_Layers/SL_RGDB_PRTY/MapServer",
        geometryServiceUrl: "https://citymaps.capetown.gov.za/agsext/rest/services/Utilities/Geometry/GeometryServer"
    },
    caseConfigs: [
        {
            caseTypeCode: "ZE05",
            caseGISKeyFieldName: "SL_AIR_QLTY_OPEN_BRNG_CASE_KEY",
            caseTypeLabel: "EHM: Open Burning",
            drawingLayerLabel: "Open Burning Drawings",
            featureServices: [{
                label: "Open Burning Polygons",
                url: "https://isapqa.capetown.gov.za/agsint/rest/services/Edit_Layers/AQM_Open_Burning_polygons/MapServer",
                type: "polygon"
            }, {
                label: "Open Burning Points",
                url: "https://isapqa.capetown.gov.za/agsint/rest/services/Edit_Layers/AQM_Open_Burning_points/MapServer",
                type: "point"
            }],

            getGeometryTypes: function (applicationType) {
                var geometryTypes = []

                var polygonApplicationTypes = ["Prescribed", "Ecological", "Biodiversity", "Agriculture", "Agricultural", "Other"];
                var pointApplicationTypes = ["Training", "Stack", "Other"]

                var isPolygonType = false;
                polygonApplicationTypes.forEach(function (type) {
                    if (applicationType.indexOf(type) > -1)
                        isPolygonType = true;
                })

                var isPointType = false;
                pointApplicationTypes.forEach(function (type) {
                    if (applicationType.indexOf(type) > -1)
                        isPointType = true;
                })

                if (isPolygonType) {
                    geometryTypes.push("polygon")
                }

                if (isPointType) {
                    geometryTypes.push("point")
                }

                return geometryTypes;
            },
            featureLayers: [],
            featureAddFields: [{
                gisField: "SL_AIR_QLTY_OPEN_BRNG_CASE_KEY",
                caseField: "EXT_KEY",
                isNumber: true
            }, {
                gisField: "BURN_AREA",
                caseField: "BURN_AREA_EXTENT",
                isNumber: true
            }, {
                gisField: "BURN_PRD",
                caseField: "BURN_PERIOD",
                isNumber: false
            }, {
                gisField: "FILE_NMBR",
                caseField: "FILE_REFERENCE_NO",
                isNumber: false
            }],
            fieldInfos: [
                {
                    fieldName: "SL_AIR_QLTY_OPEN_BRNG_CASE_KEY", label: "Case ID"
                },
                {
                    fieldName: "SL_LAND_PRCL_KEY", label: "Land Parcel Key"
                },
                {
                    fieldName: "SG26_CODE", label: "SG26 Code"
                },
                {
                    fieldName: "ERF_NMBR", label: "Erf"
                },
                {
                    fieldName: "ALT_NAME", label: "Allotment Name"
                },
                {
                    fieldName: "APLC_TYPE", label: "Application Type"
                },
                {
                    fieldName: "APLC_STS", label: "Application Status"
                },
                {
                    fieldName: "BURN_AREA", label: "Burn Area (m²)"
                },
                {
                    fieldName: "expression/PRMT_ISD_DATE"
                },
                {
                    fieldName: "expression/PRMT_VLD_TO_DATE"
                },
                {
                    fieldName: "BURN_PRD", label: "Burn Period"
                },
                {
                    fieldName: "FILE_NMBR", label: "File Number"
                }
            ],
            expressionInfos: [
                {
                    name: "PRMT_ISD_DATE",
                    title: "Permit Issue Date",
                    expression: `
                var dateString = ""
                var d = $feature.PRMT_ISD_DATE
                if(d != null)
                    dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
                return dateString`
                },
                {
                    name: "PRMT_VLD_TO_DATE",
                    title: "Permit Valid To Date",
                    expression: `
                var dateString = ""
                var d = $feature.PRMT_VLD_TO_DATE
                if(d != null)
                    dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
                return dateString`
                }
            ]
        },
        {
            caseTypeCode: "ZE04",
            caseGISKeyFieldName: "SL_AIR_QLTY_FUEL_BRNG_CASE_KEY",
            caseTypeLabel: "EHM: Fuel Burning",
            drawingLayerLabel: "Fuel Burning Drawings",
            featureServices: [{
                label: "Fuel Burning Points",
                url: "https://isapdev.capetown.gov.za/agsint/rest/services/Edit_Layers/AQM_Fuel_Burning_Equipment/FeatureServer",
                type: "points"
            }],
            getGeometryTypes: function (applicationType) {
                var geometryTypes = [];

                geometryTypes.push("point")

                return geometryTypes;
            },
            featureLayers: [],
            featureAddFields: [{
                gisField: "SL_AIR_QLTY_FUEL_BRNG_CASE_KEY",
                caseField: "EXT_KEY",
                isNumber: true
            }, {
                gisField: "LGL_STS",
                caseField: "LEGAL_STATUS",
                isNumber: false
            }, {
                gisField: "FUEL_TYPE",
                caseField: "FUEL_TYPE",
                isNumber: false
            }, {
                gisField: "EQMT_TYPE",
                caseField: "EQUIPMENT_TYPE",
                isNumber: false
            }, {
                gisField: "BLDN_NAME",
                caseField: "BUILDING_NAME",
                isNumber: false
            }, {
                gisField: "CMPN",
                caseField: "COMPANY",
                isNumber: false
            }, {
                gisField: "CMPN_ADRS",
                caseField: "COMPANY_ADDRESS",
                isNumber: false
            }, {
                gisField: "CNTC_PRSN",
                caseField: "CONTACT",
                isNumber: false
            }, {
                gisField: "FILE_NMBR",
                caseField: "FILE_REFERENCE_NO",
                isNumber: false
            }],
            fieldInfos: [/*
            {
                fieldName: "SL_AIR_QLTY_FUEL_BRNG_CASE_KEY", label: "Case ID"
            },
            {
                fieldName: "SL_LAND_PRCL_KEY", label: "Land Parcel Key"
            },*/
                {
                    fieldName: "SG26_CODE", label: "SG26 Code"
                },
                {
                    fieldName: "ERF_NMBR", label: "Erf"
                },
                {
                    fieldName: "ALT_NAME", label: "Allotment Name"
                },
                {
                    fieldName: "APLC_TYPE", label: "Application Type"
                },
                {
                    fieldName: "APLC_STS", label: "Application Status"
                },
                {
                    fieldName: "expression/CHNG_ON_DATE"
                },
                {
                    fieldName: "LGL_STS", label: "Legal Status"
                },
                {
                    fieldName: "FUEL_TYPE", label: "Fuel Type"
                },
                {
                    fieldName: "EQMT_TYPE", label: "Equipment Type"
                },
                {
                    fieldName: "BLDN_NAME", label: "Building Name"
                },
                {
                    fieldName: "CMPN", label: "Company"
                },
                {
                    fieldName: "CMPN_ADRS", label: "Company Address"
                },
                {
                    fieldName: "CNTC_PRSN", label: "Contact Person"
                },
                {
                    fieldName: "FILE_NMBR", label: "File Number"
                }
            ],
            expressionInfos: [{
                name: "CHNG_ON_DATE",
                title: "Change On Date",
                expression:
                    `var dateString = ""
             var d = $feature.CHNG_ON_DATE
             if(d != null)
                 dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
             return dateString`
            }]
        }, {
            caseTypeCode: "ZE01",
            caseGISKeyFieldName: "SL_ENVH_FOOD_PRMS_CASE_KEY",
            caseTypeLabel: "EHM: Certificate of Acceptability",
            drawingLayerLabel: "COA Drawings",
            featureServices: [{
                label: "Certificate of Acceptability",
                url: "https://isapdev.capetown.gov.za/agsint/rest/services/Edit_Layers/ENVH_Food_Premise_Case/FeatureServer",
                type: "points"
            }],
            getGeometryTypes: function (applicationType) {
                var geometryTypes = [];
                geometryTypes.push("point")
                return geometryTypes;
            },
            featureLayers: [],
            featureAddFields: [{
                gisField: "SL_ENVH_FOOD_PRMS_CASE_KEY",
                caseField: "EXT_KEY",
                isNumber: true
            }, {
                gisField: "PRTY_NMBR",
                caseField: "ERFNO",
                isNumber: false
            }, {
                gisField: "HLTH_DSTR",
                caseField: "HEALTH_DISTRICT",
                isNumber: false
            }, {
                gisField: "BSNS_ENT",
                caseField: "BUSINESS_ENTITY",
                isNumber: false
            }, {
                gisField: "PRMS_TYPE",
                caseField: "PREMISE_TYPE",
                isNumber: false
            }, {
                gisField: "ADR",
                caseField: "ADDRESS",
                isNumber: false
            }, {
                gisField: "COA_NMBR",
                caseField: "COA_NUMBER",
                isNumber: false
            }, {
                gisField: "PRSN_CHRG_BP",
                caseField: "PERSON_IN_CHARGE_BP",
                isNumber: false
            }, {
                gisField: "BSN_LCN",
                caseField: "BUSINESS LICENCE",
                isNumber: false
            }, {
                gisField: "PRMS_CTGR",
                caseField: "PREMISE_CATEGORY",
                isNumber: false
            }, {
                gisField: "RISK_RTNG_COA",
                caseField: "RISK_RATING",
                isNumber: false
            }, {
                gisField: "INSP_OTCM_COA",
                caseField: "INSP_OUTCOME",
                isNumber: false
            }, {
                gisField: "APLC_EXMT",
                caseField: "APP_EXEMPTION",
                isNumber: false
            }, {
                gisField: "RSTC_CNDT",
                caseField: "RESTRICT_CONDITIONS",
                isNumber: false
            }],
            fieldInfos: [
                {
                    fieldName: "SL_ENVH_FOOD_PRMS_CASE_KEY", label: "Case ID"
                },
                {
                    fieldName: "SL_LAND_PRCL_KEY", label: "Land Parcel Key"
                },
                {
                    fieldName: "PRTY_NMBR", label: "Erf"
                },
                {
                    fieldName: "HLTH_DSTR", label: "Health District"
                },
                {
                    fieldName: "BSNS_ENT", label: "Business Entity"
                },
                {
                    fieldName: "PRMS_TYPE", label: "Premises Type"
                },
                {
                    fieldName: "PRMS_CTGR", label: "Premises Category"
                },
                {
                    fieldName: "ADR", label: "Address"
                },
                {
                    fieldName: "COA_NMBR", label: "COA Number"
                },
                {
                    fieldName: "PRSN_CHRG_BP", label: "Person in Charge BP"
                },
                {
                    fieldName: "BSN_LCN", label: "Business Licence"
                },
                {
                    fieldName: "RISK_RTNG_COA", label: "Risk Rating COA"
                },
                {
                    fieldName: "RISK_RTNG_INSP", label: "Risk Rating Inspection"
                },
                {
                    fieldName: "RISK_RTNG_SMPL", label: "Risk Rating Sampling"
                },
                {
                    fieldName: "INSP_OTCM_COA", label: "Inspection Outcome: COA"
                },
                {
                    fieldName: "INSP_OTCM_INSP", label: "Inspection Outcome: Inspection"
                },
                {
                    fieldName: "INSP_OTCM_SMPL", label: "Inspection Outcome: Sampling"
                },
                {
                    fieldName: "APLC_EXMT", label: "Application Exemption"
                },
                {
                    fieldName: "RSTC_CNDT", label: "Restriction Conditions"
                },
                {
                    fieldName: "CASE_STS", label: "Case Status"
                },
                {
                    fieldName: "INSP_RSN", label: "Inspection Reason"
                },
                {
                    fieldName: "SMPL_PRCS", label: "Sampling Process"
                },
                {
                    fieldName: "PRDT_ADR", label: "Product Address"
                },
                {
                    fieldName: "CNSG_NAME", label: "Consignor Name"
                },
                {
                    fieldName: "expression/NTC_ISD_DATE_SMPL"
                },
                {
                    fieldName: "expression/NTC_ISD_DATE_INSP"
                },
                {
                    fieldName: "expression/FINE_SMNS_DATE_INSP"
                },
                {
                    fieldName: "expression/FINE_SMNS_DATE_SMPL"
                },
                {
                    fieldName: "expression/LAST_INSP_DATE"
                },
                {
                    fieldName: "expression/LAST_SMPL_DATE"
                }
            ],
            expressionInfos: [{
                name: "NTC_ISD_DATE_SMPL",
                title: "Notice Issued Date Sampling",
                expression:
                    `var dateString = ""
             var d = $feature.NTC_ISD_DATE_SMPL
             if(d != null)
                 dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
             return dateString`
            }, {
                name: "NTC_ISD_DATE_INSP",
                title: "Notice Issued Date Inspection",
                expression:
                    `var dateString = ""
             var d = $feature.NTC_ISD_DATE_INSP
             if(d != null)
                 dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
             return dateString`
            }, {
                name: "FINE_SMNS_DATE_INSP",
                title: "Fine Summons Issued Date Inspection",
                expression:
                    `var dateString = ""
             var d = $feature.FINE_SMNS_DATE_INSP
             if(d != null)
                 dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
             return dateString`
            }, {
                name: "FINE_SMNS_DATE_SMPL",
                title: "Fine Summons Issued Date Sampling",
                expression:
                    `var dateString = ""
             var d = $feature.FINE_SMNS_DATE_SMPL
             if(d != null)
                 dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
             return dateString`
            }, {
                name: "LAST_INSP_DATE",
                title: "Last Inspection Date",
                expression:
                    `var dateString = ""
             var d = $feature.LAST_INSP_DATE
             if(d != null)
                 dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
             return dateString`
            }, {
                name: "LAST_SMPL_DATE",
                title: "Last Sampling Date",
                expression:
                    `var dateString = ""
             var d = $feature.LAST_SMPL_DATE
             if(d != null)
                 dateString = Year(Date(d)) + "/" + (Month(Date(d)) + 1) + "/" + Day(Date(d))
             return dateString`
            }]
        }
    ]
}