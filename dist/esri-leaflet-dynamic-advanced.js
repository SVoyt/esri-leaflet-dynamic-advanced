L.esri.DynamicMapLayerAdvanced = L.Layer.extend({
  options: {
    opacity: 1,
    position: 'front',
    useCors: L.esri.Support.cors,
    attribution: null,
    interactive: false,
    alt: '',
    updateInterval: 150,
    layers: false,
    layerDefs: false,
    timeOptions: false,
    format: 'png24',
    transparent: true,
    f: 'json'
  },

  initialize: function (options) {
    options.url = L.esri.Util.cleanUrl(options.url);
    this.service = L.esri.mapService(options);
    this.service.addEventParent(this);

    if ((options.proxy || options.token) && options.f !== 'json') {
      options.f = 'json';
    }
    L.Util.setOptions(this, options);

    this._update = L.Util.throttle(this._update, this.options.updateInterval, this);
  },

  onAdd: function (map) {
    map.on('moveend', this._update, this);

    if ((!this._singleImages) || (this._singleImages.length === 0)) {
      this._update();
    } else {
      this._forAllSingleImages(
        function (img) {
          this._resetImagePosition(img);
          this.getPane(this.options.pane).appendChild(img);
        }
      );
    }

    if (this._popup) {
      this._map.on('click', this._getPopupData, this);
      this._map.on('dblclick', this._resetPopupState, this);
    }
  },

  onRemove: function () {
    this._forAllSingleImages(
      function (img) {
        if (this.options.interactive) {
          this.removeInteractiveTarget(img);
        }
        this.getPane(this.options.pane).removeChild(img);
      }
    );
    if (this._popup) {
      this._map.off('click', this._getPopupData, this);
      this._map.off('dblclick', this._resetPopupState, this);
    }

    this._map.off('moveend', this._update, this);
  },

  getEvents: function () {
    var events = {
      zoom: this._reset,
      viewreset: this._reset
    };

    if (this._zoomAnimated) {
      events.zoomanim = this._animateZoom;
    }

    return events;
  },

  _animateZoom: function (e) {
    this._forAllSingleImages(
      function (img) {
        var scale = this._map.getZoomScale(e.zoom);
        var offset = this._map._latLngToNewLayerPoint(img.position.getNorthWest(), e.zoom, e.center);
        L.DomUtil.setTransform(img, offset, scale);
      }
    );
  },

  _reset: function () {
    this._forAllSingleImages(
      function (img) {
        this._resetImagePosition(img);
      }
    );
  },

  getDynamicLayers: function () {
    return this.options.dynamicLayers;
  },

  setDynamicLayers: function (dynamicLayers) {
    this.options.dynamicLayers = dynamicLayers;
    this._update();
    return this;
  },

  getLayers: function () {
    return this.options.layers;
  },

  setLayers: function (layers) {
    this.options.layers = layers;
    this._update();
    return this;
  },

  getLayerDefs: function () {
    return this.options.layerDefs;
  },

  setLayerDefs: function (layerDefs) {
    this.options.layerDefs = layerDefs;
    this._update();
    return this;
  },

  getTimeOptions: function () {
    return this.options.timeOptions;
  },

  setTimeOptions: function (timeOptions) {
    this.options.timeOptions = timeOptions;
    this._update();
    return this;
  },

  query: function () {
    return this.service.query();
  },

  identify: function () {
    return this.service.identify();
  },

  find: function () {
    return this.service.find();
  },

  bringToFront: function () {
    this.options.position = 'front';
    this._forAllSingleImages(
      function (img) {
        L.DomUtil.toFront(img);
      }
    );
    return this;
  },

  bringToBack: function () {
    this.options.position = 'back';
    this._forAllSingleImages(
      function (img) {
        L.DomUtil.toBack(img);
      }
    );
    return this;
  },

  setZIndex: function (zIndex) {
    this.options.zIndex = zIndex;
    this._forAllSingleImages(
      function (img) {
        img.style.zIndex = zIndex;
      }
    );
  },

  getAttribution: function () {
    return this.options.attribution;
  },

  getOpacity: function () {
    return this.options.opacity;
  },

  setOpacity: function (opacity) {
    this.options.opacity = opacity;
    this._forAllSingleImages(
      function (img) {
        L.DomUtil.setOpacity(img, this.options.opacity);
      }
    );
    return this;
  },

  getTimeRange: function () {
    return [this.options.from, this.options.to];
  },

  setTimeRange: function (from, to) {
    this.options.from = from;
    this.options.to = to;
    this._update();
    return this;
  },

  metadata: function (callback, context) {
    this.service.metadata(callback, context);
    return this;
  },

  authenticate: function (token) {
    this.service.authenticate(token);
    return this;
  },

  _getPopupData: function (e) {
    var callback = L.Util.bind(function (error, featureCollection, response) {
      if (error) { return; } // we really can't do anything here but authenticate or requesterror will fire
      setTimeout(L.Util.bind(function () {
        this._renderPopup(e.latlng, error, featureCollection, response);
      }, this), 300);
    }, this);

    var identifyRequest = this.identify().on(this._map).at(e.latlng);

    if (this.options.layers) {
      identifyRequest.layers('visible:' + this.options.layers.join(','));
    } else {
      identifyRequest.layers('visible');
    }

    identifyRequest.run(callback);

    // set the flags to show the popup
    this._shouldRenderPopup = true;
    this._lastClick = e.latlng;
  },

  _renderPopup: function (latlng, error, results, response) {
    latlng = L.latLng(latlng);
    if (this._shouldRenderPopup && this._lastClick.equals(latlng)) {
      // add the popup to the map where the mouse was clicked at
      var content = this._popupFunction(error, results, response);
      if (content) {
        this._popup.setLatLng(latlng).setContent(content).openOn(this._map);
      }
    }
  },

  bindPopup: function (fn, popupOptions) {
    this._shouldRenderPopup = false;
    this._lastClick = false;
    this._popup = L.popup(popupOptions);
    this._popupFunction = fn;
    if (this._map) {
      this._map.on('click', this._getPopupData, this);
      this._map.on('dblclick', this._resetPopupState, this);
    }
    return this;
  },

  unbindPopup: function () {
    if (this._map) {
      this._map.closePopup(this._popup);
      this._map.off('click', this._getPopupData, this);
      this._map.off('dblclick', this._resetPopupState, this);
    }
    this._popup = false;
    return this;
  },

  _resetPopupState: function (e) {
    this._shouldRenderPopup = false;
    this._lastClick = e.latlng;
  },

  _initImage: function () {
    var img = L.DomUtil.create('img', 'leaflet-image-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));
    img.onselectstart = L.Util.falseFn;
    img.onmousemove = L.Util.falseFn;

    if (this.options.zIndex) {
      img.style.zIndex = this.options.zIndex;
    }

    img.alt = this.options.alt;

    if (this.options.opacity < 1) {
      L.DomUtil.setOpacity(img, this.options.opacity);
    }

    if (this.options.useCors) {
      img.crossOrigin = '';
    }

    return img;
  },

  _imageLoaded: function (params) {
    if (params.requestCount !== this._requestCounter.count) {
      delete params.image;
      return;
    }

    var image = this._resetImagePosition(params.image);

    var imagesToRemove = [];

    this._forAllSingleImages(
      function (img) {
        if (img.position.overlaps(image.position)) {
          imagesToRemove.push(img);
        }
      }
    );

    this.getPane(this.options.pane).appendChild(image);
    if (this.options.interactive) {
      L.DomUtil.addClass(image, 'leaflet-interactive');
      this.addInteractiveTarget(image);
    }

    this._singleImages.push(image);

    this._requestCounter.loadedImages++;

    if (this._requestCounter.allImages === this._requestCounter.loadedImages) {
      var bounds = this._map.getBounds();
      this.fire('load', {
        bounds: bounds
      });

      this._forAllSingleImages(
        function (img) {
          if (!img.position.overlaps(bounds)) {
            imagesToRemove.push(img);
          }
        }
      );
    }

    // removing useless images
    for (var i = 0; i < imagesToRemove.length; i++) {
      this._removeImage(imagesToRemove[i]);
      var index = this._singleImages.indexOf(imagesToRemove[i]);
      if (index !== -1) {
        this._singleImages.splice(index, 1);
      }
    }
  },

  _resetImagePosition: function (image) {
    var bounds = new L.Bounds(
      this._map.latLngToLayerPoint(image.position.getNorthWest()),
      this._map.latLngToLayerPoint(image.position.getSouthEast()));
    var size = bounds.getSize();

    L.DomUtil.setPosition(image, bounds.min);

    image.style.width = size.x + 'px';
    image.style.height = size.y + 'px';

    return image;
  },

  _incrementRequestCounter: function (imagesCount) {
    if (!this._requestCounter) {
      this._requestCounter = {
        count: 1
      };
    } else {
      this._requestCounter.count++;
    }

    this._requestCounter.allImages = imagesCount;
    this._requestCounter.loadedImages = 0;
  },

  _update: function () {
    if (!this._map) {
      return;
    }

    var zoom = this._map.getZoom();

    if (this._animatingZoom) {
      return;
    }

    if (this._map._panTransition && this._map._panTransition._inProgress) {
      return;
    }

    if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
      return;
    }

    var params = this._buildExportParams();

    this._requestExport(params);
  },

  _requestExport: function (params) {
    if (!this._singleImages) {
      this._singleImages = [];
    }

    this._incrementRequestCounter(params.length);
    this.fire('loading', {
      bounds: this._map.getBounds()
    });

    for (var i = 0; i < params.length; i++) {
      var singleParam = params[i];
      singleParam.requestCount = this._requestCounter.count;
      if (this.options.f === 'json') {
        this.service.request('export', singleParam.params, function (error, response) {
          if (error) { return; } // we really can't do anything here but authenticate or requesterror will fire
          this.param.href = response.href;
          this.context._renderImage(this.param);
        }, { context: this, param: singleParam });
      } else {
        singleParam.params.f = 'image';
        singleParam.href = this.options.url + 'export' + L.Util.getParamString(singleParam.params);
        this._renderImage(singleParam);
      }
    }
  },

  _renderImage: function (params) {
    var img = this._initImage();
    img.position = params.position;
    img.onload = L.bind(this._imageLoaded, this, { image: img, mapParams: params, requestCount: params.requestCount });
    img.src = params.href;
  },

  _buildExportParams: function () {
    var singleMapParamsArray = [];

    var wholeBounds = this._map.getBounds();
    var wholeSize = this._map.getSize();

    var min = wholeBounds.getSouthWest();
    var max = wholeBounds.getNorthEast();

    var newXmax = min.lng;
    var newXmin = min.lng;
    var i = 0;

    var d = (newXmin + 180) / 360;
    var sign = Math.sign(d);
    sign = (sign === 0) ? 1 : sign;
    var coef = sign * Math.floor(Math.abs(d));

    while (newXmax < max.lng) {
      newXmax = 360 * (coef + i) + sign * 180;

      if (newXmax > max.lng) {
        newXmax = max.lng;
      }

      var normXMin = newXmin;
      var normXMax = newXmax;

      if ((newXmin < -180) | (newXmax > 180)) {
        var d2 = Math.floor((newXmin + 180) / 360);
        normXMin -= d2 * 360;
        normXMax -= d2 * 360;
      }

      var singleBounds = L.latLngBounds(L.latLng(min.lat, normXMin), L.latLng(max.lat, normXMax));
      var positionBounds = L.latLngBounds(L.latLng(min.lat, newXmin), L.latLng(max.lat, newXmax));
      var width = (wholeSize.x * ((newXmax - newXmin) / (max.lng - min.lng)));
      var singleSize = { x: width, y: wholeSize.y };
      var singleExportParams = this._buildSingleExportParams(singleBounds, singleSize);

      singleMapParamsArray.push({ position: positionBounds, bounds: singleBounds, size: singleSize, params: singleExportParams });
      newXmin = newXmax;
      i++;
    }

    return singleMapParamsArray;
  },

  _buildSingleExportParams: function (bounds, size) {
    var ne = this._map.options.crs.project(bounds.getNorthEast());
    var sw = this._map.options.crs.project(bounds.getSouthWest());
    var sr = parseInt(this._map.options.crs.code.split(':')[1], 10);

    // ensure that we don't ask ArcGIS Server for a taller image than we have actual map displaying
    var top = this._map.latLngToLayerPoint(bounds._northEast);
    var bottom = this._map.latLngToLayerPoint(bounds._southWest);

    if (top.y > 0 || bottom.y < size.y) {
      size.y = bottom.y - top.y;
    }

    var params = {
      bbox: [sw.x, sw.y, ne.x, ne.y].join(','),
      size: size.x + ',' + size.y,
      dpi: 96,
      format: this.options.format,
      transparent: this.options.transparent,
      bboxSR: sr,
      imageSR: sr
    };

    if (this.options.dynamicLayers) {
      params.dynamicLayers = this.options.dynamicLayers;
    }

    if (this.options.layers) {
      params.layers = 'show:' + this.options.layers.join(',');
    }

    if (this.options.layerDefs) {
      params.layerDefs = JSON.stringify(this.options.layerDefs);
    }

    if (this.options.timeOptions) {
      params.timeOptions = JSON.stringify(this.options.timeOptions);
    }

    if (this.options.from && this.options.to) {
      params.time = this.options.from.valueOf() + ',' + this.options.to.valueOf();
    }

    if (this.service.options.token) {
      params.token = this.service.options.token;
    }

    return params;
  },

  _removeImage: function (img) {
    this.getPane(this.options.pane).removeChild(img);
    if (this.options.interactive) {
      this.removeInteractiveTarget(img);
    }
  },

  _forAllSingleImages: function (f) {
    if (this._singleImages) {
      for (var i = 0; i < this._singleImages.length; i++) {
        f.call(this, this._singleImages[i]);
      }
    }
  }

});

L.esri.dynamicMapLayerAdvanced = function (options) {
    return new L.esri.DynamicMapLayerAdvanced (options);
};

