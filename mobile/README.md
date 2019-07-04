![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Wallet

[![app-store](https://user-images.githubusercontent.com/273937/52288003-25b7b700-2920-11e9-9c9a-0a76d04e0c99.png)](https://itunes.apple.com/app/origin-wallet/id1446091928)

Read about Origin Wallet [on Medium](https://medium.com/originprotocol/introducing-origin-wallet-decentralized-commerce-goes-mobile-ecb0f41aa543).

Origin Wallet is an "ejected" React Native application. Go [here](https://facebook.github.io/react-native/docs/getting-started.html#installing-dependencies) to read about getting started with React Native. This application was created with the now-archived [Create React Native App](https://github.com/react-community/create-react-native-app).

## Local Development

This guide will help you to install a local build of Origin Wallet on a device or simulator so that you can modify the application itself.

- run `yarn install` to install dependencies
- run `yarn run start`

#### iOS Development

- [Xcode](https://developer.apple.com/xcode/)

- Xcode Command Line Tools: `xcode-select --install`

#### Android Development

- [Android SDK or Android Studio](https://developer.android.com/studio/) - If you're on Linux, find the instructions for your specific distribution

- jre-openjdk

### Backend Services

You can run the backend services required by Origin Wallet using Docker Compose. Please refer to the instructions in our [development documentation](https://github.com/OriginProtocol/origin/blob/master/DEVELOPMENT.md). It is not necessary to run the backend services as you can also use Origin's deployed services by changing the network from the Settings tab.

### Android Device Configuration

If you intend to develop using a physical device rather than a VM, make sure you complete the following.  You can use [the Android developer's guide](https://developer.android.com/studio/run/device) for reference.

- Connect your phone to your machine with a USB cable
- Make sure `JAVA_HOME` points to Android's java (for me, at: `/opt/android-studio/jre/`)
- Run `sdkmanager --licenses` and accept license agreements
- Enable developer mode on your device by tapping "Build number" in settings 7 times.
- Turn on "USB Debugging" in "Developer options"
- Start the adb server `adb start-server`
- Verify your device is recognized with `adb devices`
- Setup TCP tunnels to your device by running `./android/setup_tunnels.sh`. This allows the mobile app to access backend services at `localhost`

### Running Development

To run the mobile app on your phone, you need to both start the Metro builder service, and launch the app on your device.

- Run Metro builder with `yarn run start`
- Compile and build your app with `react-native run-android` or `react-native run-ios`

If you want to use a physical device in combination with the marketplace DApp running on your local machine (i.e. `Localhost` setting in network selection) make sure you set the `HOST` environment variable to your internal network IP address (e.g. 10.10.10.1).

### Tips

> Is there a way to remotely debug the app?

You can access the React-Native remote debugger at http://localhost:8081/debugger-ui/

> How do I access the developer menu in the app?

Shake your phone. Or pretend you did by sending this keycode: `adb shell input keyevent 82`

> Is there a way to trigger a reload on Android?

You can do this from the developer menu, or by running this in your terminal: `adb shell input text "RR"`

> How can I debug the marketplace DApp running in the webview?

On Android you can run developer tools for the page running in the WebView using `chrome://inspect`. On iOS you can use the [Safari develop menu](https://github.com/react-native-community/react-native-webview/issues/69).

### Troubleshooting

> Linker command failed with exit code…

- origin/mobile $ `yarn run ios`
- Close simulator
- In Xcode, Project > Clean Build Folder
- Try again

-----------

Check [the React Native docs](https://facebook.github.io/react-native/docs/troubleshooting).

-----------

📲 Don't forget to have WiFi enabled on your both of your devices and connected.

-----------

> unable to load script from assets index.android.bundle
This is likely a network error because your tunnels are not setup.  See [Android Device Configuration](#android-device-configuration).

-----------

> FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory

Add the `NODE_OPTIONS` env var to your Metro builder startup command to add the `--max_old_space_size` option like this:

    NODE_OPTIONS="--max_old_space_size=8196" yarn run start

-----------

    INSTALL_FAILED_UPDATE_INCOMPATIBLE: Package com.origincatcher signatures do not match previously installed version; ignoring!

Uninstall the app from your phone and try again.
