//
//  TBAppDelegate.m
//  TesselBoat
//
//  Created by Sandeep Mistry on 2014-07-22.
//  Copyright (c) 2014 Sandeep Mistry. All rights reserved.
//

#import "TBAppDelegate.h"

@interface TBAppDelegate ()

@property CBCentralManager *centralManager;
@property CBPeripheral *tessel;
@property CBCharacteristic *motorCharacteristic;
@property CBCharacteristic *rudderCharacteristic;

@property SRWebSocket *websocket;

@property CLLocationManager *locationManager;

@end

@implementation TBAppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // Override point for customization after application launch.
    application.idleTimerDisabled = YES;
    
    self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil];
    
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.activityType = CLActivityTypeFitness;
    self.locationManager.delegate = self;
    
    return YES;
}
							
- (void)applicationWillResignActive:(UIApplication *)application
{
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central
{
    if (central.state == CBCentralManagerStatePoweredOn) {
        NSLog(@"starting BLE scan ...");
        [self.centralManager scanForPeripheralsWithServices:nil options:nil];
    } else {
        NSLog(@"stopping BLE scan ...");
        [self.centralManager stopScan];
    }
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI
{
    if ([[advertisementData objectForKey:CBAdvertisementDataLocalNameKey] isEqualToString:@"Tessel"]) {
        NSLog(@"discovered Tessel!");
        
        self.tessel = peripheral;
        self.tessel.delegate = self;
        
        NSDictionary *options = @{
                                  CBConnectPeripheralOptionNotifyOnConnectionKey: @YES,
                                  CBConnectPeripheralOptionNotifyOnDisconnectionKey: @YES
                                  };
        
        [self.centralManager connectPeripheral:peripheral options:options];
        
        NSLog(@"stopping BLE scan ...");
        [self.centralManager stopScan];
    }
}

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral
{
    NSLog(@"Tessel connected");
    
    NSArray *services =@[
                         [CBUUID UUIDWithString:@"D752C5FB-1380-4CD5-B0EF-CAC7D72CFF20"]
                         ];
    
    [self.tessel discoverServices:services];
    
    self.websocket = [[SRWebSocket alloc] initWithURL:[NSURL URLWithString:@"ws://192.168.2.10:5000/ios"]];
    
    self.websocket.delegate = self;
    
    [self.websocket open];
}

- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error
{
    NSLog(@"Tessel disconnected");
    self.tessel = nil;
    self.motorCharacteristic = nil;
    self.rudderCharacteristic = nil;
    
    [self.websocket close];
    self.websocket = nil;
    
    NSLog(@"starting BLE scan ...");
    [self.centralManager scanForPeripheralsWithServices:nil options:nil];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error
{
    NSLog(@"discovered tessel services");
    
    CBService *service = peripheral.services.firstObject;
    
    NSArray *characteristics = @[
                                 [CBUUID UUIDWithString:@"883F1E6B-76F6-4DA1-87EB-6BDBDB617888"],
                                 [CBUUID UUIDWithString:@"21819AB0-C937-4188-B0DB-B9621E1696CD"]
                                 ];
    
    [self.tessel discoverCharacteristics:characteristics forService:service];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error
{
    NSLog(@"discovered tessel characteristics");
    
    self.motorCharacteristic = [service.characteristics objectAtIndex:0];
    self.rudderCharacteristic = [service.characteristics objectAtIndex:1];
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error
{
    NSLog(@"value written to tessel");
}

- (void)webSocketDidOpen:(SRWebSocket *)webSocket
{
    NSLog(@"websocket open");
}

- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean
{
    NSLog(@"websocket close");
    
    NSMutableData* data = [NSMutableData dataWithCapacity:0];
    float zero = 50;
    [data appendBytes:&zero length:sizeof(zero)];
    
    [self.tessel writeValue:data forCharacteristic:self.motorCharacteristic type:CBCharacteristicWriteWithResponse];

    [self.tessel writeValue:data forCharacteristic:self.rudderCharacteristic type:CBCharacteristicWriteWithResponse];
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message
{
    NSLog(@"websocket message");
    
    NSError *error = nil;
    NSData *data = [message dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&error];
    
    NSLog(@"%@", json);
    
    NSNumber *motorSpeed = [json objectForKey:@"motorSpeed"];
    if (motorSpeed) {
        NSMutableData* data = [NSMutableData dataWithCapacity:0];
        float m = [motorSpeed floatValue];
        [data appendBytes:&m length:sizeof(m)];

        [self.tessel writeValue:data forCharacteristic:self.motorCharacteristic type:CBCharacteristicWriteWithResponse];
    }
    
    NSNumber *rudderDirection = [json objectForKey:@"rudderDirection"];
    if (rudderDirection) {
        NSMutableData* data = [NSMutableData dataWithCapacity:0];
        float r = [rudderDirection floatValue];
        [data appendBytes:&r length:sizeof(r)];
        
        [self.tessel writeValue:data forCharacteristic:self.rudderCharacteristic type:CBCharacteristicWriteWithResponse];
    }
}

- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status
{
    NSLog(@"location manager authoriazation status = %d", status);
    
    [manager startUpdatingHeading];
    [manager startUpdatingLocation];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateHeading:(CLHeading *)newHeading
{
    NSLog(@"new location heading: %f %f", newHeading.magneticHeading, newHeading.trueHeading);
}

-(void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations
{
    CLLocation *location = locations.firstObject;
    
    NSLog(@"new location: %f %f %f, %f", location.coordinate.longitude, location.coordinate.latitude, location.course, location.speed);
}

@end
