package com.originprotocol.samsungbks;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.samsung.android.sdk.coldwallet.*;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import java.lang.reflect.Field;
import java.math.BigInteger;
import java.util.Base64;
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

  private void onKeystoreFailure(int errorCode, Promise promise) {
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
        promise.reject(
          errorField.get(ScwErrorCode.class).toString(),
          errorField.getName()
        );
      } catch (Exception error) {
        System.out.println(error);
        promise.reject("Samsung Blockchain Keystore error " + errorCode);
      }
    } else {
      promise.reject("Samsung Blockchain Keystore error " + errorCode);
    }
  }

  private static String bytesToHex(final byte[] bytes) {
    final int numBytes = bytes.length;
    final char[] container = new char[numBytes * 2];

    for (int i = 0; i < numBytes; i++) {
      final int b = bytes[i] & 0xFF;

      container[i * 2] = Character.forDigit(b >>> 4, 0x10);
      container[i * 2 + 1] = Character.forDigit(b & 0xF, 0x10);
    }

    return new String(container);
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
    ScwService.ScwCheckForMandatoryAppUpdateCallback callback = new ScwService.ScwCheckForMandatoryAppUpdateCallback() {

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
    ScwService.ScwGetAddressListCallback callback = new ScwService.ScwGetAddressListCallback() {

      @Override
      public void onSuccess(List<String> addressList) {
        promise.resolve(addressList.get(0));
      }

      @Override
      public void onFailure(int errorCode) {
        onKeystoreFailure(errorCode, promise);
      }
    };

    ArrayList<String> hdPathList = new ArrayList<>();
    hdPathList.add(hdPath);

    ScwService.getInstance().getAddressList(callback, hdPathList);
  }

  @ReactMethod
  public void signEthTransaction(
    String hdPath,
    String to,
    String gasPrice,
    String gasLimit,
    String value,
    String data,
    final Promise promise
  ) {
    ScwService.ScwSignEthTransactionCallback callback = new ScwService.ScwSignEthTransactionCallback() {

      @Override
      public void onSuccess(byte[] signedEthTransaction) {
        promise.resolve("0x" + bytesToHex(signedEthTransaction));
      }

      @Override
      public void onFailure(int errorCode) {
        onKeystoreFailure(errorCode, promise);
      }
    };

    RawTransaction transaction = RawTransaction.createTransaction(
      BigInteger.ZERO,
      new BigInteger(gasPrice),
      new BigInteger(gasLimit),
      to,
      new BigInteger(value),
      data
    );
    byte[] encodedUnsignedEthTx = TransactionEncoder.encode(transaction);

    ScwService.getInstance()
      .signEthTransaction(callback, encodedUnsignedEthTx, hdPath);
  }

  @ReactMethod
  public void signEthPersonalMessage(
    String hdPath,
    String b64MessageToSign,
    final Promise promise
  ) {
    ScwService.ScwSignEthPersonalMessageCallback callback = new ScwService.ScwSignEthPersonalMessageCallback() {

      @Override
      public void onSuccess(byte[] signedPersonalMessage) {
        promise.resolve("0x" + bytesToHex(signedPersonalMessage));
      }

      @Override
      public void onFailure(int errorCode) {
        onKeystoreFailure(errorCode, promise);
      }
    };

    byte[] unsignedMessage = Base64.getDecoder().decode(b64MessageToSign);

    ScwService.getInstance()
      .signEthPersonalMessage(callback, unsignedMessage, hdPath);
  }
}
