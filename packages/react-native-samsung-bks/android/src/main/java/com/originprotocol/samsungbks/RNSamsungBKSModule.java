package com.originprotocol.samsungbks;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.samsung.android.sdk.coldwallet.*;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

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
  public void checkForMandatoryAppUpdate(final Promise promise) {
    ScwService.ScwCheckForMandatoryAppUpdateCallback callback =
        new ScwService.ScwCheckForMandatoryAppUpdateCallback() {
          @Override
          public void onMandatoryAppUpdateNeeded(boolean needed) {
            if (needed) {
              promise.resolve(ScwDeepLink.GALAXY_STORE);
            } else {
              promise.resolve(false);
            }
          }
        };

    ScwService.getInstance().checkForMandatoryAppUpdate(callback);
  }

  @ReactMethod
  public void getDeepLinks(Promise promise) {
    Field[] interfaceFields = ScwDeepLink.class.getFields();

    WritableMap links = new WritableNativeMap();
    for (Field f : interfaceFields) {
      try {
        links.putString(f.getName(), f.get(ScwDeepLink.class).toString());
      } catch (Exception error) {
        // Skip
      }
    }

    promise.resolve(links);
  }

  @ReactMethod
  public void getAddressList(String hdPath, final Promise promise) {
    ScwService.ScwGetAddressListCallback callback =
        new ScwService.ScwGetAddressListCallback() {
          @Override
          public void onSuccess(List<String> addressList) {
            promise.resolve(addressList.get(0));
          }

          @Override
          public void onFailure(int errorCode) {
            Field[] interfaceFields = ScwErrorCode.class.getFields();
            Field errorField = null;
            for (Field f : interfaceFields) {
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

  @ReactMethod
  public void signEthTransaction(
      String hdPath,
      String toAddress,
      String ethAmount,
      string ethGasPrice,
      String ethGasLimit,
      String data,
      final Promise promise) {
    ScwService.ScwSignEthTransactionCallback callback =
        new ScwService.ScwSignEthTransactionCallback() {
          @Override
          public void onSuccess(byte[] signedEthTransaction) {}

          @Override
          public void onFailure(int errorCode) {}
        };

    byte[] encodedUnsignedEthTx =
        createRawTransaction(toAddress, ethAmount, ethGasPrice, ethGasLimit, data);

    // private byte[] createRawTransaction () {
    // }

    ScwService.getInstance().signEthTransaction(callback, encodedUnsignedEthTx, hdPath);
  }

  @ReatMethod
  public void signEthPersonalMessage(String hdPath, Promise promise) {
    ScwService.ScwSignEthPersonalMessageCallback callback =
        new ScwService.ScwSignEthPersonalMessageCallback() {
          @Override
          public void onSuccess(byte[] signedPersonalMessage) {}

          @Override
          public void onFailure(int errorCode) {}
        };

    byte[] unSignedMsg = "To sign up, please sign this message.".getBytes();

    ScwService.getInstance().signEthPersonalMessage(callback, unSignedMsg, hdPath);
  }
}
