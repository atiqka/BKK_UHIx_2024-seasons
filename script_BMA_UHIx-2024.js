// =========================================================
// Bangkok UHIx Seasonal Mapping (2024)
// Landsat 9 Collection 2 Level 2. 
// Author: Atiq Kainan Ahmed. Email: atiqka@yahoo.com
// =========================================================

// 1. Load your BMA districts asset
var bma = ee.FeatureCollection('projects/atiq-project-july2025/assets/BMA_districts');

Map.centerObject(bma, 10);
Map.addLayer(bma, {color: 'black'}, 'Bangkok Boundary');

// 2. Thailand climatological seasons
var seasonDefs = {
  'Cool':  ['11', '12', '01', '02'],
  'Hot':   ['03', '04', '05'],
  'Rainy': ['06', '07', '08', '09', '10']
};

// 3. UHIx computation function
var computeUHIx = function(image) {
  // Land Surface Temperature (°C)
  var tempC = image.select('ST_B10')
    .multiply(0.00341802)
    .add(149.0)
    .subtract(273.15)
    .rename('Temp_C');

  // NDVI
  var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4'])
    .rename('NDVI');

  // Approximate Relative Humidity Proxy
  var rh = ndvi.multiply(60)
    .add(30)
    .rename('RH');

  // Heat Index (°C)
  var heatIndex = tempC.expression(
    '-8.784695 + 1.61139411*T + 2.338549*RH - 0.14611605*T*RH ' +
    '- 0.012308094*T*T - 0.016424828*RH*RH + 0.002211732*T*T*RH ' +
    '+ 0.00072546*T*RH*RH - 0.000003582*T*T*RH*RH',
    {
      T: tempC,
      RH: rh
    }
  ).rename('Heat_Index_C');

  return heatIndex.copyProperties(image, ['system:time_start']);
};

// 4. Process each season
Object.keys(seasonDefs).forEach(function(seasonName) {
  var months = seasonDefs[seasonName];

  var imageList = months.map(function(month) {
    month = ee.String(month);

    // Cool season (Nov–Dec) belongs to previous calendar year
    var year = ee.Number(2024);
    year = ee.Number(ee.Algorithms.If(month.equals('11'), 2023, year));
    year = ee.Number(ee.Algorithms.If(month.equals('12'), 2023, year));

    var start = ee.Date.fromYMD(year, ee.Number.parse(month), 1);
    var end   = start.advance(1, 'month');

    return ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
      .filterBounds(bma)
      .filterDate(start, end)
      .filter(ee.Filter.lt('CLOUD_COVER', 20))
      .map(computeUHIx);
  });

  // Flatten the list of collections into one ImageCollection
  var flatList = ee.List(imageList).iterate(
    function(ic, list) {
      return ee.List(list).cat(ee.ImageCollection(ic).toList(200));
    },
    ee.List([])
  );

  var seasonCollection = ee.ImageCollection.fromImages(ee.List(flatList));
  
  // Print how many images were found for this season
  print(seasonName + ' image count:', seasonCollection.size());

  var seasonMean = seasonCollection.mean().clip(bma);

  // Visualization
  Map.addLayer(
    seasonMean,
    {
      min: 25,
      max: 50,
      palette: [
        '440154', '3b528b', '21918c', '5ec962',
        'fde725', 'f7943d', 'cf4446', '9e0142'
      ]
    },
    seasonName + ' 2024'
  );

  // Export to Google Drive
  Export.image.toDrive({
    image: seasonMean,
    description: 'Bangkok_UHIx_' + seasonName + '_Mean_2024_LC09',
    folder: 'EarthEngineExports',
    fileNamePrefix: 'Bangkok_UHIx_' + seasonName + '_Mean_2024_LC09',
    scale: 30,
    region: bma.geometry().bounds(),
    maxPixels: 1e13,
    crs: 'EPSG:4326'
  });

  print(' Export task created for ' + seasonName + ' UHIx composite (2024)');
});


