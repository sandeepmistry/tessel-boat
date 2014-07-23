//
//  TBAppDelegate.h
//  TesselBoat
//
//  Created by Sandeep Mistry on 2014-07-22.
//  Copyright (c) 2014 Sandeep Mistry. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <CoreLocation/CoreLocation.h>

#import "SRWebSocket.h"


@interface TBAppDelegate : UIResponder <UIApplicationDelegate, CBCentralManagerDelegate, CBPeripheralDelegate, SRWebSocketDelegate, CLLocationManagerDelegate>

@property (strong, nonatomic) UIWindow *window;

@end
