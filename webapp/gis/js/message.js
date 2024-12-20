var message = {
    fields: {
        SL_LAND_PRCL_KEY: null,
        PRTY_NMBR: null,
        ADR_NO: null,
        STR_NAME: null,
        OFC_SBRB_NAME: null,
        ALT_NAME: null,
        WARD_NAME: null,
        SUB_CNCL_NMBR: null,
        ELECTRICITY_REGION: null,
        XCOORDINATE: null,
        YCOORDINATE: null,
        LONGITUDE: null,
        LATITUDE: null,        
        GEOMETRY_JSON: null,
    },
    reset: function () {
        this.fields.SL_LAND_PRCL_KEY = null;
        this.fields.PRTY_NMBR = null;
        this.fields.ADR_NO = null;
        this.fields.STR_NAME = null;
        this.fields.OFC_SBRB_NAME = null;
        this.fields.ALT_NAME = null;
        this.fields.WARD_NAME = null;
        this.fields.SUB_CNCL_NMBR = null;
        this.fields.ELECTRICITY_REGION = null;
        this.fields.XCOORDINATE = null;
        this.fields.YCOORDINATE = null;
        this.fields.LONGITUDE = null;
        this.fields.LATITUDE = null;
        this.fields.GEOMETRY_JSON = null;
    },
    setElectricityRegion:function (elecRegion) {
      this.fields.ELECTRICITY_REGION = elecRegion;  
    },
    setGeometryJson: function (geometryJson) {
        this.fields.GEOMETRY_JSON = geometryJson;
    },
    setLandParcelKey: function (key) {
        this.fields.SL_LAND_PRCL_KEY = key;
    },
    setErf: function (erf) {
        this.fields.PRTY_NMBR = erf;
    },
    setAddressNo: function (addr) {
        this.fields.ADR_NO = addr;
    },
    setStreetName: function (street) {
        this.fields.STR_NAME = street;
    },
    setSuburb: function (sbrb) {
        this.fields.OFC_SBRB_NAME = sbrb;
    },
    setAllotment: function (alt) {
        this.fields.ALT_NAME = alt;
    },
    setWardNo: function (wrdNo) {
        this.fields.WARD_NAME = wrdNo;
    },
    setSubcouncilNo: function (subcNo) {
        this.fields.SUB_CNCL_NMBR = subcNo;
    },
    setXY: function (x, y) {
        this.fields.XCOORDINATE = x
        this.fields.YCOORDINATE = y;
    },
    setLonLat: function (lon, lat) {
        this.fields.LONGITUDE = lon
        this.fields.LATITUDE = lat;
    }
}