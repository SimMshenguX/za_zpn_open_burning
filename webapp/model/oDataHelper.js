sap.ui.define([],function(){
	return {
		callGETOData:function(oModel, sapPath, aFilters){
			return new Promise(function(resolve, reject){
		
					oModel.read(sapPath, {
						filters: aFilters,
						success: function(data, oResponse) {
							//positive response
							resolve(data);

						},
						error: function(oError, oResponse) {
							//Negative response
                           reject(oError);
						}
					});
			});
		}
	};
});