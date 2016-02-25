describe('L.esri.DynamicMapLayerAdvanced', function () {


  var url = 'http://services.arcgis.com/mock/arcgis/rest/services/MockMapService/MapServer';
  
  it('should have a L.esri.dynamicMapLayerAdvanced alias', function(){
    expect(L.esri.dynamicMapLayerAdvanced({
      url: url
    })).to.be.instanceof(L.esri.DynamicMapLayerAdvanced);
  });

});