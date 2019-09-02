package com.originprotocol.samsungbks;

import java.util.List;
import java.util.ArrayList;
import java.lang.reflect.Field;
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

  @ReactMethod
  public void getAddressList(String hdPath, final Promise promise) {
    ScwService.ScwGetAddressListCallback callback = new ScwService.ScwGetAddressListCallback() {
	@Override
	public void onSuccess(List<String> addressList) {
	    promise.resolve(addressList.get(0));
	}

	@Override
	public void onFailure(int errorCode) {
	    Field[] interfaceFields = ScwErrorCode.class.getFields();
	    Field errorField = null;
	    for (Field f: interfaceFields) {
		try {
		    if (f.getInt(ScwErrorCode.class) == errorCode) {
			errorField = f;
		    }
		} catch (Exception error) {
		    // Skip
		}
	    }

	    if (errorField != null) {
		try {
		    promise.reject(errorField.get(ScwErrorCode.class).toString(), errorField.getName());
		} catch (Exception error) {
		    System.out.println(error);
		    promise.reject("Samsung Blockchain Keystore error " + errorCode);
		}
	    } else {
		promise.reject("Samsung Blockchain Keystore error " + errorCode);
	    }
	}
      };

      ArrayList<String> hdPathList = new ArrayList<>();
      hdPathList.add(hdPath);

      ScwService.getInstance().getAddressList(callback, hdPathList);
  }
}
