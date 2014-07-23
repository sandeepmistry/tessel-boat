//
//  TBAppDelegate.h
//  TesselBoat
//
//  Created by Sandeep Mistry on 2014-07-22.
//  Copyright (c) 2014 Sandeep Mistry. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreBluetooth/CoreBluetooth.h>


@interface TBAppDelegate : UIResponder <UIApplicationDelegate, CBCentralManagerDelegate, CBPeripheralDelegate>

@property (strong, nonatomic) UIWindow *window;

@end
