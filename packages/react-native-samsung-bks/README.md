# react-native-samsung-bks

## Getting started

`$ npm install react-native-samsung-bks --save`

### Mostly automatic installation

`$ react-native link react-native-samsung-bks`

Add the following into the root project `build.gradle`

```
allprojects {
    ...
    repositories {
        ...
        flatDir {
            dirs "$rootDir/../node_modules/react-native-samsung-bks/android/aar"
        }
    }
}
```

### Manual installation


#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNSamsungBKS;` to the imports at the top of the file
  - Add `new RNSamsungBKS()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-samsung-bks'
  	project(':react-native-samsung-bks').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-react-native-sbksdk/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      implementation project(':react-native-samsung-bks')
  	```
4. Add the following into the root project `build.gradle`

```
allprojects {
    ...
    repositories {
        ...
        flatDir {
            dirs "$rootDir/../node_modules/react-native-samsung-bks/android/aar"
        }
    }
}
```


## Usage
```javascript
import RNSamsungBKS from 'react-native-samsung-bks';

// TODO: What to do with the module?
```
