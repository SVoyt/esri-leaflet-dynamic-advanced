describe('L.esri.DynamicMapLayerAdvanced', function() {
  this.timeout(15000);

  function createMap() {
    var container = document.createElement('div');
    container.setAttribute('style', 'width: 500px; height: 500px;');
    document.body.appendChild(container);
    return L.map(container).setView([0, 180], 2);
  }

  var url = 'http://services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer';
  var layer;
  var map;

  beforeEach(function() {
    layer = L.esri.dynamicMapLayerAdvanced({
      url: url,
      f:'image'
    });
    map = createMap();
  });

  afterEach(function() {
    map.remove();
  });


  it('should have a L.esri.dynamicMapLayerAdvanced alias', function() {
    expect(L.esri.dynamicMapLayerAdvanced({
      url: url
    })).to.be.instanceof(L.esri.DynamicMapLayerAdvanced);
  });

  it('should request two proper bounds', function() {

    var southWest1 = L.latLng(-65.65827451982662, 92.10937500000001),
        northEast1 = L.latLng(65.6582745198266, 180),
        bounds1 = L.latLngBounds(southWest1, northEast1);

    var southWest2 = L.latLng(-65.65827451982662, -180),
        northEast2 = L.latLng(65.6582745198266, -92.10937499999994),
        bounds2 = L.latLngBounds(southWest2, northEast2);


    layer.addTo(map);
    var paramsArray = layer._buildExportParams();

    //need to deep.closeTo :(

    expect(paramsArray[0].bounds._southWest.lat).to.closeTo(bounds1._southWest.lat, 0.00001);
    expect(paramsArray[0].bounds._southWest.lng).to.closeTo(bounds1._southWest.lng, 0.00001);
    expect(paramsArray[0].bounds._northEast.lat).to.closeTo(bounds1._northEast.lat, 0.00001);
    expect(paramsArray[0].bounds._northEast.lng).to.closeTo(bounds1._northEast.lng, 0.00001);

    expect(paramsArray[1].bounds._southWest.lat).to.closeTo(bounds2._southWest.lat, 0.00001);
    expect(paramsArray[1].bounds._southWest.lng).to.closeTo(bounds2._southWest.lng, 0.00001);
    expect(paramsArray[1].bounds._northEast.lat).to.closeTo(bounds2._northEast.lat, 0.00001);
    expect(paramsArray[1].bounds._northEast.lng).to.closeTo(bounds2._northEast.lng, 0.00001);

  });


});
