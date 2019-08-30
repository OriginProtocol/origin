
# react-native-react-native-sbksdk

## Getting started

`$ npm install react-native-react-native-sbksdk --save`

### Mostly automatic installation

`$ react-native link react-native-react-native-sbksdk`

### Manual installation


#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNReactNativeSbksdkPackage;` to the imports at the top of the file
  - Add `new RNReactNativeSbksdkPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-react-native-sbksdk'
  	project(':react-native-react-native-sbksdk').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-react-native-sbksdk/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-react-native-sbksdk')
  	```


## Usage
```javascript
import RNReactNativeSbksdk from 'react-native-react-native-sbksdk';

// TODO: What to do with the module?
RNReactNativeSbksdk;
```
  