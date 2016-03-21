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
      url: url
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
});
