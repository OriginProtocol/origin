'use strict'

import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet
} from 'react-native'

import OnboardingPage from 'components/onboarding-page'
import OnboardingPagination from 'components/onboarding-pagination'

const IMAGES_PATH = '../../assets/images/'

// hotfix: https://github.com/facebook/react-native/issues/16710
const itemVisibleHotfix = { itemVisiblePercentThreshold: 100 }

class Onboarding extends Component {
  constructor() {
    super()

    this.state = {
      currentPage: 0,
      previousPage: null
    }
  }

  onSwipePageChange = ({ viewableItems }) => {
    if (!viewableItems[0] || this.state.currentPage === viewableItems[0].index)
      return

    this.setState(state => {
      this.props.pageIndexCallback &&
        this.props.pageIndexCallback(viewableItems[0].index)
      return {
        previousPage: state.currentPage,
        currentPage: viewableItems[0].index
      }
    })
  }

  goNext = () => {
    this.flatList.scrollToIndex({
      animated: true,
      index: this.state.currentPage + 1
    })
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({ item }) => {
    const { image, title, subtitle } = item
    const { width } = Dimensions.get('window')

    return (
      <OnboardingPage
        height={'100%'}
        image={image}
        subtitle={subtitle}
        title={title}
        width={width}
      />
    )
  }

  render() {
    const {
      controlStatusBar,
      pages,
      onCompletion,
      onEnable
    } = this.props
    const { width } = Dimensions.get('window')

    return (
      <Animated.View style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        <SafeAreaView style={{ alignItems: 'center', width }}>
          <Image source={require(IMAGES_PATH + 'origin-logo-light.png')} />
        </SafeAreaView>
        <FlatList
          ref={list => {
            this.flatList = list
          }}
          data={pages}
          pagingEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          onViewableItemsChanged={this.onSwipePageChange}
          viewabilityConfig={itemVisibleHotfix}
          initialNumToRender={1}
        />
        <SafeAreaView>
          <OnboardingPagination
            currentPage={this.state.currentPage}
            controlStatusBar={controlStatusBar}
            pagesCount={pages.length}
            onCompletion={onCompletion}
            onEnable={onEnable}
            onNext={this.goNext}
          />
        </SafeAreaView>
      </Animated.View>
    )
  }
}

export default Onboarding

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#293f55',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: '5%',
    paddingTop: 56
  }
})
