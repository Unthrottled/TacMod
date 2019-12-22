package io.acari.sogos.stream

import com.facebook.react.bridge.*

class StreamModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "Stream"


  @ReactMethod
  fun performGet(
      url: String,
      promise: Promise
  ) {
    val thing  = Arguments.createArray()
    thing.pushString(url)
    promise.resolve(thing)
  }
}