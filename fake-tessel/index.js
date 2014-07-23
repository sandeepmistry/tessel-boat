var util = require('util');

var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

console.log('pseudo');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Tessel', ['D752C5FB-1380-4CD5-B0EF-CAC7D72CFF20']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart ' + error);

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'D752C5FB-1380-4CD5-B0EF-CAC7D72CFF20',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '883F1E6B-76F6-4DA1-87EB-6BDBDB617888',
            properties: ['write'],
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('1 onWriteRequest: ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '21819AB0-C937-4188-B0DB-B9621E1696CD',
            properties: ['write'],
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('2 onWriteRequest: ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          })
        ]
      })
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});

bleno.on('servicesSet', function() {
  console.log('on -> servicesSet');
});