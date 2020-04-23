const express = require('express');
const app = express();

const fs = require('fs');

var geo_data = null;

fs.readFile('./data/records.json', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  geo_data = JSON.parse(data.toString());
})

function toRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}


function distance(lat1, lon1, lat2, lon2) {
  
  var R = 6371e3; // metres
  var a1 = toRadians(lat1);
  var a2 = toRadians(lat2);
  var dP = toRadians(lat2-lat1);
  var dL = toRadians(lon2-lon1);

  var a = Math.sin(dP/2) * Math.sin(dP/2) +
          Math.cos(a1) * Math.cos(a2) *
          Math.sin(dL/2) * Math.sin(dL/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;

  return d;
}

function resolveServer(host){

  var records = [];

  var spl = host.split('.');
  if (typeof spl[0] !== 'undefined' && spl[0]=='geo') {

      var lat = parseFloat(spl[1].replace('m','-')+"."+spl[2]);
      var lon = parseFloat(spl[3].replace('m','-')+"."+spl[4]);

      var dist = spl[5];

      console.log(geo_data);
      
      geo_data.records.map(record => {

        var rel_distance = distance(lat, lon, record.geocoordinates.lat, record.geocoordinates.lon);
        if (rel_distance<dist) {
          records.push(record);
        }

      });

  }

  return records;

}

app.get('/', (req, res) => {

  var host = req.headers.host;
  var origin = req.headers.origin;

  var data = {
    host : host,
    records : resolveServer(host)
  };

  res.send(JSON.stringify(data));

});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});