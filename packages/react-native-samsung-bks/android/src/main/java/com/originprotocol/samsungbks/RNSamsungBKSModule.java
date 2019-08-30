package com.originprotocol.samsungbks;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.samsung.android.sdk.coldwallet.*;

public class RNSamsungBKSModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public RNSamsungBKSModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "RNSamsungBKS";
  }

  @ReactMethod
  public void isSupported(Promise promise) {
      promise.resolve(ScwService.getInstance() != null);
  }

  @ReactMethod
  public void getKeystoreApiLevel(Promise promise) {
      int keystoreApiLevel = ScwService.getInstance().getKeystoreApiLevel();
      promise.resolve(keystoreApiLevel);
  }

  @ReactMethod
  public void getSeedHash(Promise promise) {
      String seedHash = ScwService.getInstance().getSeedHash();
      promise.resolve(seedHash);
  }
}
